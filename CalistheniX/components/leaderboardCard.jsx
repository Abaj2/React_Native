import { View, Text, Dimensions, Image } from "react-native";
import React, { useEffect, useState } from "react";
import tw from "twrnc";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Icon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const LeaderboardCard = ({ username, workouts, rank, user_id, metric }) => {
  const [userId, setUserId] = useState();
  const [storageUsername, setStorageUsername] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserId(parsedData.user_id);
        setStorageUsername(parsedData.username);
      }
    };
    fetchData();
  }, []);

  const getMedalColor = (rank) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-gray-400";
  };

  return (
    <View style={tw`px-4 py-3`}>
      <View
        style={tw`flex-row items-center justify-between ${
          username === storageUsername ? "opacity-100" : "opacity-100"
        }`}
      >
        {/* Left Section: Rank and Profile */}
        <View style={tw`flex-row items-center flex-1`}>
          {/* Rank Badge */}
          <View style={tw`mr-3 w-10 items-center justify-center`}>
            {rank === 1 && (
              <View style={tw`bg-yellow-500/20 p-1 rounded-full`}>
                <MaterialCommunityIcons
                  name="crown"
                  size={28}
                  color="gold"
                />
              </View>
            )}
            {rank === 2 && (
              <View style={tw`bg-gray-400/20 p-1 rounded-full`}>
                <Ionicons
                  name="medal-outline"
                  size={26}
                  color="silver"
                />
              </View>
            )}
            {rank === 3 && (
              <View style={tw`bg-orange-800/20 p-1 rounded-full`}>
                <Ionicons
                  name="medal-outline"
                  size={26}
                  color="#CD7F32" // Bronze color
                />
              </View>
            )}
            {rank > 3 && (
              <View style={tw`${username === storageUsername ? "bg-orange-500/20" : "bg-zinc-800"} w-9 h-9 rounded-full items-center justify-center`}>
                <Text style={tw`${username === storageUsername ? "text-orange-400" : "text-gray-400"} font-bold text-lg`}>
                  {rank}
                </Text>
              </View>
            )}
          </View>
  
          {/* Profile Image */}
          <Image
            source={blackDefaultProfilePic}
            style={tw`w-10 h-10 rounded-full ${
              username === storageUsername ? "border-2 border-orange-500" : ""
            }`}
          />
  
          {/* Username */}
          <View style={tw`ml-3 flex-1`}>
            <Text 
              style={tw`font-bold text-lg ${
                username === storageUsername ? "text-orange-400" : "text-white"
              }`}
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
  
        {/* Right Section: Stats */}
        <View style={tw`${
          username === storageUsername 
            ? "bg-orange-500" 
            : "bg-zinc-800"
          } px-3 py-1 rounded-full`}
        >
          {workouts && (
            <Text
              style={tw`font-bold ${
                username === storageUsername ? "text-white" : "text-gray-300"
              }`}
            >
              {`${workouts} workout${workouts > 1 ? "s" : ""}`}
            </Text>
          )}
          {metric && (
            <Text
              style={tw`font-bold ${
                username === storageUsername ? "text-white" : "text-gray-300"
              }`}
            >
              {metric}
            </Text>
          )}
        </View>
      </View>
      
      {/* Highlight for current user */}
      {username === storageUsername && (
        <View style={tw`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full`} />
      )}
    </View>
  );
};

export default LeaderboardCard;
