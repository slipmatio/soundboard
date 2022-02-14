# Slipmat Soundboard

An opinionated template for running Python with Electron. Uses TypeScript, Vue 3, and Vite for bundling. Based on [vite-electron-builder](https://github.com/cawa-93/vite-electron-builder) by Alex Kozack and [datasette-app](https://github.com/simonw/datasette-app) by Simon Willison.

The JavaScript/TypeScript parts are configured to work as closely with Vue best practises, and they follow the same principles than my [vite-ts-tailwind-starter](https://github.com/Uninen/vite-ts-tailwind-starter).

## Getting started

#### Install Dependencies

- Install wget: `brew install wget`
- Install Python: `./downloadPython`
- Install Electron dependencies: `yarn`

#### Start Development Environment

`yarn watch`

#### Run Tests

`yarn test`
#### Compile As App For Current Platform

`yarn compile[arm|x64]` or `yarn compilemac`

For macOS, you can [disable code signing](https://www.electron.build/code-signing#how-to-disable-code-signing-during-the-build-process-on-macos) to speed up the dev cycle.
#### Compile As Production Apps

Merge a PR to master, GitHub Actions will kick in and build the app.
## Project Structure

The entire source code of the program is divided into three modules (packages) that are bundled each independently:
- [`packages/main`](packages/main): 
Electron [**main script**](https://www.electronjs.org/docs/tutorial/quick-start#create-the-main-script-file).
- [`packages/preload`](packages/preload): 
Used in `BrowserWindow.webPreferences.preload`. See [Checklist: Security Recommendations](https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content).
- [`packages/renderer`](packages/renderer): 
Electron [**web page**](https://www.electronjs.org/docs/tutorial/quick-start#create-a-web-page).


## Configuration

- Create following environment variables (in `.env` in development and as CI secrets for GH actions):
  - `APPLE_ID`: your developer Apple ID
  - `APPLE_APP_SPECIFIC_PASSWORD`: app specific password for signing and notarization ([create here](https://appleid.apple.com/account/home))
  - `CSC_KEY_PASSWORD`: your password for the CSC key (exported .p12 cert)
  - `CSC_LINK`: base64 hash of your .p12 cert (create w/ `openssl base64 -in my-cert.p12`)
- Add needed [App Sandbox Entitlement Keys](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html) in `buildResources/entitlements.mac.plist`
