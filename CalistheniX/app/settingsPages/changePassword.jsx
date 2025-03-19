import React, { useState, useEffect } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Modal,
  Platform,
  Alert,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const CHANGE_PASSWORD_URL = Platform.select({
  android: "http://10.0.2.2:4005/changepassword",
  ios: "http://192.168.1.155:4005/changepassword",
});

const ChangePassword = () => {

  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [userData, setUserData] = useState();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    const userDataUnparsed = await AsyncStorage.getItem("userData");
    const jwtToken = await AsyncStorage.getItem("jwtToken");
    if (!userDataUnparsed) {
      Alert.alert("Error retrieving user data");
      return;
    }

    const userDataParsed = JSON.parse(userDataUnparsed);
    setUserData(userDataParsed);

    if (userDataUnparsed) {
      try {
        const response = await axios.post(CHANGE_PASSWORD_URL, {
          user_id: userDataParsed.user_id,
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )

     
        if (response.status === 200) {
          console.log('password changed successfully')
          Alert.alert("Password changed successfully")
          navigation.goBack();
        }

      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            console.log("Incorrect password")
            Alert.alert("Incorrect password")
          } else if (err.response.status === 402) {
            console.log("New password is the same as current password")
            Alert.alert("Your password must be different from your current password")
          }
        }
        
  
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <LinearGradient
          colors={["#2a1a0a", "#000000"]}
          style={tw`flex-1`}
      >
    <SafeAreaView style={tw`flex-1`}>
    
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-row items-center mt-6 mb-8 px-6`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={tw`flex-1 text-center text-white text-2xl font-bold`}>
          Profile Settings
        </Text>
      </View>

      <View style={tw`px-6`}>
        <Text style={tw`text-gray-300 text-base mb-3`}>Current Password</Text>
        <TextInput
          style={tw`bg-zinc-800 text-white p-4 rounded-full mb-6 border border-gray-700`}
          placeholder="Enter your current password"
          placeholderTextColor="#757575"
          keyboardType="email-address"
          autoCapitalize="none"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={tw`text-gray-300 text-base mb-3`}>New Password</Text>
        <TextInput
          style={tw`bg-zinc-800 text-white p-4 rounded-full mb-8 border border-gray-700`}
          placeholder="Enter your new password"
          placeholderTextColor="#757575"
          autoCapitalize="none"
          value={newPassword}
          onChangeText={setNewPassword}
        />

<Text style={tw`text-gray-300 text-base mb-3`}>Confirm New Password</Text>
        <TextInput
          style={tw`bg-zinc-800 text-white p-4 rounded-full mb-8 border border-gray-700`}
          placeholder="Confirm your new password"
          placeholderTextColor="#757575"
          autoCapitalize="none"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        <TouchableOpacity onPress={handleChangePassword} activeOpacity={0.8}>
          <View
            style={tw`bg-orange-500 rounded-full py-3 mt-5 items-center shadow-lg shadow-orange-600/50`}
          >
            <Text style={tw`text-white text-lg font-bold`}>
              Change Password
            </Text>
          </View>
        </TouchableOpacity>
      </View>

  
      
    </SafeAreaView>
    </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default ChangePassword;
