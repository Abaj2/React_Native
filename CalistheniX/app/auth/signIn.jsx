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
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/signin",
  ios: "http://192.168.1.155:4005/signin",
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
    <LinearGradient
        colors={["#000", "#1a1a1a"]}
        style={tw`flex-1`}
      >
    <SafeAreaView style={tw`flex-1`}>
      <LinearGradient
        colors={["#000", "#1a1a1a"]}
        style={tw`flex-1`}
      >
        <StatusBar barStyle="light-content" />
        <ScrollView style={tw`w-full`}>
          <View style={tw`text-center justify-center items-center mb-8 mt-16`}>
            <Text style={tw`text-4xl font-black text-orange-500`}>CalistheniX</Text>
            <Text style={tw`text-sm text-zinc-400`}>
              Track your calisthenics progress
            </Text>
          </View>
  
          <View
            style={[
              tw`mx-4 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800`,
              { height: height * 0.55 },
            ]}
          >
            <View style={tw`p-6`}>
              <Text style={tw`text-2xl font-black text-white`}>
                Welcome back
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
                  onChangeText={setEmail}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  placeholder="your@email.com"
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
              <View style={tw`justify-center mb-6`}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#f97316"
                  style={tw`absolute ml-3 z-10`}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={tw`bg-zinc-800 rounded-xl pl-10 py-3 text-white border border-zinc-700`}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  placeholder="Enter password"
                  placeholderTextColor="#71717a"
                />
              </View>
  
              <TouchableOpacity
                onPress={handleSubmit}
                style={tw`mb-6`}
              >
                <LinearGradient
                  colors={["#f97316", "#ea580c"]}
                  style={tw`rounded-xl py-3`}
                >
                  <View style={tw`flex-row justify-center items-center`}>
                    <Text style={tw`text-white font-bold text-base`}>
                      Sign in
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
  
              <View style={tw`flex-row justify-center items-center`}>
                <Text style={tw`text-zinc-400 text-sm`}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Sign-up")}>
                  <Text style={tw`ml-2 font-bold text-orange-500`}>Sign Up</Text>
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

export default SignIn;
