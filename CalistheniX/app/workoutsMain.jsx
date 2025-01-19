import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { FontAwesome5, Ionicons } from "@expo/vector-icons"; // Icons
import { LinearGradient } from "expo-linear-gradient"; // Gradient Background
import Workouts from "../components/workouts.jsx";
import HistoryCard from "../components/historyCard.jsx";

const { width, height } = Dimensions.get("window");

const WorkoutsMain = () => {
  const [selectedTab, setSelectedTab] = useState("Tab2");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderContent = () => {
    switch (selectedTab) {
      case "Tab2":
        return <Workouts isDarkMode={isDarkMode} />;
      case "Tab3":
        return <HistoryCard isDarkMode={isDarkMode} />;
      default:
        return (
          <Text style={tw`text-gray-500 text-center mt-10`}>Select a tab</Text>
        );
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#000", "#1a1a1a"] : ["#f9f9f9", "#e3e3e3"]}
      style={tw`flex-1`}
    >
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

        {/* Header Section */}
        <View style={tw`px-5 pt-6 pb-4`}>
          <Text
            style={[
              tw`self-center text-3xl font-bold`,
              { color: isDarkMode ? "white" : "black" },
            ]}
          >
            Calisthenics Workouts
          </Text>
        </View>

        {/* Tabs */}
        <View style={tw`flex-row justify-around py-4 bg-transparent`}>
          {["Tab2", "Tab3"].map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                tw`flex-row items-center px-6 py-2 rounded-full`,
                selectedTab === tab &&
                  (isDarkMode
                    ? tw`bg-orange-500 shadow-lg`
                    : tw`bg-blue-500 shadow-md`),
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <FontAwesome5
                name={tab === "Tab2" ? "dumbbell" : "history"}
                size={16}
                color={
                  selectedTab === tab ? "white" : isDarkMode ? "gray" : "black"
                }
              />
              <Text
                style={[
                  tw`ml-2 text-base font-semibold`,
                  selectedTab === tab
                    ? tw`text-white`
                    : tw`${isDarkMode ? "text-gray-400" : "text-gray-600"}`,
                ]}
              >
                {tab === "Tab2" ? "Workouts" : "History"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[
            tw`h-0.5`,
            { backgroundColor: isDarkMode ? "#404040" : "#ccc" },
          ]}
        />
       

  <ScrollView
    contentContainerStyle={tw`p-4`}
    showsVerticalScrollIndicator={false}
  >
     <View style={[tw`flex-row bg-zinc-900 rounded-3xl mb-5 border-l-4 border-orange-500`, {width: width * 0.9, height: height * 0.08}]}>
      <Text style={tw`text-white font-bold m-5 text-lg`}>Custom Workout</Text>
     <TouchableOpacity>
    <View
      style={[
        tw`mb-5 rounded-lg mt-5 text-center justify-center items-center bg-orange-500`,
        { 
          width: width * 0.35, 
          height: height * 0.04, 
          zIndex: 100,  
        },
      ]}
    >
      <Text style={tw`text-white font-bold`}>Start</Text>
    </View>
  </TouchableOpacity>
 
  </View>
    {renderContent()}
  </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WorkoutsMain;
