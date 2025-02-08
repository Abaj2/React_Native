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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Line } from "react-native-svg";
import HistoryCard from "../components/historyCard";
import HistoryMain from "./historyMain";

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
        console.log("total duration", response.data.stats.totalDuration);
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
        await fetchProfileGraph(userData);
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
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          Daily Workout Duration
        </Text>

        <View style={{ position: "relative", direction: "ltr" }}>
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
              backgroundGradientFrom: "#1a1a1a",
              backgroundGradientTo: "#000",
              decimalPlaces: 0,

              color: () => `rgba(249, 115, 22, 1)`,
              labelColor: () => `rgba(255, 255, 255, 1)`,
              style: { borderRadius: 16 },
              formatYLabel: (value) => `${value}m`,
              propsForVerticalLabels: { fill: "#fff" },
              propsForHorizontalLabels: { fill: "#fff" },
              maxValue: 60,
              segments: 4,

              propsForBackgroundLines: {
                stroke: "rgba(128, 128, 128, 0.3)",
                strokeDasharray: "",
              },

              fillShadowGradient: "rgba(249, 115, 22, 1)",
              fillShadowGradientOpacity: 1,
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
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: 250,
              width: chartWidth,
            }}
          >
            <Line
              x1="70"
              y1="0"
              x2="70"
              y2="250"
              stroke="rgba(128, 128, 128, 0.3)"
              strokeWidth="1"
            />
          </Svg>

          {tooltipPos.visible && (
            <View
              style={{
                position: "absolute",
                left:
                  tooltipPos.x > chartWidth - 70
                    ? chartWidth - 70
                    : tooltipPos.x - 25,
                top: tooltipPos.y < 0 ? 0 : tooltipPos.y,
                backgroundColor: "rgba(249, 115, 22, 0.9)",
                padding: 8,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
                zIndex: 1000,
                elevation: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {Math.round(tooltipPos.value)}m
              </Text>
              <View
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: 20,
                  width: 0,
                  height: 0,
                  backgroundColor: "transparent",
                  borderStyle: "solid",
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 10,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: "rgba(249, 115, 22, 0.9)",
                }}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const calculateTotalDuration = (durations) => {
    if (!durations || !Array.isArray(durations)) {
      return "0 seconds";
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
                        profilePic
                          ? { uri: profilePic }
                          : blackDefaultProfilePic
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
          {profileBarGraph()}
          <LinearGradient
            colors={["#f97316", "#ea580c"]}
            style={tw`p-7 mx-5 my-6 rounded-xl shadow-lg`}
          >
            <View style={tw`flex-row justify-evenly items-center`}>
              <View style={tw`flex-1 items-center`}>
                <Text style={tw`text-white text-2xl font-bold text-center`}>
                  {stats?.totalWorkouts ? `${stats.totalWorkouts}` : "None"}
                </Text>
                <Text style={tw`text-white text-sm text-center`}>
                  Total Workouts
                </Text>
              </View>
              <View style={tw`flex-1 items-center`}>
                <Text style={tw`text-white text-2xl font-bold text-center`}>
                  {totalDuration}
                </Text>
                <Text style={tw`text-white text-sm text-center`}>
                  Training Time
                </Text>
              </View>
              <View style={tw`flex-1 items-center`}>
                <Text style={tw`text-white text-2xl font-bold text-center`}>
                  {stats?.totalSkills ? `${stats.totalSkills}` : "None"}
                </Text>
                <Text style={tw`text-white text-sm text-center`}>
                  Total Skills
                </Text>
              </View>
            </View>
          </LinearGradient>

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
        <View style={tw`mt-5`}>
          <HistoryMain />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;
