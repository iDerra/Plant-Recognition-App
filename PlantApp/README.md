This is a [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start
```

## Step 2: Build and run the app

With Metro running, open a new terminal window/pane from the root of the React Native project, and use the following command to build and run the Android app:

### Android

```sh
# Using npm
npm run android
```

If everything is set up correctly, you should see the app running in the Android Emulator or your connected device.

This is one way to run the app — you can also build it directly from Android Studio or Xcode.

# Troubleshooting

If you have problems seeing the react-native icons in the App, add the following line of code to android/app/build.gradle at the end of android{}:

```sh
android {

    ...

    apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
}
```

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.