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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { BarChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Line } from "react-native-svg";
import HistoryCard from "../components/historyCard";
import HistoryMain from "./historyMain";
import ProfileBarGraph from "../components/profileBarGraph";

const { width, height } = Dimensions.get("window");

const PROFILE_PIC_URL = Platform.select({
  android: "http://10.0.2.2:4005/profilepicture",
  ios: "http://192.168.1.155:4005/profilepicture",
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
        console.log(parsedUserData);
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
        console.log(response.data.stats.followers);
        console.log(response.data.stats.following);
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
          await fetchProfileGraph(userData);
        } else {
          setIsLoading(false);
        }
      };

      initializeData();

      return () => {};
    }, [fetchUserData, fetchStats, fetchProfileGraph])
  );

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

  const fetchProfileGraph = useCallback(async (userData) => {
    if (!userData?.user_id) return;

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(
        `${GET_PROFILE_GRAPH}?user_id=${userData.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 200 &&
        response.data.workoutDates &&
        response.data.workoutTime
      ) {
        setWorkoutDates(response.data.workoutDates);
        setWorkoutTimes(response.data.workoutTime);
        console.log(response.data.workoutDates);
        console.log(response.data.workoutTime);
      }
    } catch (error) {
      console.error("Error getting stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function calculateDailyStreak(workoutDates) {
    if (workoutDates.length === 0) return 0;

    const uniqueDates = [
      ...new Set(
        workoutDates.map((entry) => {
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
        const minutes = (hh * 3600 + mm * 60 + ss) / 60;
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

    const { dataValues, originalValuesArray } = weekDates.reduce(
      (acc, date) => {
        const value = groupedData[date] || 0;
        acc.dataValues.push(value > 60 ? 60 : Math.round(value));
        acc.originalValuesArray.push(originalValues[date] || 0);
        return acc;
      },
      { dataValues: [], originalValuesArray: [] }
    );

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const labels = weekDates.map((date) => dayNames[new Date(date).getDay()]);

    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 40;
    const [tooltipPos, setTooltipPos] = useState({
      visible: false,
      x: 0,
      y: 0,
      value: 0,
      index: null,
    });

    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
        <Text style={styles.chartTitle}>Daily Workout Duration</Text>

        <View style={[styles.chartContainer, { borderColor: "#f97316" }]}>
          <BarChart
            data={{
              labels: labels,
              datasets: [{ data: dataValues }],
            }}
            width={chartWidth}
            height={250}
            fromZero
            chartConfig={{
              backgroundColor: "#000",
              backgroundGradientFrom: "#0f0f0f",
              backgroundGradientTo: "#000",
              decimalPlaces: 0,
              color: () => `rgba(249, 115, 22, 1)`,
              labelColor: () => `rgba(255, 255, 255, 0.8)`,
              style: { borderRadius: 16 },
              formatYLabel: (value) => `${value}m`,
              propsForVerticalLabels: { fill: "#fff", fontSize: 12 },
              propsForHorizontalLabels: { fill: "#fff", fontSize: 12 },
              maxValue: 60,
              segments: 4,
              propsForBackgroundLines: {
                stroke: "rgba(255, 255, 255, 0.1)",
                strokeWidth: 1,
              },
              fillShadowGradient: "#fb923c",
              fillShadowGradientOpacity: 1,
              barPercentage: 0.5,
              useShadowColorFromDataset: false,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              overflow: "visible",
            }}
            verticalLabelRotation={0}
            showValuesOnTopOfBars={false}
            onDataPointClick={(data) => {
              const isSamePoint =
                tooltipPos.x === data.x && tooltipPos.y === data.y;
              setTooltipPos({
                x: data.x,
                y: data.y - 50,
                value: originalValuesArray[data.index],
                index: data.index,
                visible: !isSamePoint || !tooltipPos.visible,
              });
            }}
          />

          <Svg style={styles.gridLine}>
            <Line
              x1="70"
              y1="0"
              x2="70"
              y2="250"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          </Svg>

          {tooltipPos.visible && (
            <View
              style={[
                styles.tooltip,
                {
                  left:
                    tooltipPos.x > chartWidth - 70
                      ? chartWidth - 70
                      : tooltipPos.x - 25,
                  top: tooltipPos.y < 0 ? 0 : tooltipPos.y,
                },
              ]}
            >
              <Text style={styles.tooltipText}>
                {Math.round(tooltipPos.value)}m
              </Text>
              <View style={styles.tooltipArrow} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    chartTitle: {
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      fontSize: 20,
      marginBottom: 24,
      letterSpacing: 0.5,
    },
    chartContainer: {
      position: "relative",
      direction: "ltr",
      borderWidth: 2,
      borderRadius: 16,
      backgroundColor: "#0f0f0f",
      overflow: "hidden",
    },
    gridLine: {
      position: "absolute",
      top: 0,
      left: 0,
      height: 250,
      width: "100%",
    },
    tooltip: {
      position: "absolute",
      backgroundColor: "rgba(249, 115, 22, 0.95)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      zIndex: 1000,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    tooltipText: {
      color: "white",
      fontWeight: "700",
      fontSize: 14,
      includeFontPadding: false,
    },
    tooltipArrow: {
      position: "absolute",
      bottom: -10,
      left: 20,
      width: 0,
      height: 0,
      borderStyle: "solid",
      borderLeftWidth: 5,
      borderRightWidth: 5,
      borderTopWidth: 10,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderTopColor: "rgba(249, 115, 22, 0.95)",
    },
  });

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
  console.log(totalDuration);

  return (
    <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-30`}
      >
        <LinearGradient
          colors={["#000", "#1a1a1a"]}
          style={tw`rounded-b-[40px] pb-6 shadow-xl`}
        >
          <View style={tw`pt-16 px-6`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <TouchableOpacity
                  onPress={handleChangeProfilePicture}
                  style={tw`shadow-lg`}
                >
                  <View style={tw`relative`}>
                    <Image
                      source={
                        profilePic
                          ? { uri: profilePic }
                          : blackDefaultProfilePic
                      }
                      style={tw`w-24 h-24 rounded-full border-4 border-orange-500`}
                    />
                    <View
                      style={tw`absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-2 border-white`}
                    >
                      <Icon name="edit" size={16} color="white" />
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={tw`ml-4 flex-1`}>
                  <Text style={tw`text-white text-2xl font-bold`}>
                    {userData?.name || "Loading..."}
                  </Text>
                  <Text style={tw`text-gray-300 text-base mb-1`}>
                    @{userData?.username || "Loading..."}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={tw`flex-row justify-around mt-6 bg-zinc-900 rounded-2xl p-3`}
            >
              <View style={tw`items-center px-2`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  {followers.length || 0}
                </Text>
                <Text style={tw`text-gray-400 text-sm`}>Followers</Text>
              </View>
              <View style={tw`h-full w-px bg-zinc-800`} />
              <View style={tw`items-center px-2`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  {following.length || 0}
                </Text>
                <Text style={tw`text-gray-400 text-sm`}>Following</Text>
              </View>
              <View style={tw`h-full w-px bg-zinc-800`} />
              <View style={tw`items-center px-2`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  {calculateDailyStreak(workoutDates)}
                </Text>
                <Text style={tw`text-gray-400 text-sm`}>Streak</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <ProfileBarGraph workoutDates={workoutDates} styles={styles}/>

        <View style={tw`px-5 mt-6`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-white text-xl font-bold`}>
              Progress Summary
            </Text>
          </View>

          <LinearGradient
            colors={["#1a1a1a", "#222"]}
            style={tw`p-4 rounded-3xl shadow-lg mb-4`}
          >
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`p-3 bg-orange-500 rounded-2xl`}>
                  <Ionicons name="barbell" size={24} color="white" />
                </View>
                <View style={tw`ml-3`}>
                  <Text style={tw`text-white font-bold text-lg`}>
                    Total Workouts
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>This month</Text>
                </View>
              </View>
              <Text style={tw`text-white text-2xl font-bold`}>
                {stats?.totalWorkouts || 0}
              </Text>
            </View>

            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`p-3 bg-orange-500 rounded-2xl`}>
                  <Ionicons name="time" size={24} color="white" />
                </View>
                <View style={tw`ml-3`}>
                  <Text style={tw`text-white font-bold text-lg`}>
                    Training Time
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>Total hours</Text>
                </View>
              </View>
              <Text style={tw`text-white text-2xl font-bold`}>
                {totalDuration}
              </Text>
            </View>

            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`p-3 bg-orange-500 rounded-2xl`}>
                  <Ionicons name="trophy" size={24} color="white" />
                </View>
                <View style={tw`ml-3`}>
                  <Text style={tw`text-white font-bold text-lg`}>Skills</Text>
                  <Text style={tw`text-gray-400 text-sm`}>Total skills</Text>
                </View>
              </View>
              <Text style={tw`text-white text-2xl font-bold`}>
                {stats?.totalSkills || 0}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={tw`px-5 mt-4 mb-6`}>
          <Text style={tw`text-white text-xl font-bold mb-4`}>
            Quick Actions
          </Text>

          <View style={tw`flex-row justify-between gap-3 mb-3`}>
            <TouchableOpacity
              style={tw`flex-1 bg-zinc-900 p-4 rounded-2xl shadow-lg items-center`}
              onPress={() => navigation.navigate("Settings-Main")}
            >
              <View style={tw`bg-zinc-800 p-3 rounded-full mb-2`}>
                <Ionicons name="settings-outline" size={24} color="#f97316" />
              </View>
              <Text style={tw`text-white text-sm font-medium`}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-1 bg-zinc-900 p-4 rounded-2xl shadow-lg items-center`}
              onPress={handleLogout}
            >
              <View style={tw`bg-zinc-800 p-3 rounded-full mb-2`}>
                <Ionicons name="exit-outline" size={24} color="#f97316" />
              </View>
              <Text style={tw`text-white text-sm font-medium`}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout History */}
        <View style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`ml-5 text-white mb-2 text-xl font-bold`}>
              Recent Workouts
            </Text>
          </View>

          <View style={tw`px-5 mb-4`}>
            <View style={tw`flex-row items-center justify-between mb-3`}></View>

            {stats.totalWorkouts > 0 ? (
              <HistoryCard user_id={userData.user_id} widthNumber={0.9} />
            ) : (
              <View style={tw`flex-1 items-center justify-center mt-10`}>
                <Icon
                  name="package"
                  size={60}
                  color="#ffa500"
                  style={tw`opacity-50 mb-4`}
                />
                <Text style={tw`text-orange-500 text-xl font-bold mb-2`}>
                  No Workout Data Yet
                </Text>
                <Text style={tw`text-zinc-500 text-center px-10`}>
                  Finish a workout for your history to display here.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;
