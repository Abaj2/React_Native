import { View, Text, ScrollView, Image, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const GET_FOLLOW_STATS = Platform.select({
  android: "http://10.0.2.2:4005/getfollowstats",
  ios: "http://192.168.1.155:4005/getfollowstats",
});

const Following = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const defaultProfilePicUri = "https://calisthenix.s3.ap-southeast-2.amazonaws.com/profile_pics/blackDefaultProfilePic.png";

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

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <View style={tw`flex-row items-center px-4 pt-4 pb-10 border-b border-zinc-800`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
  
        <View style={tw`flex-1`}>
          <Text style={tw`mr-5 text-white font-bold text-xl text-center`}>
            Following
          </Text>
        </View>
      </View>
  
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {followStats?.following?.length > 0 ? (
          followStats.following.map((user) => (
            <TouchableOpacity
              key={user.user_id}
              style={tw`flex-row items-center px-4 py-3 border-b border-zinc-800`}
              onPress={() => navigation.navigate('User-Profile', { users_id: user.user_id })}
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
                style={tw`bg-zinc-800 px-4 py-2 rounded-full`}
                onPress={() => console.log(`Unfollow ${user.username}`)}
                activeOpacity={0.7}
              >
                <Text style={tw`text-zinc-400 font-semibold text-sm`}>
                  Following
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={tw`flex-1 justify-center items-center px-4 mt-20`}>
            <Ionicons name="people-outline" size={48} color="#52525b" />
            <Text style={tw`text-zinc-500 text-center text-lg mt-4 font-medium`}>
              You are not following anyone
            </Text>
            <Text style={tw`text-zinc-600 text-center text-sm mt-1`}>
              Your following will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
  
  
};

export default Following;
