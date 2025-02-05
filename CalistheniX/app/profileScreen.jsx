import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const PROFILE_PIC_URL = Platform.select({
  android: "http://10.0.2.2:4005/profilepicture",
  ios: "http://192.168.1.155:4005/profilepicture",
});

const GET_STATS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getstats",
  ios: "http://192.168.1.155:4005/getstats",
});

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState();
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSkills: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        setUsername(parsedUserData.username);
        return parsedUserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }, []);

  const fetchStats = useCallback(async (userData) => {
    if (!userData?.user_id) return;

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(
        `${GET_STATS_URL}?user_id=${userData.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.stats) {
        setStats({
          totalWorkouts: response.data.stats.totalWorkouts || 0,
          totalSkills: response.data.stats.totalSkills || 0,
          totalDuration: response.data.stats.totalDuration || 0,
        });
        console.log(response.data.stats.totalDuration);
      }
    } catch (error) {
      console.error("Error getting stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const userData = await fetchUserData();
      if (userData) {
        await fetchStats(userData);
      } else {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [fetchUserData, fetchStats]);

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("Logout cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            if (keys.length > 0) {
              await AsyncStorage.multiRemove(keys);
              console.log("AsyncStorage cleared.");
              navigation.replace("Sign-in");
            } else {
              console.log("No items to clear in AsyncStorage.");
            }
          } catch (error) {
            console.error("Error clearing AsyncStorage:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleChangeProfilePicture = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Allow permission to change profile picture"
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      try {
        const newProfilePicUri = pickerResult.assets[0].uri;
        setProfilePic(newProfilePicUri);
        Alert.alert("Success", "Profile picture updated");

        await AsyncStorage.setItem("profile_pic", newProfilePicUri);

        uploadProfilePicture(newProfilePicUri);
      } catch (error) {
        console.error("Error saving profile picture:", error);
        Alert.alert("Error", "Failed to update profile picture.");
      }
    }
  };

  const uploadProfilePicture = async (uri) => {
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const jwtToken = await AsyncStorage.getItem("jwtToken");

    try {
      const response = await axios.post(PROFILE_PIC_URL, {
        username: userData.username,
        profile_pic: base64Image,
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Profile picture uploaded to backend:", response.data);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("Error", "Failed to upload profile picture.");
    }
  };

  const calculateTotalDuration = (durations) => {
    if (!durations || !Array.isArray(durations)) {
      return "00:00:00";
    }

    const durationToSeconds = (duration) => {
      if (!duration) return 0;
      const [hours, minutes, seconds] = duration.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const totalSeconds = durations
      .map((item) => durationToSeconds(item.duration))
      .reduce((acc, curr) => acc + curr, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const totalDuration = calculateTotalDuration(stats.totalDuration);
  console.log(totalDuration);

  return (
    <LinearGradient
      colors={["#000", "#1a1a1a"]}
      style={tw`flex-1`}
    >
      <View style={tw`flex-1`}>
       
        <LinearGradient
          colors={["#1f2937", "#111827"]}
          style={tw`rounded-b-3xl pb-6 shadow-lg`}
        >
          <View style={tw`pt-20 px-5`}>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity onPress={handleChangeProfilePicture}>
                <View style={tw`relative`}>
                  <Image
                    source={
                      profilePic ? { uri: profilePic } : blackDefaultProfilePic
                    }
                    style={tw`w-24 h-24 rounded-full border-4 border-orange-500`}
                  />
                  <View
                    style={tw`absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full shadow-lg`}
                  >
                    <Icon name="edit" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={tw`ml-4`}>
                <Text style={tw`text-white text-2xl font-bold`}>
                  {userData ? userData.username : "Loading..."}
                </Text>
                <Text style={tw`text-gray-300`}>
                  {userData ? userData.email : "Loading..."}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>


        <View
          style={tw`flex-row justify-around p-7 bg-zinc-900 mx-5 my-6 rounded-xl shadow-lg`}
        >
          <View style={tw`items-center`}>
            <Text style={tw`text-white text-2xl font-bold`}>
              {stats?.totalWorkouts ? `${stats.totalWorkouts}` : "None"}
            </Text>
            <Text style={tw`text-gray-400 text-sm`}>Total Workouts</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`text-white text-2xl font-bold`}>
              {totalDuration}
            </Text>
            <Text style={tw`text-gray-400 text-sm`}>Training Time</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`text-white text-2xl font-bold`}>
              {stats?.totalSkills ? `${stats.totalSkills}` : "None"}
            </Text>
            <Text style={tw`text-gray-400 text-sm`}>Total Skills</Text>
          </View>
        </View>

   
        <View style={tw`px-5 mt-2`}>
          <TouchableOpacity
            style={tw`flex-row items-center justify-between bg-zinc-900 p-4 rounded-lg mb-4 shadow-lg`}
            onPress={() => navigation.navigate("Settings-Main")}
          >
            <View style={tw`flex-row items-center`}>
              <Icon name="settings" size={24} color="orange" />
              <Text style={tw`text-white ml-4 text-base`}>App Settings</Text>
            </View>
            <Ionicons name="chevron-forward" color="orange" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-row items-center justify-between bg-zinc-900 p-4 rounded-lg shadow-lg`}
            onPress={handleLogout}
          >
            <View style={tw`flex-row items-center`}>
              <Ionicons name="exit-outline" size={24} color="orange" />
              <Text style={tw`text-white ml-4 text-base`}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" color="orange" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ProfileScreen;
