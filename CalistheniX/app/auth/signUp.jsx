import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, FontAwesome } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import jwt_decode from "jwt-decode";

import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/signup",
  ios: "http://192.168.1.155:4005/signup",
});

const SignUp = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9._]{3,15}$/;

  const isTokenExpired = (token) => {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !username || !password || !confirmPassword || !name) {
      Alert.alert("Enter all your details");
      return;
    }

    if (!usernameRegex.test(username)) {
      Alert.alert("Invalid username");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid email");
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    setIsLoading(true);


    try {
      const response = await axios.post(SERVER_URL, {
        email,
        username,
        password,
        confirmPassword,
        name,
      });

      if (response.status === 201) {
        console.log("User signed up:", response.data);
        await AsyncStorage.setItem("jwtToken", response.data.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            username: response.data.user.username,
            email: response.data.user.email,
            user_id: response.data.user.user_id,
            name: response.data.user.name,
          })
        );
        const username = response.data.user.username;
        const email = response.data.user.email;
        const user_id = response.data.user.user_id;
        const name = response.data.user.name;
        navigation.navigate("Home", { email, username, user_id, name });
      }
    } catch (err) {
      if (err.response) {
        handleError(err.response.status);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleError = (status) => {
    const messages = {
      409: "An account with that email already exists",
      500: "Unexpected error. Please try again",
      408: "Passwords do not match",
      407: "Invalid email",
      406: "Enter all your details",
      405: "Invalid username",
      404: "Username already exists, choose another one",
    };
    Alert.alert(messages[status] || "Network error. Please try again later");
  };
  return (
    <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1`}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`flex-grow px-5 py-6`}
          >
           
            <View style={tw`items-center mb-6`}>
              <Text style={tw`text-4xl font-black text-white`}>
                Calistheni<Text style={tw`text-orange-500`}>X</Text>
              </Text>
              <Text style={tw`text-sm text-zinc-400 mt-1`}>
                Track your calisthenics progress
              </Text>
            </View>

          
            <View
              style={tw`bg-zinc-900 rounded-2xl p-5 border border-zinc-800 shadow-lg`}
            >
              <Text style={tw`text-2xl font-bold text-white mb-2`}>
                Create an account
              </Text>
              <Text style={tw`text-zinc-400 text-sm mb-5`}>
                Enter your details to access your account
              </Text>

             
              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>
                Email
              </Text>
              <View
                style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-4 border border-zinc-700`}
              >
                <MaterialIcons
                  name="mail-outline"
                  size={20}
                  color="#f97316"
                  style={tw`mr-3`}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  placeholder="your@email.com"
                  placeholderTextColor="#71717a"
                  style={tw`flex-1 text-white`}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>
                Name
              </Text>
              <View
                style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-4 border border-zinc-700`}
              >
                <MaterialIcons
                  name="person"
                  size={20}
                  color="#f97316"
                  style={tw`mr-3`}
                />
                <TextInput
                  value={name}
                  onChangeText={(text) => setName(text)}
                  placeholder="Enter your name"
                  placeholderTextColor="#71717a"
                  style={tw`flex-1 text-white`}
                />
              </View>

              
              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>
                Username
              </Text>
              <View
                style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-4 border border-zinc-700`}
              >
                <MaterialIcons
                  name="person"
                  size={20}
                  color="#f97316"
                  style={tw`mr-3`}
                />
                <TextInput
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                  placeholder="Choose a username"
                  placeholderTextColor="#71717a"
                  style={tw`flex-1 text-white`}
                />
              </View>

             
              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>
                Password
              </Text>
              <View
                style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-4 border border-zinc-700`}
              >
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#f97316"
                  style={tw`mr-3`}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  placeholder="Enter password"
                  placeholderTextColor="#71717a"
                  secureTextEntry={true}
                  style={tw`flex-1 text-white`}
                  autoCapitalize="none"
                />
                <TouchableOpacity>
                  <MaterialIcons
                    name="visibility-off"
                    size={20}
                    color="#71717a"
                  />
                </TouchableOpacity>
              </View>

              
              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>
                Confirm Password
              </Text>
              <View
                style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-5 border border-zinc-700`}
              >
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#f97316"
                  style={tw`mr-3`}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => setConfirmPassword(text)}
                  placeholder="Confirm password"
                  placeholderTextColor="#71717a"
                  secureTextEntry={true}
                  style={tw`flex-1 text-white`}
                  autoCapitalize="none"
                />
                <TouchableOpacity>
                  <MaterialIcons
                    name="visibility-off"
                    size={20}
                    color="#71717a"
                  />
                </TouchableOpacity>
              </View>

          
              <TouchableOpacity activeOpacity={0.8} onPress={handleSignUp}>
                <LinearGradient
                  colors={["#f97316", "#ea580c"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={tw`rounded-lg py-3 flex-row justify-center items-center`}
                >
                  <Text style={tw`text-white font-bold text-lg`}>Sign Up</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="white"
                    style={tw`ml-2`}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

          
            <View style={tw`flex-row justify-center items-center mt-6`}>
              <Text style={tw`text-zinc-400 text-base`}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Sign-in")}>
                <Text style={tw`ml-2 font-bold text-orange-500 text-base`}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

        
            <View
              style={tw`self-center mt-5 w-16 h-16 bg-zinc-900 rounded-full items-center justify-center border-2 border-orange-500`}
            >
              <MaterialIcons name="fitness-center" size={32} color="#f97316" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUp;
