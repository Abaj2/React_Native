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
  KeyboardAvoidingView,
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
        console.log(response.data.user.name)
        await AsyncStorage.setItem("jwtToken", response.data.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            username: response.data.user.username,
            email: response.data.user.email,
            user_id: response.data.user.user_id,
            name: response.data.user.name,
            profile_pic: response.data.user.profile_pic,
          })
        );
        const username = response.data.user.username;
        const email = response.data.user.email;
        const user_id = response.data.user.user_id;
        const name = response.data.user.username;
        const profile_pic = response.data.user.profile_pic;
        navigation.navigate("Home", { email, username, user_id, name, profile_pic });
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
    <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>  
      <SafeAreaView style={tw`flex-1`}>  
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1`}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`flex-grow px-5 justify-center py-6`}
          >
            {/* Logo and App Name */}
            <View style={tw`items-center mb-8`}>
              
              <Text style={tw`text-4xl font-black text-white`}>
                Calistheni<Text style={tw`text-orange-500`}>X</Text>
              </Text>  
              <Text style={tw`text-sm text-zinc-400 mt-1`}>Track your calisthenics progress</Text>
            </View>
            
            {/* Login Card */}
            <View style={tw`bg-zinc-900 rounded-2xl p-5 border border-zinc-800 shadow-lg`}> 
              <Text style={tw`text-2xl font-bold text-white mb-5`}>Welcome Back</Text> 
              
              {/* Email Input */}
              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>Email</Text>
              <View style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-4 border border-zinc-700`}> 
                <MaterialIcons name="mail-outline" size={20} color="#f97316" style={tw`mr-3`} /> 
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
              
              {/* Password Input */}
              <Text style={tw`text-sm font-bold text-zinc-400 mb-1 ml-1`}>Password</Text>
              <View style={tw`flex-row items-center bg-zinc-800 rounded-lg p-3 mb-2 border border-zinc-700`}> 
                <MaterialIcons name="lock-outline" size={20} color="#f97316" style={tw`mr-3`} /> 
                <TextInput 
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  placeholder="Enter password"
                  placeholderTextColor="#71717a"
                  secureTextEntry={true}
                  style={tw`flex-1 text-white`}
                />
                <TouchableOpacity>
                  <MaterialIcons name="visibility-off" size={20} color="#71717a" />
                </TouchableOpacity>
              </View>
              
              {/* Forgot Password */}
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={tw`mb-5`}> 
                <Text style={tw`text-orange-500 text-sm font-semibold text-right`}>Forgot Password?</Text> 
              </TouchableOpacity>
              
              {/* Sign In Button */}
              <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit}> 
                <LinearGradient 
                  colors={["#f97316", "#ea580c"]} 
                  start={{x: 0, y: 0}} 
                  end={{x: 1, y: 0}}
                  style={tw`rounded-lg py-3 flex-row justify-center items-center`}
                > 
                  <Text style={tw`text-white font-bold text-lg`}>Sign In</Text> 
                  <Ionicons name="arrow-forward" size={20} color="white" style={tw`ml-2`} /> 
                </LinearGradient> 
              </TouchableOpacity>
            </View>
            
            {/* Sign Up Link */}
            <View style={tw`flex-row justify-center items-center mt-6`}> 
              <Text style={tw`text-zinc-400 text-base`}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Sign-up")}>
                <Text style={tw`ml-2 font-bold text-orange-500 text-base`}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <View style={tw`self-center mt-5 w-16 h-16 bg-zinc-900 rounded-full items-center justify-center mb-3 border-2 border-orange-500`}>
                <MaterialIcons name="fitness-center" size={32} color="#f97316" />
              </View>  
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
};

export default SignIn;
