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

import { LinearGradient } from "expo-linear-gradient";

import axios from "axios";

const { width } = Dimensions.get("window");

const Progress = ({ isDarkMode, userData, skillsData }) => {
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const handleToggleDropdown = () => {
    setToggleDropdown((prevState) => !prevState);
  };

  useEffect(() => {
    console.log(skillsData);
  }, [skillsData]);

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`items-center pb-5`}>
        {skillsData.map(
          (item) =>
            item.current.some((subArray) => subArray.length > 1) && (
              <TouchableOpacity
                activeOpacity={1}
                style={tw`w-full`}
                onPress={handleToggleDropdown}
              >
                <View key={item.id} style={tw`w-full px-5 mb-4`}>
                  <View
                    style={tw`w-full bg-[#18181b] border border-orange-500 rounded-2xl p-5`}
                  >
                    <View style={tw`flex-row justify-between`}>
                      <Text
                        style={[tw`font-bold text-white`, { fontSize: 18 }]}
                      >
                        {item.skill}
                      </Text>
                      <Icon
                        name={`${
                          toggleDropdown ? "chevron-up" : "chevron-down"
                        }`}
                        size={20}
                        color="gray"
                      />
                    </View>

                    {item.progressions.map(
                      (progression, index) =>
                        toggleDropdown && (
                          <Text style={tw`text-white mt-2`} key={index}>
                            {progression}
                          </Text>
                        )
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;
