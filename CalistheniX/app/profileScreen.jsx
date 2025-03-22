import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import firebase from "firebase/app";
import Constants from "expo-constants";
import AWS from "aws-sdk";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { BarChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Config from "react-native-config";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import cow from "../assets/images/cow.png";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Line } from "react-native-svg";
import HistoryCard from "../components/historyCard";
import HistoryMain from "./historyMain";
import ProfileBarGraph from "../components/profileBarGraph";
import { BarChart3 } from "lucide-react-native";

const awsAccessKey = Constants.expoConfig.extra.awsAccessKey;
const awsSecretKey = Constants.expoConfig.extra.awsSecretKey;
const awsRegion = Constants.expoConfig.extra.awsRegion;
const awsBucket = Constants.expoConfig.extra.awsBucket;

const { width, height } = Dimensions.get("window");

const PROFILE_PIC_URL = Platform.select({
  android: "http://10.0.2.2:4005/profilepicture",
  ios: "http://192.168.1.155:4005/profilepicture",
});

const GET_PROFILE_PIC_URL = Platform.select({
  android: "http://10.0.2.2:4005/getprofilepicture",
  ios: "http://192.168.1.155:4005/getprofilepicture",
});

const GET_STATS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getstats",
  ios: "http://192.168.1.155:4005/getstats",
});

