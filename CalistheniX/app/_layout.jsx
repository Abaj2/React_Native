import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Home as HomeIcon, Dumbbell, User, History } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import SignIn from "./auth/signIn.jsx";
import SignUp from "./auth/signUp.jsx";
import Home from "./Home.jsx";
import WorkoutSession from "./workoutSession.jsx";
import WorkoutsMain from "./workoutsMain.jsx";
import ProgressPage from "../components/progress.jsx";
import CustomWorkout from "../components/customWorkout.jsx";
import HistoryMain from "./historyMain.jsx";
import SettingsMain from "./settingsMain.jsx";
import ProfileScreen from "./profileScreen.jsx";
import ProfileSettings from "./settingsPages/profileSettings.jsx";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "flex",
          backgroundColor: "#000000",
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "black",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,

          elevation: 5,
        },
        tabBarActiveTintColor: "#FF7900",
        tabBarInactiveTintColor: "#8E8E93",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["orange", "red"]}
              style={{ height: 3 }}
            />
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <HomeIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsMain}
        options={{
          tabBarLabel: "Workouts",
          tabBarIcon: ({ color, size, focused }) => (
            <Dumbbell size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/*<Tab.Screen
        name="History"
        component={HistoryMain}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <History size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

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
    return <View />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Sign-in"
        options={{ headerShown: false, gestureEnabled: false }}
        component={SignIn}
      />
      <Stack.Screen
        name="Sign-up"
        options={{ headerShown: false, gestureEnabled: false }}
        component={SignUp}
      />
      <Stack.Screen
        name="Home"
        options={{ headerShown: false, gestureEnabled: false }}
        component={TabNavigator}
      />
      <Stack.Screen
        name="Workout-Session"
        options={{ headerShown: false }}
        component={WorkoutSession}
      />
      <Stack.Screen
        name="custom-workout"
        options={{ headerShown: false }}
        component={CustomWorkout}
      />
     {/* <Stack.Screen
        name="History-Main"
        options={{ headerShown: false }}
        component={HistoryMain}
      /> */}
      <Stack.Screen
        name="Settings-Main"
        options={{ headerShown: false }}
        component={SettingsMain}
      />
      <Stack.Screen
        name="Profile"
        options={{ headerShown: false }}
        component={ProfileScreen} />

      <Stack.Screen
        name="ProfileSettings"
        options={{ headerShown: false }}
        component={ProfileSettings} />
    </Stack.Navigator>
  );
}
