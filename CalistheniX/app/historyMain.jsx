import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Search } from "lucide-react-native";
import tw from "twrnc";
import HistoryCard from "../components/historyCard.jsx";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const HistoryMain = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Tab1");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleWorkoutData = (data) => {
    setWorkoutData(data);
    setFilteredData(data);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredData(workoutData);
    } else {
      const filtered = workoutData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) &&
          (selectedTab === "Tab1" ? !item.custom : item.custom)
      );
      setFilteredData(filtered);
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "Tab1":
        return (
          <HistoryCard
            isDarkMode={isDarkMode}
            isCustom={false}
            onDataChange={handleWorkoutData}
            filteredWorkouts={filteredData}
          />
        );
      case "Tab2":
        return (
          <HistoryCard
            isDarkMode={isDarkMode}
            isCustom={true}
            onDataChange={handleWorkoutData}
            filteredWorkouts={filteredData}
          />
        );
      default:
        return (
          <Text style={tw`text-gray-500 text-center mt-10`}>Select a tab</Text>
        );
    }
  };

  return (
    /*<LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>*/
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`flex-1 px-4`}>
         {/* <Text style={tw`font-bold text-2xl text-white mt-5 text-center`}>
          </Text>*/}

          <View
            style={tw`border ${
              isFocused ? "border-orange-500" : "border-gray-800"
            } h-12 flex-row items-center bg-[#1E1E1E] rounded-xl mt-4 mb-2 p-2`}
          >
            <Search
              color={isFocused || searchQuery ? "darkorange" : "#666"}
              size={20}
              style={tw`mr-2`}
            />
            <TextInput
              placeholder="Search workouts"
              placeholderTextColor="#666"
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={handleSearch}
              style={[
                tw`flex-1 text-white`,
                {
                  paddingVertical: 0,
                  lineHeight: 20,
                },
              ]}
            />
          </View>

          <View style={[tw`flex-row gap-2 self-center my-3`, {}]}>
            {["Tab1", "Tab2"].map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`py-2 rounded-xl`,
                  { width: width * 0.44},
                  selectedTab === tab
                    ? isDarkMode
                      ? tw`bg-orange-500`
                      : tw`bg-blue-500`
                    : tw`bg-transparent border border-gray-600`,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    tw`self-center text-base font-semibold`,
                    selectedTab === tab
                      ? tw`text-white`
                      : isDarkMode
                      ? tw`text-gray-400`
                      : tw`text-gray-600`,
                  ]}
                >
                  {tab === "Tab1" ? "History" : "Routines"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={tw`flex-1`}>{renderContent()}</View>
        </View>
      </SafeAreaView>
    /*</LinearGradient>*/
  );
};

export default HistoryMain;