// app.config.js
const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  expo: {
    name: IS_DEV ? "THE SYSTEM [DEV]" : "THE SYSTEM",
    slug: "solo-leveling-system",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    updates: {
      url: "https://u.expo.dev/1ba39cc8-33f0-490b-8912-c7a335a757d3",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: IS_DEV
        ? "com.anonymous.sololevelingsystem.dev"
        : "com.anonymous.sololevelingsystem",
      adaptiveIcon: {
        backgroundColor: "#000000",
        foregroundImage: "./assets/icon.png",
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_SLEEP",
        "android.permission.health.READ_ACTIVE_CALORIES_BURNED",
        "android.permission.health.READ_HEART_RATE",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "react-native-health-connect",
        {
          isStandaloneApp: true,
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 26,
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "1ba39cc8-33f0-490b-8912-c7a335a757d3",
      },
    },
  },
};
