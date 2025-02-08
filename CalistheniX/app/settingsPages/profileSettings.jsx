import React, { useState, useEffect } from "react";
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
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

const SEND_OTP_URL = Platform.select({
  android: "http://10.0.2.2:4005/sendotp",
  ios: "http://192.168.1.155:4005/sendotp",
});

const ProfileSettings = () => {
  const [oldEmail, setOldEmail] = useState("");
  const [oldUsername, setOldUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userDataUnparsed = await AsyncStorage.getItem("userData");
        if (!userDataUnparsed) return;
        const userDataVariable = JSON.parse(userDataUnparsed);

        setUserData(userDataVariable)
        setOldEmail(userDataVariable.email);
        setOldUsername(userDataVariable.username);
        setNewEmail(userDataVariable.email);
        setNewUsername(userDataVariable.username);
      } catch (error) {
        console.error("Error retrieving userData:", error);
      }
    };
    getCurrentUser();
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const generateOTP = async () => {
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    console.log(`Generated OTP: ${otp}`);
  
    setTimeout(() => {
      setGeneratedOtp(null);
      console.log("OTP expired.");
    }, 15 * 60 * 1000);

    // Send OTP to backend
    const user_id = userData.user_id;
    console.log("Test")
    const jwtToken = await AsyncStorage.getItem("jwtToken");
    console.log("HELlo")

    try {
      const response = await axios.post(
        SEND_OTP_URL,
        {
          user_id: user_id,
          otp: otp,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Successfully sent OTP to backend.")
      }

    } catch (err) {
      console.error("Error sending OTP:", err);
    }
  };

  const verifyOTP = () => {
    if (userOtp === generatedOtp) {
      setModalVisible(false);
      alert("Profile Updated Successfully!");
      navigation.goBack();
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleSave = () => {
    if (!validateEmail(newEmail)) {
      alert("Invalid Email. Please enter a valid email address.");
      return;
    }
    generateOTP();
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
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
        <Text style={tw`text-gray-300 text-base mb-3`}>Email</Text>
        <TextInput
          style={tw`bg-gray-800 text-white p-4 rounded-full mb-6 border border-gray-700`}
          placeholder="Enter your email"
          placeholderTextColor="#757575"
          keyboardType="email-address"
          autoCapitalize="none"
          value={newEmail}
          onChangeText={setNewEmail}
        />

        <Text style={tw`text-gray-300 text-base mb-3`}>Username</Text>
        <TextInput
          style={tw`bg-gray-800 text-white p-4 rounded-full mb-8 border border-gray-700`}
          placeholder="Enter your username"
          placeholderTextColor="#757575"
          autoCapitalize="none"
          value={newUsername}
          onChangeText={setNewUsername}
        />

        <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
          <View
            style={tw`bg-orange-500 rounded-full py-3 mt-5 items-center shadow-lg shadow-orange-600/50`}
          >
            <Text style={tw`text-white text-lg font-bold`}>
              Send Verification Code
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black/80`}>
          <View style={tw`bg-zinc-900 p-6 rounded-3xl w-80`}>
            <Text style={tw`text-lg text-white font-bold text-center mb-4`}>
              Enter Verification Code From Email
            </Text>
            <TextInput
              style={tw`border border-gray-400 rounded p-3 text-white rounded-xl mb-5 text-center text-lg`}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              value={userOtp}
              onChangeText={setUserOtp}
              maxLength={6}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <View style={tw`bg-gray-500 rounded-full py-3 mt-3 items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>Cancel</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={verifyOTP} activeOpacity={0.8}>
              <View
                style={tw`bg-orange-500 rounded-full py-3 mt-4 items-center`}
              >
                <Text style={tw`text-white text-lg font-bold`}>Confirm</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileSettings;
