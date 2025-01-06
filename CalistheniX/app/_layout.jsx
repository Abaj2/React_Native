import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

import SignIn from "./auth/signIn.jsx";
import SignUp from "./auth/signUp.jsx";
import Home from "./Home.jsx";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Sign-in");

  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      if (token) {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setInitialRoute("Home");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <View />; // Or a loading spinner
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Sign-in"
        options={{ headerShown: false, gesturedEnabled: false }}
        component={SignIn}
      />
      <Stack.Screen
        name="Sign-up"
        options={{ headerShown: false, gesturedEnabled: false }}
        component={SignUp}
      />
      <Stack.Screen
        name="Home"
        options={{ headerShown: false, gesturedEnabled: false }}
        component={Home}
      />
    </Stack.Navigator>
  );
}
