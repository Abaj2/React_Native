import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import tw from "twrnc";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const GET_FOLLOW_STATS = Platform.select({
  android: "http://10.0.2.2:4005/getfollowstats",
  ios: "http://192.168.1.155:4005/getfollowstats",
});

const REMOVE_FOLLOWER = Platform.select({
  android: "http://10.0.2.2:4005/removefollower",
  ios: "http://192.168.1.155:4005/removefollower",
});

const Followers = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const defaultProfilePicUri =
    "https://calisthenix.s3.ap-southeast-2.amazonaws.com/profile_pics/blackDefaultProfilePic.png";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (!storedUserData) return;
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userData) return;

    const getFollowStats = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const response = await axios.get(GET_FOLLOW_STATS, {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: userData.user_id },
        });

        if (response.status === 200) {
          setFollowStats(response.data);
        } else {
          console.log("Error getting follow stats");
        }
      } catch (err) {
        console.error("Error fetching follow stats:", err);
      }
    };

    getFollowStats();
  }, [userData]);

  const handleRemoveFollower = async (user_id) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.post(
        REMOVE_FOLLOWER,
        { currentUsersId: userData?.user_id,
          followersUserId: user_id
         },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setFollowStats((prev) => ({
          ...prev,
          followers: prev.followers.filter((user) => user.user_id !== user_id),
        }));
      } else {
        console.log("Error unfollowing user");
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  }

  return (
    <LinearGradient colors={["#000", "#000"]} style={tw`flex-1 flex-row items-center pt-4`} >
    <SafeAreaView style={tw`flex-1`}>
      
      <View
        style={tw`flex-row items-center px-4 pt-4 pb-10 border-b border-zinc-800`}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={tw`flex-1`}>
          <Text style={tw`mr-5 text-white font-bold text-xl text-center`}>
            Followers
          </Text>
        </View>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {followStats?.followers?.length > 0 ? (
          followStats.followers.map((user) => (
            <TouchableOpacity
              key={user.user_id}
              style={tw`flex-row items-center px-4 py-3 border-b border-zinc-800`}
              onPress={() =>
                navigation.navigate("User-Profile", { users_id: user.user_id })
              }
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: user.profile_pic || defaultProfilePicUri }}
                style={tw`w-12 h-12 rounded-full border-2 border-orange-500`}
              />

              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`text-white font-semibold text-base`}>
                  {user.username}
                </Text>
                {user.full_name && (
                  <Text style={tw`text-zinc-400 text-sm`}>
                    {user.full_name}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={tw`bg-orange-500 px-4 py-2 rounded-full`}
                onPress={() => handleRemoveFollower(user.user_id)}
                activeOpacity={0.7}
              >
                <Text style={tw`text-white font-semibold text-sm`}>
                  Remove
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={tw`flex-1 justify-center items-center px-4 mt-20`}>
            <Ionicons name="people-outline" size={48} color="#52525b" />
            <Text
              style={tw`text-zinc-500 text-center text-lg mt-4 font-medium`}
            >
              No followers yet
            </Text>
            <Text style={tw`text-zinc-600 text-center text-sm mt-1`}>
              Your followers will appear here
            </Text>
          </View>
        )}
      </ScrollView>
      
    </SafeAreaView>
    </LinearGradient>
  );
};

export default Followers;
