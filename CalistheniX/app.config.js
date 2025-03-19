import "dotenv/config";

export default {
  name: "YourAppName",
  slug: "your-app-slug",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.yourappname",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.yourcompany.yourappname",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  // This is where you add your environment variables
  extra: {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECTID,
    databseUrl: process.env.DATABASEURL,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID,
    awsAccessKey: process.env.AWSACCESS,
    awsSecretKey: process.env.AWSSECRET,
    awsRegion: process.env.AWSREGION,
    awsBucket: process.env.AWSBUCKET,
    // Add any other variables you need
  },
};
