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

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/signup",
  ios: "http://192.168.1.137:4005/signup",
});

const SignUp = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9._]{3,15}$/;

  const isTokenExpired = (token) => {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000; // Get the current time in seconds
    return decoded.exp < currentTime; // Check if token is expired
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !username || !password || !confirmPassword) {
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
          })
        );
        const username = response.data.user.username;
        const email = response.data.user.email;
        const user_id = response.data.user.user_id;
        navigation.navigate("Home", { email, username, user_id });
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
    <SafeAreaView style={tw`justify-center items-center`}>
      <StatusBar barStyle="dark-content"></StatusBar>
      <ScrollView style={tw``}>
        <View style={tw`text-center justify-center items-center mb-8 mt-10`}>
          <Text style={tw`text-3xl font-bold text-gray-900`}>CalistheniX</Text>
          <Text style={tw`text-xl text-gray-500`}>
            Track your calisthenics progress
          </Text>
        </View>

        <View
          style={[
            tw`border border-gray-200 border-2 rounded-xl`,
            { width: width * 0.9, height: height * 0.65 },
          ]}
        >
          <Text style={tw`mt-8 ml-8 text-xl font-bold`}>Create an account</Text>
          <Text style={[tw`text-gray-500 mt-2 ml-8`, { fontSize: 16 }]}>
            Enter your details to access your account
          </Text>
          <Text style={[tw`ml-8 mt-8 text-xl font-bold`, { fontSize: 16 }]}>
            Email
          </Text>
          <View style={tw`ml-8 mt-2 justify-center`}>
            <MaterialIcons
              name="mail-outline"
              size={20}
              color="gray"
              style={tw`absolute ml-3`}
            ></MaterialIcons>
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={[
                tw`border border-gray-300 rounded-lg pl-10`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
              placeholder="your@email.com"
              placeholderTextColor="gray"
            ></TextInput>
          </View>
          <Text style={[tw`ml-8 mt-4 text-xl font-bold`, { fontSize: 16 }]}>
            Username
          </Text>
          <View style={tw`ml-8 mt-2 justify-center`}>
            <MaterialIcons
              name="person"
              size={20}
              color="gray"
              style={tw`absolute mt-2 ml-3`}
            ></MaterialIcons>
            <TextInput
              value={username}
              onChangeText={(text) => setUsername(text)}
              style={[
                tw`border border-gray-300 rounded-lg pl-10`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
            ></TextInput>
          </View>

          <View style={tw`flex-row justify-between`}>
            <Text style={[tw`ml-8 mt-3 text-xl font-bold`, { fontSize: 16 }]}>
              Password
            </Text>
            <Text
              style={[tw`mr-8 mt-3 text-xl text-blue-500`, { fontSize: 15 }]}
            >
              Forgot Password?
            </Text>
          </View>
          <View style={tw`ml-8 mt-2 justify-center`}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color="gray"
              style={tw`absolute ml-3`}
            ></MaterialIcons>
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={[
                tw`border border-gray-300 rounded-lg pl-10`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
              secureTextEntry={true}
              autoCapitalize="none"
            ></TextInput>
          </View>
          <Text style={[tw`ml-8 mt-3 text-xl font-bold`, { fontSize: 16 }]}>
            Confirm Password
          </Text>
          <View style={tw`ml-8 mt-2 justify-center`}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color="gray"
              style={tw`absolute ml-3`}
            ></MaterialIcons>
            <TextInput
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              style={[
                tw`border border-gray-300 rounded-lg pl-10`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
              secureTextEntry={true}
              autoCapitalize="none"
            ></TextInput>
          </View>
          <TouchableOpacity
            onPress={handleSignUp}
            style={tw`mt-8 justify-center items-center`}
          >
            <View
              style={[
                tw`rounded-lg bg-[#293241] text-center justify-center items-center`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
            >
              <View style={tw`items-center flex-row`}>
                <Text
                  style={[tw`text-white text-xl font-bold`, { fontSize: 15 }]}
                >
                  Sign up
                </Text>
                <Ionicons
                  style={tw`ml-1`}
                  name="arrow-forward"
                  size={20}
                  color="white"
                />
              </View>
            </View>
          </TouchableOpacity>
          {/* continue with line */}
          <View style={[tw`ml-8 my-6 flex-row items-center justify-center`]}>
            <View style={tw`flex-1 border-t border-gray-300`} />
            <View style={tw`flex-1 mr-8 border-t border-gray-300`} />
          </View>
          <View style={tw`items-center justify-center`}></View>
          <View style={tw`flex-row justify-center items-center mt-3`}>
            <Text style={tw`text-gray-500`}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Sign-in")}>
              <Text style={tw`ml-2 font-bold text-blue-500`}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
