import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LeaderboardCard from "../components/leaderboardCard";

const { width, height } = Dimensions.get("window");

const Leaderboard = () => {
  const [username, setUsername] = useState("Error fetching username");

  useEffect(() => {
    const fetchData = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUsername(parsedData.username);
      }
    };

    fetchData();
  }, []);

  const [selectedTab, setSelectedTab] = useState("Tab1");
  return (
    <LinearGradient colors={["#000000", "#1a1a1a"]} style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        <SafeAreaView>
          <View>
            <Text
              style={tw`text-white font-bold text-3xl mb-5 mt-8 self-center`}
            >
              Leaderboards
            </Text>
            <View style={tw`w-full h-0.2 bg-orange-400 mt-5`}></View>
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity onPress={() => setSelectedTab("Tab1")}>
                    <View
                      style={tw`flex-row gap-2 rounded-2xl p-3 ml-5 mt-5 ${
                        selectedTab === "Tab1"
                          ? "bg-orange-500"
                          : "border border-zinc-800"
                      } justify-center items-center text-center`}
                    >
                      <Ionicons
                        name="calendar-clear-outline"
                        size={24}
                        color="white"
                      />
                      <Text style={tw`font-bold text-white`}>
                        Monthly Workouts
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedTab("Tab2")}>
                    <View
                      style={tw`flex-row gap-2 rounded-2xl p-3 mt-5 ${
                        selectedTab === "Tab2"
                          ? "bg-orange-500"
                          : "border border-zinc-800"
                      } justify-center items-center text-center`}
                    >
                      <Ionicons
                        name="stopwatch-outline"
                        size={24}
                        color="white"
                      />
                      <Text style={tw`font-bold text-white`}>Total Time</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
            <LinearGradient
              colors={["rgba(249,115,22,0.4)", "rgba(234,88,12,0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                tw`border border-orange-500 self-center mt-8 rounded-3xl`,
                {},
              ]}
            >
              <View
                style={[tw``, { width: width * 0.93, height: height * 0.19 }]}
              >
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw`ml-7 mt-7 font-bold text-orange-400 text-xl`}>
                    Your Ranking
                  </Text>
                  <Ionicons
                    style={tw`mt-7 mr-4`}
                    name="trophy-outline"
                    size={30}
                    color="orange"
                  />
                </View>
                <View style={tw`flex-row `}>
                  <Image
                    source={blackDefaultProfilePic}
                    style={tw`w-18 mt-3 ml-6 h-18 rounded-full border-4 border-orange-500`}
                  />
                  <View style={tw``}>
                    <Text style={tw`font-bold text-white text-xl ml-5 mt-3`}>
                      {username}
                    </Text>
                    <View style={tw`flex-row`}>
                      <Text style={tw`ml-5 mt-3 text-gray-200`}>Rank #4</Text>
                      <Text style={tw`mt-3 text-gray-200 ml-3`}>
                        38 Workouts
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-white font-bold text-xl mt-6 ml-5`}>
                Top Rankings
              </Text>
              <View style={tw`flex-row gap-3`}>
                <Ionicons style={tw`mt-7`} name="people-outline" size={22} color="gray" />
                <Text style={tw`text-gray-500 mt-8 mr-4`}>120 participants</Text>
              </View>
            </View>
            <LeaderboardCard name={"aarav"} workouts={3}/>

          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
};

export default Leaderboard;
