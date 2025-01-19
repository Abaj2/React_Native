import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import tw from "twrnc";

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/signin",
  ios: "http://192.168.1.137:4005/signin",
});

const SignIn = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(SERVER_URL, { email, password });
      if (response.status === 200) {
        await AsyncStorage.setItem("jwtToken", response.data.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            username: response.data.user.username,
            email: response.data.user.email,
            user_id: response.data.user.user_id,
          })
        );
        const username = response.data.user.username;
        const email = response.data.user.email;
        const user_id = response.data.user.user_id;
        navigation.navigate("Home", { email, username, user_id });
      }
    } catch (err) {
      handleError(err.response.status);
      console.error("Error details:", err.response || err.message || err);
      Alert.alert(
        "Sign-In Failed",
        "Unable to process your request. Please try again."
      );
    }
  };

  const handleError = (status) => {
    const messages = {
      409: "Invalid password",
      410: "User not found",
    };
    Alert.alert(messages[status] || "Network error. Please try again later");
  };

  return (
    <SafeAreaView style={tw`justify-center items-center`}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={tw``}>
        <View style={tw`text-center justify-center items-center mb-8 mt-16`}>
          <Text style={tw`text-3xl font-bold text-gray-900`}>CalistheniX</Text>
          <Text style={tw`text-xl text-gray-500`}>
            Track your calisthenics progress
          </Text>
        </View>

        <View
          style={[
            tw`border border-gray-200 border-2 rounded-xl`,
            { width: width * 0.9, height: height * 0.55 },
          ]}
        >
          <Text style={tw`mt-8 ml-8 text-xl font-bold`}>Welcome back</Text>
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
            />
            <TextInput
              style={[
                tw`border border-gray-300 rounded-lg pl-10`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
              placeholder="your@email.com"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
            />
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
            />
            <TextInput
              style={[
                tw`border border-gray-300 rounded-lg pl-10`,
                { width: width * 0.72, height: height * 0.04 },
              ]}
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            style={tw`mt-8 justify-center items-center`}
            onPress={handleSubmit}
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
                  Sign in
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
          <View style={[tw`ml-8 my-6 flex-row items-center justify-center`]}>
            <View style={tw`flex-1 border-t border-gray-300`} />
            <View style={tw`flex-1 mr-8 border-t border-gray-300`} />
          </View>
          <View style={tw`flex-row justify-center items-center mt-3`}>
            <Text style={tw`text-gray-500`}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Sign-up")}>
              <Text style={tw`ml-2 font-bold text-blue-500`}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