const GET_PROFILE_GRAPH = Platform.select({
  android: "http://10.0.2.2:4005/getprofilegraph",
  ios: "http://192.168.1.155:4005/getprofilegraph",
});

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [imageKey, setImageKey] = useState(0);

  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const [workoutDates, setWorkoutDates] = useState([]);
  const [workoutTimes, setWorkoutTimes] = useState([]);

  const [profilePic, setProfilePic] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSkills: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

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

        setFollowers(response.data.stats.followers);
        setFollowing(response.data.stats.following);
        setWorkoutDates(response.data.stats.workoutDates);
      }
    } catch (error) {
      console.error("Error getting stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        setIsLoading(true);

        const userData = await fetchUserData();
        if (userData) {
          await fetchStats(userData);
        } else {
          setIsLoading(false);
        }
      };

      initializeData();

      return () => {};
    }, [fetchUserData, fetchStats])
  );

  AWS.config.update({
    region: awsRegion,
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
  });

  const s3 = new AWS.S3();

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
      const uri = pickerResult.assets[0].uri;
      await uploadProfilePicture(userData.user_id, uri);
    }
  };

  const uploadProfilePicture = async (userId, uri) => {
    try {
      const fileExtension = "png";
      const fileName = `${userId}profilePic.${fileExtension}`;
      const filePath = `profile_pics/${fileName}`;

      // ✅ Check if the profile picture already exists
      const checkIfExists = await s3
        .headObject({
          Bucket: awsBucket,
          Key: filePath,
        })
        .promise()
        .catch(() => null); // If not found, it returns null

      if (checkIfExists) {
        console.log("Profile picture exists, deleting old one...");
        await s3
          .deleteObject({
            Bucket: awsBucket,
            Key: filePath,
          })
          .promise();
        console.log("Old profile picture deleted.");
      }

      // ✅ Upload the new profile picture
      const response = await fetch(uri);
      const blob = await response.blob();

      await s3
        .upload({
          Bucket: awsBucket,
          Key: filePath,
          Body: blob,
          ContentType: `image/${fileExtension}`,
        })
        .promise();

      console.log(
        "Profile picture uploaded successfully:",
        `https://${awsBucket}.s3.ap-southeast-2.amazonaws.com/${filePath}`
      );

      setImageKey(Math.random());
      setProfilePicUrl(
        `https://${awsBucket}.s3.ap-southeast-2.amazonaws.com/${filePath}`
      );

      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const response = axios.post(
          PROFILE_PIC_URL,
          {
            user_id: userId,
            profile_pic: `https://${awsBucket}.s3.ap-southeast-2.amazonaws.com/${filePath}`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error("Error sending profile picture to psql", err);
      }

      return `https://${awsBucket}.s3.ap-southeast-2.amazonaws.com/${filePath}`;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw new Error("Failed to upload profile picture");
    }
  };

  const getProfilePictureUrl = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(GET_PROFILE_PIC_URL, {
        params: {
          user_id: userData.user_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.profile_pic) {
        console.log(response.data.profile_pic);
        return response.data.profile_pic;
      } else {
        console.log("No profile pic found, returning default.");
        return "https://calisthenix.s3.ap-southeast-2.amazonaws.com/profile_pics/blackDefaultProfilePic.png";
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);

      return "https://calisthenix.s3.ap-southeast-2.amazonaws.com/profile_pics/blackDefaultProfilePic.png";
    }
  };

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

  function calculateDailyStreak(workoutDates) {
    if (workoutDates.length === 0) return 0;

    const uniqueDates = [
      ...new Set(
        workoutDates?.map((entry) => {
          const date = new Date(entry.date);
          return Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
          );
        })
      ),
    ].sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

    const lastWorkoutUTC = uniqueDates[0];
    const dayDifference = (todayUTC - lastWorkoutUTC) / (1000 * 3600 * 24);

    if (dayDifference > 1) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const previousDay = uniqueDates[i - 1];
      const currentDay = uniqueDates[i];

      if (previousDay - currentDay === 1000 * 3600 * 24) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  const profileBarGraph = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const groupedData = {};
    const originalValues = {};
    for (let i = 0; i < workoutDates.length; i++) {
      const dateObj = new Date(workoutDates[i].date);
      if (dateObj >= sunday && dateObj <= saturday) {
        const dateKey = dateObj.toISOString().split("T")[0];
        const [hh, mm, ss] = workoutTimes[i].workout_time
          .split(":")
          .map(Number);
        const minutes = hh * 60 + mm + ss / 60;
        groupedData[dateKey] = (groupedData[dateKey] || 0) + minutes;
        originalValues[dateKey] = minutes;
      }
    }

    const weekDates = [];
    let current = new Date(sunday);
    while (current <= saturday) {
      weekDates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    const dayData = weekDates.map((date) => {
      const dayObj = new Date(date);
      return {
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayObj.getDay()],
        value: Math.round(groupedData[date] || 0),
        date: date,
      };
    });

    const maxValue = Math.max(...dayData.map((d) => d.value), 60);

    // Calculate total for the week
    const totalMinutes = dayData.reduce((sum, day) => sum + day.value, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Check if the current week has more minutes than previous week (sample calculation)
    // You'd need to implement logic to compare with previous week
    const percentageChange = 15; // Sample value
    const isPositive = percentageChange > 0;

    return (
      <View style={tw`mx-2 mb-6`}>
        <LinearGradient
          colors={["#18181b", "#09090b"]}
          style={tw`rounded-2xl p-5`}
        >
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`font-bold text-lg text-white`}>
              Weekly Progress
            </Text>
            <View style={tw`bg-orange-500/20 p-1 rounded-full`}>
              <BarChart3 size={18} color="#f97316" />
            </View>
          </View>

          <View style={tw`flex-row justify-between items-end h-32 mb-4`}>
            {dayData.map((day, index) => (
              <TouchableOpacity
                key={day.day}
                onPress={() => {
                  // Show tooltip logic here
                }}
                style={tw`flex-col items-center`}
              >
                <View style={tw`flex-grow flex items-end h-full justify-end`}>
                  <View
                    style={[
                      tw`w-8 rounded-t-sm`,
                      day.value > 0 ? tw`bg-orange-500` : tw`bg-zinc-700`,
                      {
                        height: `${(day.value / maxValue) * 100}%`,
                        minHeight: day.value > 0 ? 4 : 2,
                      },
                    ]}
                  />
                </View>
                <Text style={tw`text-xs text-zinc-400 mt-2`}>{day.day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={tw`flex-row justify-between mt-6 border-t border-zinc-700 pt-4`}
          >
            <View>
              <Text style={tw`text-xs text-zinc-400`}>This Week</Text>
              <Text
                style={tw`text-xl font-bold text-white`}
              >{`${hours}h ${minutes}m`}</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-green-500/20 p-1 rounded-full mr-1`}>
                <ArrowUpRight size={16} color="#22c55e" />
              </View>
              <Text style={tw`text-green-500 text-sm font-semibold`}>+15%</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const calculateTotalDuration = (durations) => {
    if (!durations || !Array.isArray(durations)) {
      return "0";
    }

    const durationToSeconds = (duration) => {
      if (!duration) return 0;
      const [hours, minutes, seconds] = duration.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const totalSeconds = durations
      .map((item) => durationToSeconds(item.workout_time))
      .reduce((acc, curr) => acc + curr, 0);

    if (totalSeconds < 60) {
      return `${totalSeconds} sec${totalSeconds !== 1 ? "s" : ""}`;
    } else if (totalSeconds < 3600) {
      const minutes = Math.floor(totalSeconds / 60);
      return `${minutes} min${minutes !== 1 ? "s" : ""}`;
    } else {
      const hours = Math.floor(totalSeconds / 3600);
      return `${hours} hr${hours !== 1 ? "s" : ""}`;
    }
  };

  const totalDuration = calculateTotalDuration(stats.totalDuration);

  const workoutCalender = (workoutDates) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const currentMonthWorkouts = workoutDates
      .map(({ date }) => new Date(date))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getUTCDate());

    const workoutDays = new Set(currentMonthWorkouts);

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate the calendar days
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null); // Empty slots before the first day
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    useEffect(() => {
      if (userData?.user_id) {
        const fetchProfilePicture = async () => {
          try {
            const url = await getProfilePictureUrl();
            setProfilePicUrl(url);
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchProfilePicture();
      } else {
        setLoading(false);
      }
    }, [userData?.user_id]);
    return (
      <View style={tw`mb-6`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`text-white text-xl font-bold`}>Workout Calendar</Text>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="flame" size={16} color="#f97316" />
            <Text style={tw`text-orange-500 text-xs font-bold ml-1`}>
              {workoutDates ? calculateDailyStreak(workoutDates) : 0} Day Streak
            </Text>
          </View>
        </View>

        <View style={tw`p-4 rounded-3xl border border-zinc-700/20`}>
          {/* Weekday labels */}
          <View style={tw`flex-row justify-between mb-3`}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text key={index} style={tw`text-gray-400 text-center text-xs`}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={tw`flex-wrap flex-row justify-between`}>
            {calendarDays.map((day, index) => (
              <View key={index} style={tw`w-[13%] items-center mb-2`}>
                {day ? (
                  <View
                    style={tw`h-8 w-8 rounded-full items-center justify-center ${
                      day === today.getDate()
                        ? "bg-orange-500" // Highlight today
                        : workoutDays.has(day)
                        ? "bg-orange-500/20 border border-orange-500/50" // Highlight workout days
                        : "bg-zinc-800"
                    }`}
                  >
                    <Text style={tw`text-white text-xs`}>{day}</Text>
                  </View>
                ) : (
                  <View style={tw`h-8 w-8`} />
                )}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={tw`flex-row justify-center mt-4`}>
            <View style={tw`flex-row items-center mr-4`}>
              <View style={tw`w-3 h-3 rounded-full bg-orange-500 mr-2`} />
              <Text style={tw`text-gray-400 text-xs`}>Today</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/50 mr-2`}
              />
              <Text style={tw`text-gray-400 text-xs`}>Workout Day</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          style={tw`flex-1`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-30`}
        >
          {/* Profile Header Section */}
          <View style={tw`px-2 mt-5 pb-8 rounded-b-[40px]`}>
            {/* User Info Row */}
            <View style={tw`flex-row items-center mb-6`}>
              <TouchableOpacity
                onPress={handleChangeProfilePicture}
                style={tw`shadow-lg`}
              >
                <View style={tw`relative`}>
                  <Image
                    source={{
                      uri: profilePicUrl,
                      key: imageKey,
                    }}
                    style={tw`w-24 h-24 rounded-full border-4 border-orange-500`}
                  />

                  <View
                    style={tw`absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-2 border-black`}
                  >
                    <Icon name="edit" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={tw`ml-5 flex-1`}>
                <Text style={tw`text-white text-2xl font-bold mb-1`}>
                  {userData?.name || "Loading..."}
                </Text>
                <Text style={tw`text-orange-400 text-base`}>
                  @{userData?.username || "Loading..."}
                </Text>
              </View>
            </View>

            {/* Stats Cards Row */}
            <View style={tw`flex-row justify-between gap-3`}>
              <View
                style={tw`flex-1 bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800`}
              >
                <TouchableOpacity onPress={() => navigation.navigate('Followers')}>
                  <Text style={tw`text-white text-xl font-bold text-center`}>
                    {followers.length || 0}
                  </Text>
                  <Text style={tw`text-gray-400 text-sm text-center`}>
                    Followers
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={tw`flex-1 bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800`}
              >
                <TouchableOpacity onPress={() => navigation.navigate('Following')}>
                  <Text style={tw`text-white text-xl font-bold text-center`}>
                    {following.length || 0}
                  </Text>
                  <Text style={tw`text-gray-400 text-sm text-center`}>
                    Following
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={tw`px-2`}>
            {/* Progress Summary Section */}
            <View style={tw`mb-6`}>
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  Progress Summary
                </Text>
                <View style={tw`bg-orange-500/20 px-3 py-1 rounded-full`}>
                  <Text style={tw`text-orange-500 text-xs font-bold`}>
                    {new Date().toLocaleString("default", { month: "long" })}{" "}
                    {new Date().getFullYear()}
                  </Text>
                </View>
              </View>

              <LinearGradient
                colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]}
                style={tw`rounded-3xl overflow-hidden shadow-lg border border-zinc-800/50`}
              >
                {/* Workouts */}
                <View
                  style={tw`flex-row justify-between items-center p-4 border-b border-zinc-800/50`}
                >
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`p-3 bg-orange-500 rounded-2xl`}>
                      <Ionicons name="barbell" size={24} color="white" />
                    </View>
                    <View style={tw`ml-3`}>
                      <Text style={tw`text-white font-bold text-lg`}>
                        Workouts
                      </Text>
                      <Text style={tw`text-gray-400 text-xs`}>
                        Total Workouts
                      </Text>
                    </View>
                  </View>
                  <Text style={tw`text-white text-2xl font-bold`}>
                    {stats?.totalWorkouts || 0}
                  </Text>
                </View>

                {/* Training Time */}
                <View
                  style={tw`flex-row justify-between items-center p-4 border-b border-zinc-800/50`}
                >
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`p-3 bg-orange-500 rounded-2xl`}>
                      <Ionicons name="time" size={24} color="white" />
                    </View>
                    <View style={tw`ml-3`}>
                      <Text style={tw`text-white font-bold text-lg`}>
                        Training Time
                      </Text>
                      <Text style={tw`text-gray-400 text-xs`}>Total hours</Text>
                    </View>
                  </View>
                  <Text style={tw`text-white text-2xl font-bold`}>
                    {totalDuration}
                  </Text>
                </View>

                {/* Skills */}
                <View style={tw`flex-row justify-between items-center p-4`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`p-3 bg-orange-500 rounded-2xl`}>
                      <Ionicons name="trophy" size={24} color="white" />
                    </View>
                    <View style={tw`ml-3`}>
                      <Text style={tw`text-white font-bold text-lg`}>
                        Skills
                      </Text>
                      <Text style={tw`text-gray-400 text-xs`}>
                        Total skills
                      </Text>
                    </View>
                  </View>
                  <Text style={tw`text-white text-2xl font-bold`}>
                    {stats?.totalSkills || 0}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Workout Calendar - NEW */}
            {workoutCalender(workoutDates)}

            {/* Quick Actions Section */}
            <View style={tw`mb-6 px-2`}>
              <Text style={tw`text-white text-xl font-bold mb-4`}>
                Quick Actions
              </Text>

              <View style={tw`flex-row justify-between gap-4 mb-3`}>
                <TouchableOpacity
                  style={tw`flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800/50 items-center`}
                  onPress={() => navigation.navigate("Settings-Main")}
                >
                  <View style={tw`bg-zinc-800 p-3 rounded-full mb-2`}>
                    <Ionicons
                      name="settings-outline"
                      size={24}
                      color="#f97316"
                    />
                  </View>
                  <Text style={tw`text-white text-sm font-medium`}>
                    Settings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800/50 items-center`}
                  onPress={handleLogout}
                >
                  <View style={tw`bg-zinc-800 p-3 rounded-full mb-2`}>
                    <Ionicons name="exit-outline" size={24} color="#f97316" />
                  </View>
                  <Text style={tw`text-white text-sm font-medium`}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Workouts Section */}
            <View style={tw`mb-8`}>
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  Recent Workouts
                </Text>
              </View>

              <HistoryCard user_id={userData?.user_id} widthNumber={0.95} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProfileScreen;
