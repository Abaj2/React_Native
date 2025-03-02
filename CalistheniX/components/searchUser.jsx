import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";

const GET_USERS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getusers",
  ios: "http://192.168.1.155:4005/getusers",
});

const FOLLOW_USER_URL = Platform.select({
  android: "http://10.0.2.2:4005/followuser",
  ios: "http://192.168.1.155:4005/followuser",
});

const UNFOLLOW_USER_URL = Platform.select({
  android: "http://10.0.2.2:4005/unfollowuser",
  ios: "http://192.168.1.155:4005/unfollowuser",
});

const { width, height } = Dimensions.get('window')

const SearchUser = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userData, setUserData] = useState();

  useEffect(() => {
    const loadUserData = async () => {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      if (!userData?.user_id) return;
      const token = await AsyncStorage.getItem("jwtToken");
      try {
        const currentUsersId = userData.user_id;
        const response = await axios.get(
          `${GET_USERS_URL}?userId=${currentUsersId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          const transformed = response.data.users.map((user) => {
            const workout = response.data.workouts.find(
              (w) => w.user_id === user.user_id
            );
            const isFollowing = response.data.followers.some(
              (f) =>
                f.follower_id === currentUsersId &&
                f.following_id === user.user_id
            );
            return {
              id: user.user_id.toString(),
              username: user.username,
              name: user.username,
              workouts: workout ? parseInt(workout.workout_count) : 0,
              followers: response.data.followers.filter(
                (f) => f.following_id === user.user_id
              ).length,
              image: null,
              isFollowing,
            };
          });
          setUsers(transformed);
        }
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
  }, [userData]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFollow = async (userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, isFollowing: true, followers: user.followers + 1 }
          : user
      )
    );
    const token = await AsyncStorage.getItem("jwtToken");
    try {
      await axios.post(
        FOLLOW_USER_URL,
        { following_id: userId, follower_id: userData.user_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isFollowing: false, followers: user.followers - 1 }
            : user
        )
      );
      console.error(err);
    }
  };

  const handleUnfollow = async (userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, isFollowing: false, followers: user.followers - 1 }
          : user
      )
    );
    const token = await AsyncStorage.getItem("jwtToken");
    try {
      await axios.post(
        UNFOLLOW_USER_URL,
        { following_id: userId, follower_id: userData.user_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isFollowing: true, followers: user.followers + 1 }
            : user
        )
      );
      console.error(err);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
        <View style={tw`px-4 py-3`}>
          <View
            style={tw`flex-row items-center bg-zinc-900 rounded-xl px-3 border border-zinc-800`}
          >
            <Ionicons name="search" size={20} color="#71717a" />
            <TextInput
              style={tw`flex-1 py-2.5 px-3 text-white`}
              placeholder="Search users..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={tw`flex-row items-center px-4 py-3 border-b border-zinc-800`}
              onPress={() => navigation.navigate('User-Profile', { users_id: user.id })}
              activeOpacity={0.7}
            >
              <Image
                source={blackDefaultProfilePic}
                style={tw`w-14 h-14 rounded-full border-2 border-orange-500`}
              />

              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`text-white font-semibold`}>
                  {user.username}
                </Text>
                <View style={tw`flex-row mt-1`}>
                  <Text style={tw`text-zinc-500 text-xs`}>
                    {user.workouts} workouts • {user.followers} followers
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  tw`px-4 py-1.5 rounded-full`,
                  user.isFollowing ? tw`bg-zinc-800` : tw`bg-orange-500`,
                ]}
                onPress={() =>
                  user.isFollowing
                    ? handleUnfollow(user.id)
                    : handleFollow(user.id)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    tw`font-semibold text-sm`,
                    user.isFollowing ? tw`text-zinc-400` : tw`text-white`,
                  ]}
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredUsers.length === 0 && (
          <View style={[tw`flex-1 justify-center items-center px-4`, {bottom: height * 0.4}]}>
            <Ionicons name="search" size={48} color="#71717a" />
            <Text style={tw`text-zinc-400 mt-4 text-center text-base`}>
              No users found matching "{searchQuery}"
            </Text>
            <Text style={tw`text-zinc-500 mt-2 text-center text-sm`}>
              Try searching with a different username
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default SearchUser;