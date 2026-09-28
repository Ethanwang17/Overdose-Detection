# Running on the iOS Simulator

Haven Monitor uses native modules (`react-native-health` for HealthKit), so it **will not run in Expo Go**. You need a development build, compiled with Xcode.

## Prerequisites

- macOS with Xcode installed (`xcode-select -p` should print `/Applications/Xcode.app/Contents/Developer`)
- An iOS simulator runtime (Xcode → Settings → Components)
- Node (LTS recommended), CocoaPods (`brew install cocoapods`), Watchman (`brew install watchman`)
- `.env` filled in with Supabase credentials (see the main README)

All commands below run from `haven-monitor/`, **not** the repo root. The root folder is an older prototype.

## 1. Install and generate the native project

```bash
npm install
npx expo prebuild -p ios
```

This creates `ios/` (git-ignored) and runs `pod install`.

## 2. Xcode 27+: raise the iOS deployment target to 16.0

Xcode 27 refuses to build targets below iOS 15, and Expo SDK 55 modules require iOS 16. Skip this step on older Xcode versions.

In `ios/Podfile`, inside `post_install do |installer|`, after the `react_native_post_install(...)` call, add:

```ruby
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |c|
        c.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "16.0" if c.build_settings["IPHONEOS_DEPLOYMENT_TARGET"].to_f < 16.0
      end
    end
```

Then bump the app target and reinstall pods:

```bash
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 15.1;/IPHONEOS_DEPLOYMENT_TARGET = 16.0;/g' ios/HavenMonitor.xcodeproj/project.pbxproj
cd ios && pod install && cd ..
```

These edits live in `ios/`, so redo them after any `expo prebuild --clean`.

## 3. Start Metro

```bash
npx expo start
```

Leave this running in its own terminal.

## 4. Build and run from Xcode

```bash
open ios/HavenMonitor.xcworkspace
```

Open the `.xcworkspace`, not the `.xcodeproj`. Pick an iPhone simulator in the toolbar and press **Run (▶)**. The first build takes a few minutes. After that, JS changes hot-reload through Metro and you only rebuild after native changes.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npx expo run:ios` fails with "Can't determine id of Simulator app" | Xcode 27 no longer ships `Simulator.app`, so Expo's CLI can't open it. Running `sudo xcode-select` won't help. Use step 4 (Xcode ▶) instead. |
| `deployment target ... is set to 9.0/12.4/13.4, but the range ... is 15.0 to 27.0` | Do step 2. |
| `'subtitle' is only available in iOS 16.0` or `module 'Expo' has a minimum deployment target of iOS 16.0` | Step 2 wasn't fully applied: check both the Podfile edit and the `.pbxproj` bump. |
| App opens to a black screen, or simulator commands hang | Run `xcrun simctl shutdown all`, make sure Metro is running, then press Run in Xcode again. |
| Login and data don't work | `.env` is missing the Supabase URL and anon key. Restart Metro after editing it. |
