# Three Bearings Offline

Native Expo version of Three Bearings. It does not call the old API server and
does not need an account or internet connection for journaling, questions,
library notes, analytics, or settings.

## Local data

AsyncStorage stores all user-created information on the device: daily scores,
question answers, tags, notes, micro-actions, library responses, and preferences.
The question library and its hints are bundled with the app in
`data/translations.ts`.

Android's **Clear cache** action does not erase AsyncStorage. **Clear storage**
or uninstalling the app does erase it. There is no automatic cloud backup.

## Android package

The static Expo configuration is in `app.json`; Android and iOS application
identifiers are `com.threebearings.offline`. `eas.json` includes an `apk` build
profile that produces an installable APK for internal distribution.

## Preview

Run the configured Expo workflow in Replit, then open the mobile preview or scan
its QR code with Expo Go. The project can also be opened as an Expo app locally.
