import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  TextInput,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from "twrnc";
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import RNPickerSelect from "react-native-picker-select";
import { Dropdown } from "react-native-element-dropdown";
import Skill from "../components/skill.jsx";
import Workouts from "../components/workouts.jsx";
import { LinearGradient } from "expo-linear-gradient";

import HistoryCard from "../components/historyCard.jsx";

import axios from "axios";
import Progress from "../components/progress.jsx";
import { useFocusEffect } from "expo-router";
import ProfileBarGraph from "../components/profileBarGraph.jsx";
import {
  Dumbbell,
  Barbell,
  ArmFlexed,
  DumbbellIcon,
  User,
} from "lucide-react-native";
import UserProfileWorkoutGraph from "../components/userProfileWorkoutGraph.jsx";

const { width, height } = Dimensions.get("window");

const GET_WORKOUTS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getcustomworkouts",
  ios: "http://192.168.1.155:4005/getcustomworkouts",
});

const GET_PROFILE_GRAPH = Platform.select({
  android: "http://10.0.2.2:4005/getprofilegraph",
  ios: "http://192.168.1.155:4005/getprofilegraph",
});

const WorkoutsMain = () => {
  const navigation = useNavigation();
  const [isDarkMode] = useState(true);

  const [workoutDates, setWorkoutDates] = useState([]);
  const [workoutTimes, setWorkoutTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState();

  const [thisWeekDuration, setThisWeekDuration] = useState({
    total_duration_seconds: { seconds: 0 },
  });
  const [lastWeekDuration, setLastWeekDuration] = useState({
    total_duration_seconds: { seconds: 0 },
  });
  const [routineLength, setRoutineLength] = useState(0);

  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

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

  const GET_DURATION_URL = Platform.select({
    android: "http://10.0.2.2:4005/getduration",
    ios: "http://192.168.1.155:4005/getduration",
  });

  const DELETE_ROUTINE_URL = Platform.select({
    android: "http://10.0.2.2:4005/deleteroutine",
    ios: "http://192.168.1.155:4005/deleteroutine",
  });

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

  const formatDuration = (workout_time) => {
    if (
      !workout_time ||
      !workout_time.total_duration_seconds ||
      isNaN(workout_time.total_duration_seconds)
    ) {
      return "0m";
    }

    const totalSeconds = Math.floor(
      parseFloat(workout_time.total_duration_seconds)
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${totalSeconds}s`;
  };

  const getPercentageChange = () => {
    const thisWeek = parseFloat(thisWeekDuration?.total_duration_seconds || 0);
    const lastWeek = parseFloat(lastWeekDuration?.total_duration_seconds || 0);

    if (lastWeek === 0) {
      return thisWeek === 0 ? 0 : 100;
    }

    return ((thisWeek - lastWeek) / lastWeek) * 100;
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;

  useEffect(() => {
    const getThisWeekDuration = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("jwtToken");
        const userData = JSON.parse(await AsyncStorage.getItem("userData"));
        const response = await axios.get(GET_DURATION_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            user_id: userData.user_id,
          },
        });
        setThisWeekDuration(response.data.thisWeekDuration);
        setLastWeekDuration(response.data.lastWeekDuration);
        setRoutineLength(response.data.routineLength);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getThisWeekDuration();
  }, []);

  useEffect(() => {
    const getWorkouts = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("jwtToken");
        const userData = JSON.parse(await AsyncStorage.getItem("userData"));
        const response = await axios.get(GET_WORKOUTS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            user_id: userData.user_id,
          },
        });
        setWorkouts(response.data.workouts);
        setExercises(response.data.exercises);
        setSets(response.data.sets);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getWorkouts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getExerciseCount = (workoutId) => {
    return exercises.filter((exercise) => exercise.workout_id === workoutId)
      .length;
  };

  const handleStartRoutine = (workoutId, workout) => {
    navigation.navigate("custom-workout", {
      workouts: workouts.filter((workout) => workout.workout_id === workoutId),
      exercisesArray: exercises.filter(
        (exercise) => exercise.workout_id === workoutId
      ),
      sets: sets.filter((set) => set.workout_id === workoutId),
      workoutId: workoutId,
      workoutName: workout,
    });
  };

  const deleteRoutine = async (workoutId) => {
    const user_id = JSON.parse(await AsyncStorage.getItem("userData")).user_id;
    try {
      const response = await axios.post(
        DELETE_ROUTINE_URL,
        {
          workout_id: workoutId,
          user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (response.status === 200) {
        setWorkouts((prevWorkouts) =>
          prevWorkouts.filter((workout) => workout.workout_id !== workoutId)
        );
        console.log("Routine deleted successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        return JSON.parse(storedUserData);
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
    return null;
  }, []);

  const fetchProfileGraph = useCallback(async (userData) => {
    if (!userData?.user_id) return;

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(
        `${GET_PROFILE_GRAPH}?user_id=${userData.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.workoutDates && response.data?.workoutTime) {
        setWorkoutDates(response.data.workoutDates);
        setWorkoutTimes(response.data.workoutTime);
      }
    } catch (error) {
      console.error("Error getting stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const initializeData = async () => {
      const userData = await fetchUserData();
      if (userData && isActive) {
        await fetchProfileGraph(userData);
      }
    };

    initializeData();

    return () => {
      isActive = false;
    };
  }, [fetchUserData, fetchProfileGraph]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#000", "#1a1a1a"]}
        style={tw`flex-1 justify-center items-center`}
      >
        <ActivityIndicator size="large" color="gray" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={tw`pb-20`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`px-2 pt-6`}>
            <View style={tw`flex-row justify-between items-center ml-2`}>
              <View style={tw`flex-row gap-25`}>
                <View>
                  <Text style={tw`text-3xl font-bold text-white`}>
                    Workouts
                  </Text>
                </View>
                <View style={tw`flex-row mt-3`}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={20}
                    color="#f97316"
                  />
                  <Text
                    style={tw`font-bold text-sm text-orange-500 ml-2`}
                  >{`${calculateDailyStreak(workoutDates)} day streak`}</Text>
                </View>
              </View>
            </View>
          </View>
          <ProfileBarGraph
            percentageChange={percentageChange}
            isPositive={isPositive}
            workoutTimes={workoutTimes}
            workoutDates={workoutDates}
            styles={styles}
          />
          {/*<UserProfileWorkoutGraph workoutDates={workoutDates} workoutTimes={workoutTimes} /> */}

          <View style={[tw`px-2 mt-2`, {}]}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl ml-1 font-black text-white`}>
                Your Workouts
              </Text>
              <TouchableOpacity>
                {/*} <Text style={tw`text-orange-500 text-sm font-bold`}>
                  See All
                </Text> */}
              </TouchableOpacity>
            </View>
            <ScrollView style={[tw``, {}]}>
              {workouts.length === 0 ? (
                <LinearGradient
                  colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]}
                  style={tw`rounded-3xl p-6`}
                >
                  <Text style={tw`text-white text-center`}>
                    No routines created yet
                  </Text>
                </LinearGradient>
              ) : (
                workouts.map((workout) => (
                  <LinearGradient
                    key={workout.workout_id}
                    colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]}
                    style={tw`border border-zinc-800/50 rounded-3xl p-6 mb-4`}
                  >
                    <View
                      style={tw` flex-row justify-between items-start mb-4`}
                    >
                      <Text
                        style={tw`text-white text-lg font-bold max-w-[60%]`}
                      >
                        {workout.title}
                      </Text>
                      <View style={tw`bg-orange-500/20 px-2 py-1 rounded-full`}>
                        <Text style={tw`text-orange-500 text-xs font-bold`}>
                          {formatDate(workout.date)}
                        </Text>
                      </View>
                      <View>
                        <TouchableOpacity
                          onPress={() => deleteRoutine(workout.workout_id)}
                        >
                          <View
                            style={tw`bg-red-500/10 px-2 py-1 rounded-full`}
                          >
                            <MaterialIcons
                              name="delete-outline"
                              size={22}
                              color="#ef4444"
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={tw`flex-row items-center mb-4`}>
                      <Ionicons name="time-outline" size={16} color="#f97316" />
                      <Text style={tw`text-white text-sm ml-2`}>
                        {workout.workout_time}
                      </Text>
                      <Text style={tw`text-zinc-500 mx-2`}>•</Text>

                      <View style={tw`flex-row items-center`}>
                        <DumbbellIcon size={14} color="#f97316" />
                        <Text style={tw`text-white text-sm ml-2`}>
                          {getExerciseCount(workout.workout_id)} Exercises
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        tw`bg-orange-500 py-3 rounded-xl`,
                        {
                          shadowColor: "#f97316",
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.4,
                          shadowRadius: 6,
                        },
                      ]}
                      onPress={() =>
                        handleStartRoutine(workout.workout_id, workout.title)
                      }
                    >
                      <Text style={tw`text-white text-center font-bold`}>
                        Start Workout
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ))
              )}
            </ScrollView>
          </View>

          <View style={tw`px-2 mt-4`}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`ml-1 text-xl font-black text-white`}>
                All Exercises
              </Text>
              <TouchableOpacity>
                {/*<Text style={tw`text-orange-500 text-sm font-bold`}>
                  Filter
                </Text>*/}
              </TouchableOpacity>
            </View>

            <Workouts isDarkMode={isDarkMode} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WorkoutsMain;
