import React from "react";
import { View, Text, Dimensions } from "react-native";
import tw from "twrnc";

const { width, height } = Dimensions.get("window");

const Skill = ({ skillData }) => {
  return (
    <View
      style={[
        tw`self-center border border-gray-300 rounded-xl mb-5`,
        { width: width * 0.9, height: height * 0.25 },
      ]}
    >
      <Text style={tw`m-5 font-bold text-xl`}>{skillData.skill}</Text>
      {skillData.progressions.map((item, index) => {
        const progress = skillData.current[index] / skillData.goal[index];
        return (
          <View key={index} style={tw`mb-4`}>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`ml-5`}>{item}</Text>
              <Text style={tw`text-gray-400 mr-5`}>
                {skillData.current[index]} / {skillData.goal[index]} seconds
              </Text>
            </View>
            <View style={[tw`mt-3 self-center w-full h-2 bg-gray-300 rounded-full`, {width: width * 0.8}]}>
              <View
                style={[
                  tw`h-full rounded-full bg-black`,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};


export default Skill;
