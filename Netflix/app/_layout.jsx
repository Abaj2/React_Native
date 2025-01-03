import { Slot } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import AppNavigation from "./navigation/appNavigation";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { TailwindProvider } from "tailwindcss-react-native";

export default function App() {
  return (
      <AppNavigation />
  );
}

export { Slot };