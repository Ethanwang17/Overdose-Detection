// Raises the iOS deployment target for the app and every pod during `expo prebuild`.
// Xcode 27 rejects targets below iOS 15, and Expo SDK 55 modules require iOS 16.
const fs = require('fs');
const path = require('path');
const { withDangerousMod, withPodfileProperties, withXcodeProject } = require('expo/config-plugins');

const MARKER = '# withIosDeploymentTarget';

module.exports = function withIosDeploymentTarget(config, { target = '16.0' } = {}) {
  // Podfile `platform :ios, ...` reads this value.
  config = withPodfileProperties(config, (cfg) => {
    cfg.modResults['ios.deploymentTarget'] = target;
    return cfg;
  });

  // App target in the .xcodeproj.
  config = withXcodeProject(config, (cfg) => {
    const configs = cfg.modResults.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configs)) {
      const settings = configs[key].buildSettings;
      if (settings && settings.IPHONEOS_DEPLOYMENT_TARGET) {
        settings.IPHONEOS_DEPLOYMENT_TARGET = target;
      }
    }
    return cfg;
  });

  // Pods that declare an older minimum in their podspec.
  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(MARKER)) {
        const hook = 'post_install do |installer|';
        if (!contents.includes(hook)) {
          throw new Error('withIosDeploymentTarget: post_install block not found in Podfile');
        }
        contents = contents.replace(
          hook,
          `${hook}
    ${MARKER}
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |c|
        c.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "${target}" if c.build_settings["IPHONEOS_DEPLOYMENT_TARGET"].to_f < ${target}
      end
    end`
        );
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);

  return config;
};
