import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import HistoryCard from "../components/historyCard";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import axios from "axios";
import UserProfileSkill from "../components/userProfileSkill";

const USER_DETAILS = Platform.select({
  android: "http://10.0.2.2:4005/userdetails",
  ios: "http://192.168.1.155:4005/userdetails",
});

const UserProfile = ({ navigation, route }) => {
  const { users_id } = route.params;
  console.log(users_id);

  const [selectedTab, setSelectedTab] = useState("workouts");
  const [userDetails, setUserDetails] = useState();
  const [followers, setFollowers] = useState();
  const [following, setFollowing] = useState();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${USER_DETAILS}?user_id=${users_id}`);

        if (response.status === 200) {
          setUserDetails(response.data.userDetails);
          setFollowers(response.data.followers);
          setFollowing(response.data.following);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserDetails();
  }, [users_id]);

  const renderContent = () => {
    switch (selectedTab) {
      case "workouts":
        return (
          <View style={tw`mt-5`}>
            <HistoryCard user_id={users_id} widthNumber={0.98} fullBorder={true} />
          </View>
        );
      case "skills":
        return (
          <UserProfileSkill />
        );
      default:
        return null;
    }
  };

  return (
    <View style={tw`flex-1 w-full`}>
      <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1 w-full`}>
        <View
          style={tw`flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-800`}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={tw`text-white font-bold text-lg`}>User Profile</Text>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={tw`px-4 pt-6`}>
            <View style={tw`flex-row items-center`}>
              <Image
                source={blackDefaultProfilePic}
                style={tw`w-20 h-20 rounded-full border-2 border-orange-500`}
              />
              <View>
                <Text style={tw`ml-4 text-xl text-white font-bold`}>
                  {userDetails ? userDetails[0].name : "Loading name..."}
                </Text>
                <Text style={tw`ml-4 text-base text-gray-400`}>
                  @
                  {userDetails
                    ? userDetails[0].username
                    : "Loading username..."}
                </Text>
              </View>
              <View style={tw`ml-5`}>
                <Text style={tw`text-white font-bold text-2xl`}>
                  {followers ? followers.length : "0"}
                </Text>
                <Text style={tw`text-gray-400`}>
                  {`Follower${followers && followers.length !== 1 ? "s" : ""}`}
                </Text>
              </View>
              <View style={tw`ml-5`}>
                <Text style={tw`font-bold text-white text-2xl`}>
                  {following ? following.length : "0"}
                </Text>
                <Text style={tw`text-gray-400`}>Following</Text>
              </View>
            </View>

            <TouchableOpacity
              style={tw`mt-4 bg-orange-500 rounded-full py-2`}
              onPress={() => {}}
            >
              <Text style={tw`text-center font-semibold text-white`}>
                Follow
              </Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row mt-6 border-b border-zinc-800`}>
            {["Workouts", "Skills"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={tw`flex-1 items-center pb-3 ${
                  selectedTab === tab.toLowerCase()
                    ? "border-b-2 border-orange-500"
                    : ""
                }`}
                onPress={() => setSelectedTab(tab.toLowerCase())}
              >
                <Text
                  style={tw`text-sm ${
                    selectedTab === tab.toLowerCase()
                      ? "text-orange-500"
                      : "text-zinc-400"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={tw`py-4`}>{renderContent()}</View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default UserProfile;
