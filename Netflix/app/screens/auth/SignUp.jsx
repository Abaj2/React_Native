import {
  Image,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4003/signup",
  ios: "http://192.168.1.155:4003/signup",
});

const SignUp = () => {
  const navigation = useNavigation();
  const [usernameInputValue, setUsernameInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");
  const [confirmPasswordInputValue, setConfirmPasswordInputValue] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (passwordInputValue === confirmPasswordInputValue) {
      try {
        const response = await axios.post(SERVER_URL, {
          usernameInputValue,
          passwordInputValue,
        });

        if (response.status === 200 || response.status === 201) {
          console.log("User signed up:", response.data);
          navigation.navigate("Home", { username: usernameInputValue });

        }
      } catch (err) {
        console.error("Error during signup:", err.response || err.message);
      }
    } else {
      Alert.alert("Error", "Passwords do not match");
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={tw`items-center mt-4`}>
          <Image
            style={tw`h-40 w-60 mb-30`}
            resizeMode="contain"
            source={require("../../../assets/images/netflixLogo.png")}
          />

          {/* Username/Email Input */}
          <TextInput
            style={[
              tw`h-14 bg-[#333333] rounded text-white text-base px-4 mb-4`,
              { width: width * 0.8 },
            ]}
            placeholder="Email or phone number"
            placeholderTextColor="#969696"
            value={usernameInputValue}
            onChangeText={setUsernameInputValue}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password Input Container */}
          <View style={[tw`relative mb-4`, { width: width * 0.8 }]}>
            <TextInput
              style={tw`w-full h-14 bg-[#333333] rounded text-white text-base px-4 pr-16`}
              placeholder="Password"
              placeholderTextColor="#969696"
              value={passwordInputValue}
              onChangeText={setPasswordInputValue}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={tw`absolute right-4 h-full justify-center`}
            >
              <Text style={tw`text-white text-sm font-bold`}>
                {showPassword ? "HIDE" : "SHOW"}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[
              tw`h-14 bg-[#333333] rounded text-white text-base px-4 mb-10`,
              { width: width * 0.8 },
            ]}
            placeholder="Confirm Password"
            placeholderTextColor="#969696"
            value={confirmPasswordInputValue}
            onChangeText={setConfirmPasswordInputValue}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={
              !usernameInputValue ||
              !passwordInputValue
            }
            style={[
              tw`h-14 rounded justify-center items-center`,
              { width: width * 0.8 },
              tw`${
                usernameInputValue &&
                passwordInputValue
                  ? "bg-[#E50914]"
                  : "bg-[#5c0109]"
              }`,
            ]}
          >
            <Text
              style={tw`${
                usernameInputValue &&
                passwordInputValue
                  ? "text-white"
                  : "text-gray-500"
              } text-base font-bold`}
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignUp;
