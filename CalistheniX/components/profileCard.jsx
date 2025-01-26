import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import tw from "twrnc";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const ProfileCard = ({ iconName, secondaryText, primaryText, margin, iconColour }) => {
  return (
    <View
    style={[
      tw`bg-gray-800 ${margin} mt-5 rounded-3xl`,
      { width: width * 0.42, height: height * 0.13 },
    ]}
  >
    <View style={tw`flex-row`}>
      <View style={tw`mt-8 ml-1`}>
        <Ionicons name={`${iconName}`} size={35} color={`${iconColour}`} />
      </View>
      <View>
        <View style={tw``}>
          <Text style={tw`text-gray-400 mt-7 ml-3 flex-wrap`}>{secondaryText}</Text>
        </View>
        <View>
          <Text style={tw`text-white font-bold ml-3 text-2xl`}>{primaryText}</Text>
        </View>
      </View>
    </View>
    </View>
  );
};

export default ProfileCard;
