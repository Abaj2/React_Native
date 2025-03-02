import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Dimensions } from "react-native";
import tw from "twrnc";
import HistoryCard from "../components/historyCard.jsx";

const { width, height } = Dimensions.get("window");

const HistoryMain = () => {
  const [workoutData, setWorkoutData] = useState([]);

  const handleWorkoutData = (data) => {
    setWorkoutData(data);
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1 px-4`}>
        <ScrollView style={tw`flex-1`}>
          <HistoryCard
            isDarkMode={true} 
            onDataChange={handleWorkoutData}
            widthNumber={0.9}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HistoryMain;