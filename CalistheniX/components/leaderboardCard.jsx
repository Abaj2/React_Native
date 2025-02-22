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

  return (
    <View>
      <View
        style={[
          tw`self-center justify-center mt-6 ${
            username === storageUsername
              ? "bg-orange-500"
              : "bg-zinc-900 border-gray-500 "
          } border rounded-2xl`,
          { width: width * 0.9, height: height * 0.1 },
        ]}
      >
        <View style={tw`flex-row items-center`}>
          {rank === 1 && (
            <MaterialCommunityIcons
              style={tw`ml-5`}
              name="crown"
              size={35}
              color="yellow"
            />
          )}
          {rank === 2 && (
            <Ionicons
              style={tw`ml-5`}
              name="medal-outline"
              size={35}
              color="#808080"
            />
          )}

          {rank === 3 && (
            <Ionicons
              style={tw`ml-5`}
              name="medal-outline"
              size={35}
              color="#8B4513"
            />
          )}
          {rank > 3 && (
            <Text style={tw`ml-7 mr-2 text-4xl text-gray-500`}>{rank}</Text>
          )}

          <Image
            source={blackDefaultProfilePic}
            style={tw`w-12 h-12 rounded-full ml-5`}
          />
          <View>
            <Text style={tw`ml-4 font-bold text-xl text-white`}>
              {username}
            </Text>
            {workouts && (
              <Text
                style={tw`ml-4 mt-2 ${
                  username === storageUsername
                    ? "text-gray-850"
                    : "text-gray-500"
                }`}
              >{`${workouts} workout${workouts > 1 ? "s" : ""}`}</Text>
            )}
            {metric && (
              <Text
                style={tw`ml-4 mt-2 ${
                  username === storageUsername
                    ? "text-gray-850"
                    : "text-gray-500"
                }`}
              >{metric}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default LeaderboardCard;
