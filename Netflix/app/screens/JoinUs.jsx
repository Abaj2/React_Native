import {
  Image,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import netflixLogo from "../../assets/images/netflixLogo.png";
import tw from "twrnc";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import JoinUsImages from "../../components/JoinUsImages";
import cancelAnytime from "../../assets/images/cancelAnytime.png";
import planForEveryFan from "../../assets/images/planForEveryFan.png";
import watchEverywhere from "../../assets/images/watchEverywhere.png";
import Carousel from "react-native-snap-carousel";

const { width, height } = Dimensions.get("window");

const joinUsCarousel = [
  {
    id: "1",
    image: require("../../assets/images/watchEverywhere.png"),
    title: "Watch everywhere",
    subtitle: "Stream on your phone, tablet, laptop and TV",
    passedHeight: height * 0.32,
    passedWidth: width * 0.72,
  },
  {
    id: "2",
    image: require("../../assets/images/planForEveryFan.png"),
    title: "There's a plan for every fan",
    subtitle: "Small price. Big entertainment.",
    passedHeight: height * 0.32,
    passedWidth: width * 0.72,
  },
  {
    id: "3",
    image: require("../../assets/images/cancelAnytime.png"),
    title: "Cancel online anytime",
    subtitle: "Join today, no reason to wait.",
    passedHeight: height * 0.32,
    passedWidth: width * 0.72,
  },
];

export default function JoinUs() {
  const navigation = useNavigation();

  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }) => {
    return (
      <JoinUsImages
        image={item.image}
        title={item.title}
        subtitle={item.subtitle}
        passedHeight={item.passedHeight}
        passedWidth={item.passedWidth}
      />
    );
  };

  const renderIndicators = () => {
    return (
      <View style={tw`flex-row justify-center items-center`}>
        {joinUsCarousel.map((_, index) => {
          return (
            <View
              key={index}
              style={[
                tw`rounded-full mx-2`,
                {
                  width: 10,
                  height: 10,
                  backgroundColor: index === activeIndex ? "white" : "gray",
                  transform: [{ translateY: height * 0.1 }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-[#00081d]`}>
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar hidden={false} />
        <View
          style={[
            tw`mx-4 flex-row justify-between items-center`,
            { transform: [{ translateY: -height * 0.13 }] },
          ]}
        >
          <Image
            style={[
              tw`bg-transparent`,
              { width: width * 0.3, height: height * 0.32 },
            ]}
            resizeMode="contain"
            source={require("../../assets/images/netflixLogo.png")}
          />
          <TouchableOpacity
            style={[
              tw`rounded-lg bg-gray-500 text-center justify-center items-center`,
              { width: 0.18 * width, height: 0.04 * height },
            ]}
            onPress={() => navigation.navigate("Sign-in")}
          >
            <Text style={[tw`text-white font-bold text-xl`, { fontSize: 15 }]}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            tw`flex-1 justify-center items-center mx-5`,
            { transform: [{ translateY: -height * 0.2 }] },
          ]}
        >
          <Carousel
            data={joinUsCarousel}
            renderItem={renderItem}
            sliderWidth={width}
            itemWidth={width}
            layout="default"
            loop={false}
            autoplay={false}
            activeSlideAlignment="center"
            inactiveSlideScale={1}
            inactiveSlideOpacity={1}
            onSnapToItem={(index) => setActiveIndex(index)}
            decelerationRate="fast"
            snapToInterval={width}
            disableIntervalMomentum={true}
            scrollEnabled={true}
          />
          {renderIndicators()}
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Sign-up")}
              style={[
                tw`justify-center items-center rounded-lg bg-red-700`,
                {
                  width: 0.8 * width,
                  height: 0.08 * height,
                  transform: [{ translateY: height * 0.2 }],
                },
              ]}
            >
              <Text style={tw`text-white`}>
                Click here to create an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
