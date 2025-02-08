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

const { width, height } = Dimensions.get("window");

const SettingsCard = ({ iconName, cardName }) => {
  const navigation = useNavigation();
  return (
    <View
      style={[
        tw`self-center mb-2 flex-row justify-between items-center bg-[#0e1419] rounded-xl`,
        { width: width * 0.9, height: height * 0.06 },
      ]}
    >
        <View style={tw`flex-row`}>
        <Ionicons style={tw`mr-3 ml-5`} name={iconName} size={20} color="orange" />
      <Text style={[tw`text-white ml-3 font-bold`, {fontSize: 16}]}>{cardName}</Text>
      </View>
      <View>
        <Ionicons style={tw`mr-3`} name="chevron-forward" size={24} color="orange" />
      </View>
    </View>
  );
};

export default SettingsCard;
