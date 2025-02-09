import { View, Text, Dimensions, Image } from "react-native";
import React, { useEffect } from "react";
import tw from "twrnc";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";

const { width, height } = Dimensions.get("window");

const LeaderboardCard = ({ name, workouts, pfp }) => {
  return (
    <View>
      <View
        style={[
          tw`self-center justify-center mt-10 bg-zinc-900 border border-gray-500 rounded-2xl`,
          { width: width * 0.9, height: height * 0.1 },
        ]}
      >
        <View style={tw`flex-row gap-2`}>
          <Image
            source={blackDefaultProfilePic}
            style={tw`w-12 h-12 rounded-full ml-10`}
          />
          <View>
            <Text style={tw`ml-4 font-bold text-xl text-white`}>{name}</Text>
            <Text style={tw`ml-4 mt-2 text-gray-500`}>{`${workouts} workouts`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LeaderboardCard;
