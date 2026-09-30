# Running on the iOS Simulator

Haven Monitor uses native modules (`react-native-health` for HealthKit), so it **will not run in Expo Go**. You need a development build, compiled with Xcode. Don't scan the QR code or press `i` in Metro; build and launch from Xcode instead (step 5).

All commands run from `haven-monitor/`, **not** the repo root. The root folder is an older prototype.

## Prerequisites

- macOS with Xcode installed (`xcode-select -p` should print `/Applications/Xcode.app/Contents/Developer`)
- An iOS simulator runtime (Xcode → Settings → Components)
- Node (LTS), CocoaPods (`brew install cocoapods`), Watchman (`brew install watchman`)
- A UTF-8 shell locale. CocoaPods crashes without one. Add this to `~/.zshrc` and open a new terminal:
  ```bash
  export LANG=en_US.UTF-8
  ```

## First-time setup (after cloning)

### 1. Install dependencies

```bash
cd Overdose-Detection/haven-monitor
npm install
```

npm prints deprecation and audit warnings. They're safe to ignore.

### 2. Add Supabase credentials

```bash
cp .env.example .env
```

Open `.env` and fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Supabase dashboard → Project Settings → API). Ask a teammate for the shared project's values. Without them the app opens, but sign-in and data won't work.

### 3. Generate the native iOS project

```bash
npx expo prebuild -p ios
```

This creates `ios/` (git-ignored, never committed) and runs `pod install`. Two local config plugins in `plugins/` run automatically during this step, so there's nothing to edit by hand:

- `withIosDeploymentTarget.js` sets iOS 16.0 as the minimum for the app and every pod. Xcode 27 rejects targets below iOS 15, and Expo SDK 55 requires 16. This is the *minimum* supported version; the app still runs on the latest iOS.
- `withSceneLifecycle.js` adopts the UIScene life cycle, which iOS 27 requires to launch the app.

### 4. Start Metro

```bash
npx expo start --dev-client
```

Leave this running in its own terminal. If it asks to use port 8082 because 8081 is busy, answer **n**. An old Metro is still running; stop it (Ctrl+C in its terminal, or `kill <pid>` using the pid it prints) and start again.

### 5. Build and run from Xcode

In a second terminal:

```bash
open ios/HavenMonitor.xcworkspace
```

Open the `.xcworkspace`, not the `.xcodeproj`. Pick an iPhone simulator in the toolbar and press **Run (▶)**. Xcode boots the simulator, installs the app, and connects it to Metro. The first build takes a few minutes; the app should open to the sign-in screen. On a fresh clone Metro also needs a minute to build the first JS bundle. If you see "Could not connect to development server", tap **Reload**.

## Day-to-day

- **JS/TS changes:** just save. The app hot-reloads, or press `r` in the Metro terminal.
- **Native changes** (new native package, edits to `app.json` or `plugins/`): run `npx expo prebuild -p ios --clean`, then press ▶ again.
- **After pulling:** if `app.json`, `plugins/`, or native dependencies changed, run `npm install` and `npx expo prebuild -p ios --clean`. Any hand edits in `ios/` are wiped by `--clean`; put native changes in a config plugin instead.
- **Run one simulator at a time.** Having several booted at once can make Xcode and simulator commands hang.
- **Let Xcode boot and stop simulators.** Don't press Start in the simulator window while Xcode is launching the app.

## Troubleshooting

| Problem | Fix |
|---|---|
| `pod install` crashes with `Unicode Normalization not appropriate for ASCII-8BIT` | Set a UTF-8 locale (see Prerequisites), open a new terminal, then run `cd ios && pod install`. |
| `npx expo run:ios` or pressing `i` fails with "Can't determine id of Simulator app" | Xcode 27 no longer ships `Simulator.app`, so Expo's CLI can't open it. `sudo xcode-select` won't help. Use Xcode ▶ (step 5). |
| `deployment target ... is set to 9.0/12.4/13.4, but the range ... is 15.0 to 27.0`, or `module 'Expo' has a minimum deployment target of iOS 16.0` | Your `ios/` predates the plugins. Run `npx expo prebuild -p ios --clean`. |
| App stuck on the splash screen, or logs show `Application failed to launch: UIScene life cycle` | Same: run `npx expo prebuild -p ios --clean` and rebuild. |
| Red screen: "Could not connect to development server" | Metro wasn't running yet, or was still building the first bundle (slow on a fresh clone). Make sure `npx expo start --dev-client` is running, then tap **Reload** or press `r` in Metro. |
| Black screen, or Xcode hangs on "Launching HavenMonitor" | Make sure Metro is running. Run `xcrun simctl shutdown all`, then press ▶ again. |
| `Unable to boot device in current state: Booted` | Xcode and the simulator disagree about its state. Run `xcrun simctl shutdown all`, quit Xcode (⌘Q), reopen the workspace, press ▶. A Mac restart clears it if it persists. |
| Simulator window shows the phone off with a Start button while the app is running | The viewer lost its connection. Quit it (⌘Q) and reopen it from Xcode's Window menu. |
| Can't type in text fields | Click the field, then press ⇧⌘K to connect the hardware keyboard (or ⌘K for the on-screen keyboard). A `Keyboard queue task timeout` log line is harmless. |
| Sign-in and data don't work | `.env` is missing the Supabase URL or anon key. Restart Metro after editing it. |
| Xcode console full of `statusBarStyle ... deprecated`, `is implemented in both`, `Connection refused` on port 8097 | Normal debug-build noise, not errors. Watch the Metro terminal for real JS errors. |
