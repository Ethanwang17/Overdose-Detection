// Adopts the UIScene life cycle during `expo prebuild`.
// iOS 27 refuses to launch apps without it ("Application failed to launch: UIScene life cycle"),
// and Expo SDK 55's AppDelegate template still starts React Native in a window-based app.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const MARKER = '// withSceneLifecycle';

const WINDOW_START = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;

const SCENE_DELEGATE = `${MARKER}
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    appDelegate.reactNativeFactory?.startReactNative(withModuleName: "main", in: window, launchOptions: nil)
    if let url = connectionOptions.urlContexts.first?.url {
      _ = appDelegate.application(UIApplication.shared, open: url, options: [:])
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    _ = appDelegate.application(UIApplication.shared, open: url, options: [:])
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    _ = appDelegate.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }
}

`;

module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });

  config = withAppDelegate(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (contents.includes(MARKER)) return cfg;
    if (cfg.modResults.language !== 'swift' || !contents.includes(WINDOW_START)) {
      throw new Error('withSceneLifecycle: AppDelegate.swift does not match the expected Expo template');
    }
    contents = contents.replace(
      WINDOW_START,
      '    // React Native is started from SceneDelegate (iOS 27 requires the UIScene life cycle).\n'
    );
    contents = contents.replace('class ReactNativeDelegate', `${SCENE_DELEGATE}class ReactNativeDelegate`);
    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
};
