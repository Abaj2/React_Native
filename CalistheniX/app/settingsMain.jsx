import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";

import SettingsCard from "../components/settingsCard.jsx";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const SettingsMain = () => {
  const navigation = useNavigation();

 
  const [colourTheme, setColourTheme] = useState("");
  const [isAppearanceModalVisible, setIsAppearanceModalVisible] = useState(false);

  const themes = [
    { label: "Minimalistic", value: "Minimalistic" },
    { label: "Halloween", value: "Halloween" },
    { label: "Nature", value: "Nature" },
    { label: "Ocean", value: "Ocean" },
    { label: "Warm", value: "Warm" },
  ];

  const submitTheme = async () => {
    try {
      if (!colourTheme) {
        Alert.alert("Please select a theme");
        return;
      }
      await AsyncStorage.setItem("colourTheme", colourTheme);
      console.log("Theme stored:", colourTheme);
      Alert.alert("Successfully Changed Theme");
      setIsAppearanceModalVisible(false);
    } catch (error) {
      console.error("Error saving to async storage:", error);
      Alert.alert("Failed to save theme");
    }
  };

  return (
    <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
    <SafeAreaView style={tw`flex-1`}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={tw`pb-10`}>
  
      <View style={tw`w-full bg-black mb-5 border-b border-zinc-700`}>
          <SafeAreaView>
            <View style={tw`flex-row items-center px-4 py-3`}>
              <TouchableOpacity 
                style={tw`p-2`} 
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={tw`flex-1 text-center text-white text-xl font-bold`}>Settings</Text>
              <View style={tw`w-10`}></View> 
            </View>
          </SafeAreaView>
        </View>

    
       
    
        <View style={tw`px-5 mb-5`}>
          <Text style={tw`text-gray-400 text-lg mb-2`}>Account</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ProfileSettings")}>
            <SettingsCard iconName={"person-outline"} cardName={"Profile"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ChangePassword")}>
            <SettingsCard iconName={"lock-closed-outline"} cardName={"Change Password"} />
          </TouchableOpacity>
       
        </View>

    
        <View style={tw`px-5 mb-5`}>
          <Text style={tw`text-gray-400 text-lg mb-2`}>Notifications</Text>
          <TouchableOpacity onPress={() => navigation.navigate("PushNotifications")}>
            <SettingsCard iconName={"notifications-outline"} cardName={"Push Notifications"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("EmailNotifications")}>
            <SettingsCard iconName={"mail-outline"} cardName={"Email Notifications"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SMSNotifications")}>
            <SettingsCard iconName={"chatbubble-ellipses-outline"} cardName={"SMS Notifications"} />
          </TouchableOpacity>
        </View>

  
        <View style={tw`px-5 mb-5`}>
          <Text style={tw`text-gray-400 text-lg mb-2`}>Privacy & Security</Text>
          <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
            <SettingsCard iconName={"document-text-outline"} cardName={"Privacy Policy"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("DataUsage")}>
            <SettingsCard iconName={"stats-chart-outline"} cardName={"Data Usage"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("BlockedUsers")}>
            <SettingsCard iconName={"close-circle-outline"} cardName={"Blocked Users"} />
          </TouchableOpacity>
        </View>

       
        <View style={tw`px-5 mb-5`}>
          <Text style={tw`text-gray-400 text-lg mb-2`}>Workout Preferences</Text>
          <TouchableOpacity onPress={() => navigation.navigate("WorkoutReminders")}>
            <SettingsCard iconName={"alarm-outline"} cardName={"Workout Reminders"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("DefaultWorkoutDuration")}>
            <SettingsCard iconName={"time-outline"} cardName={"Default Duration"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("EquipmentPreferences")}>
            <SettingsCard iconName={"barbell-outline"} cardName={"Equipment Preferences"} />
          </TouchableOpacity>
        </View>

        <View style={tw`px-5 mb-5`}>
          <Text style={tw`text-gray-400 text-lg mb-2`}>Data & Storage</Text>
          <TouchableOpacity onPress={() => navigation.navigate("DataUsageDetails")}>
            <SettingsCard iconName={"download-outline"} cardName={"Data Usage"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ClearCache")}>
            <SettingsCard iconName={"trash-outline"} cardName={"Clear Cache"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("DownloadPreferences")}>
            <SettingsCard iconName={"cloud-download-outline"} cardName={"Download Preferences"} />
          </TouchableOpacity>
        </View>


        <View style={tw`px-5 mb-5`}>
          <Text style={tw`text-gray-400 text-lg mb-2`}>Support & About</Text>
          <TouchableOpacity onPress={() => navigation.navigate("FAQ")}>
            <SettingsCard iconName={"help-circle-outline"} cardName={"FAQ"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ContactSupport")}>
            <SettingsCard iconName={"chatbox-ellipses-outline"} cardName={"Contact Us"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("TermsOfService")}>
            <SettingsCard iconName={"document-text-outline"} cardName={"Terms of Service"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AboutApp")}>
            <SettingsCard iconName={"information-circle-outline"} cardName={"About"} />
          </TouchableOpacity>
        </View>
      </ScrollView>

 
      <Modal visible={isAppearanceModalVisible} transparent={true} animationType="fade">
        <SafeAreaView style={tw`justify-center items-center flex-1 bg-black/70`}>
          <View
            style={[
              tw`bg-gray-800 rounded-2xl p-4`,
              { width: width * 0.8, paddingVertical: 20 },
            ]}
          >
            <View style={tw`flex-row justify-between items-center mb-4`}>
             
            </View>
            <Dropdown
              onChange={(item) => setColourTheme(item.value)}
              data={themes}
              labelField="label"
              valueField="value"
              placeholder="Select a theme"
              placeholderStyle={[
                tw`text-base text-center`,
                {
                  color: Platform.OS === "ios" ? "gray" : "#757575",
                  fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
                },
              ]}
              value={colourTheme}
              style={[
                tw`bg-gray-700 self-center border border-orange-500 rounded-lg`,
                { width: width * 0.7, height: 40 },
              ]}
              selectedTextStyle={tw`text-white ml-2`}
            />
            <TouchableOpacity onPress={submitTheme}>
              <View
                style={[
                  tw`bg-orange-500 justify-center rounded-xl items-center mt-6`,
                  { width: width * 0.7, height: 45 },
                ]}
              >
                <Text style={tw`text-white font-bold text-lg`}>OK</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </LinearGradient>
  );
};

export default SettingsMain;
