import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  TextInput,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from "twrnc";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import RNPickerSelect from "react-native-picker-select";
import { Dropdown } from "react-native-element-dropdown";
import Skill from "../components/skill.jsx";
import Workouts from "../components/workouts.jsx";
import { LinearGradient } from "expo-linear-gradient";

import HistoryCard from "../components/historyCard.jsx";

import axios from "axios";
import Progress from "../components/progress.jsx";
import SettingsCard from "../components/settingsCard.jsx";

const { width, height } = Dimensions.get("window");

const SettingsMain = () => {
  const navigation = useNavigation();

  const [colourTheme, setColourTheme] = useState("");
  const [isAppearanceModalVisible, setIsAppearanceModalVisible] =
    useState(false);

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
        Alert.alert('Please select a theme');
        return;
      }
  
      await AsyncStorage.setItem('colourTheme', colourTheme);
      console.log("Theme stored:", colourTheme);       
      Alert.alert('Successfully Changed Theme');
      setIsAppearanceModalVisible(false);
    } catch (error) {
      console.error('Error saving to async storage:', error);
      Alert.alert('Failed to save theme');
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <View style={tw`mt-5 bg-black flex-1`}>
        <TouchableOpacity onPress={() => setIsAppearanceModalVisible(true)}>
          <SettingsCard
            iconName={"color-palette-outline"}
            cardName={"Appearance"}
          />
        </TouchableOpacity>
      </View>
      <Modal
        visible={isAppearanceModalVisible}
        transparent={true}
        animationType="fade"
      >
        <SafeAreaView
          style={tw`justify-center items-center flex-1 bg-black/70`}
        >
          <View
            style={[
              tw`bg-gray-800 rounded-2xl`,
              { width: width * 0.6, height: height * 0.15 },
            ]}
          >
            <View style={tw`flex-row justify-center`}>
              <TouchableOpacity
                onPress={() => setIsAppearanceModalVisible(false)}
              >
                <Ionicons name="close" style={tw`mr-5 mt-4`} color="gray" size={30} />
              </TouchableOpacity>
              <View style={tw`mt-4`}>
                <Dropdown
                  onChange={(item) => setColourTheme(item.value)}
                  data={themes}
                  labelField="label"
                  valueField="value"
                  placeholder="Select a theme"

                  placeholderStyle={[
                    tw`text-xl text-center`,
                    {
                      fontSize: 15,
                      color: Platform.OS === "ios" ? "gray" : "757575",
                      fontFamily:
                        Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
                    },
                  ]}
                  value={colourTheme}
                  style={[
                    tw`${"bg-gray-700"} self-center border border-orange-500 rounded-lg`,
                    { width: width * 0.4, height: height * 0.04 },
                  ]}
                  selectedTextStyle={tw`text-white ml-2`}
                />
              </View>
 
            </View>
            <TouchableOpacity onPress={submitTheme}>
                <View style={[tw`bg-orange-600 justify-center rounded-xl items-center mt-4 self-center`, {width: width * 0.52, height: height * 0.05}]}>
                  <Text style={tw`text-white font-bold text-lg`}>OK</Text>

                </View>
              </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsMain;
