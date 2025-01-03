import { View, Text, Image } from "react-native";
import React from "react";
import cancelAnytime from "../assets/images/cancelAnytime.png";
import planForEveryFan from "../assets/images/planForEveryFan.png";
import watchEverywhere from "../assets/images/watchEverywhere.png";
import { Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import tw from "twrnc";

const { width, height } = Dimensions.get("window");

export default function JoinUsImages({ image, title, subtitle, passedWidth, passedHeight }) {
  return (
    <View
      style={[
        tw`flex-1 justify-center items-center`,
      ]}
    >
      <Image style={[tw`mb-5`, {width: passedWidth, height: passedHeight,}]}source={image}></Image>
      <Text style={[tw`mb-5 text-3xl text-white font-bold text-center`, {fontSize: 40}]}>
        {title}
      </Text>
      <Text style={tw`text-xl text-white text-center mx-5`}>
        {subtitle}
      </Text>
    </View>
  );
}
