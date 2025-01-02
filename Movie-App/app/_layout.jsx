import { Slot } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import AppNavigation from "./navigation/appNavigation";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";

// Import your global CSS file
import "./global.css";
import { TailwindProvider } from "tailwindcss-react-native";

export default function App() {
  return (
    <TailwindProvider>
      <AppNavigation />
    </TailwindProvider>
  );
}

export { Slot };
