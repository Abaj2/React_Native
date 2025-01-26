import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Search } from "lucide-react-native";
import tw from "twrnc";
import HistoryCard from "../components/historyCard.jsx";

const HistoryMain = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Tab1");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCustom, setIsCustom] = useState(false);

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
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <View style={tw`bg-black flex-1`}>
        <Text style={tw`font-bold text-2xl text-white mt-5 self-center`}>
          Workout History
        </Text>
        <View
          style={tw`flex-row items-center mx-4 mt-4 mb-2 bg-[#1E1E1E] rounded-xl`}
        >
          <Search color="gray" size={20} style={tw`ml-3 mr-2`} />
          <TextInput
            placeholder="Search workouts"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
            style={tw`flex-1 text-white py-3 pr-3`}
          />
          <View style={tw`mr-3 flex-row justify-around py-4 rounded-xl`}>
            {["Tab1", "Tab2"].map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  tw`px-6 py-2 rounded-full`,
                  selectedTab === tab &&
                    (isDarkMode ? tw`bg-orange-500` : tw`bg-blue-500`),
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    tw`text-base font-semibold`,
                    selectedTab === tab
                      ? tw`text-white`
                      : tw`${isDarkMode ? "text-gray-400" : "text-gray-600"}`,
                  ]}
                >
                  {tab === "Tab1" ? "History" : "Custom"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

export default HistoryMain;
