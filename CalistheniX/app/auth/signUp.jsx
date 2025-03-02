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

    // call backend
    try {
      const response = await axios.post(SERVER_URL, {
        email,
        username,
        password,
        confirmPassword,
        name
      });

      if (response.status === 201) {
        console.log("User signed up:", response.data);
        await AsyncStorage.setItem("jwtToken", response.data.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            username: response.data.user.username,
            email: response.data.user.email,
            userId: response.data.user.user_id,
            name: response.data.user.name
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
    <LinearGradient
        colors={["#000", "#1a1a1a"]}
        style={tw`flex-1`}
      >
    <SafeAreaView style={tw`flex-1`}>
      <LinearGradient
        colors={["#000", "#1a1a1a"]}
        style={tw`flex-1`}
      >
        <ScrollView style={tw`w-full`}>
          <View style={tw`text-center justify-center items-center mb-8 mt-10`}>
            <Text style={tw`text-4xl font-black text-orange-500`}>CalistheniX</Text>
            <Text style={tw`text-sm text-zinc-400`}>
              Track your calisthenics progress
            </Text>
          </View>
  
          <View
            style={[
              tw`mx-4 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800`,
              { height: height * 0.7 },
            ]}
          >
            <View style={tw`p-6`}>
              <Text style={tw`text-2xl font-black text-white`}>
                Create an account
              </Text>
              <Text style={tw`text-zinc-400 mt-1 text-sm`}>
                Enter your details to access your account
              </Text>
            </View>
  
            <View style={tw`px-6`}>
              <Text style={tw`text-[15px] font-bold text-white mb-2`}>
                Email
              </Text>
              <View style={tw`justify-center mb-4`}>
                <MaterialIcons
                  name="mail-outline"
                  size={20}
                  color="#f97316"
                  style={tw`absolute ml-3 z-10`}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  placeholder="your@email.com"
                  placeholderTextColor="#71717a"
                />
              </View>

              <Text style={tw`text-[15px] font-bold text-white mb-2`}>
                Name
              </Text>
              <View style={tw`justify-center mb-4`}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color="#f97316"
                  style={tw`absolute ml-3 z-10`}
                />
                <TextInput
                  value={name}
                  onChangeText={(text) => setName(text)}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  placeholder="Enter your name"
                  placeholderTextColor="#71717a"
                />
              </View>
  
              <Text style={tw`text-[15px] font-bold text-white mb-2`}>
                Username
              </Text>
              <View style={tw`justify-center mb-4`}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color="#f97316"
                  style={tw`absolute ml-3 z-10`}
                />
                <TextInput
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  placeholder="Choose a username"
                  placeholderTextColor="#71717a"
                />
              </View>
  
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-[15px] font-bold text-white mb-2`}>
                  Password
                </Text>
                <Text style={tw`text-orange-500 text-sm font-semibold`}>
                  Forgot Password?
                </Text>
              </View>
              <View style={tw`justify-center mb-4`}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#f97316"
                  style={tw`absolute ml-3 z-10`}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  placeholder="Enter password"
                  placeholderTextColor="#71717a"
                />
              </View>
  
              <Text style={tw`text-[15px] font-bold text-white mb-2`}>
                Confirm Password
              </Text>
              <View style={tw`justify-center mb-6`}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#f97316"
                  style={tw`absolute ml-3 z-10`}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => setConfirmPassword(text)}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  placeholder="Confirm password"
                  placeholderTextColor="#71717a"
                />
              </View>
  
              <TouchableOpacity
                onPress={handleSignUp}
                style={tw`mb-6`}
              >
                <LinearGradient
                  colors={["#f97316", "#ea580c"]}
                  style={tw`rounded-xl py-3`}
                >
                  <View style={tw`flex-row justify-center items-center`}>
                    <Text style={tw`text-white font-bold text-base`}>
                      Sign up
                    </Text>
                    <Ionicons
                      style={tw`ml-2`}
                      name="arrow-forward"
                      size={20}
                      color="white"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
  
              <View style={tw`flex-row items-center justify-center mb-6`}>
                <View style={tw`flex-1 border-t border-zinc-800`} />
                <Text style={tw`mx-4 text-zinc-500 text-sm`}>or</Text>
                <View style={tw`flex-1 border-t border-zinc-800`} />
              </View>
  
              <View style={tw`flex-row justify-center mb-5 items-center`}>
                <Text style={tw`text-zinc-400 text-sm`}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Sign-in")}>
                  <Text style={tw`ml-2 font-bold text-orange-500`}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUp;
