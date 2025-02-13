import React, { useEffect, useState } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from "twrnc";
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  FontAwesome5,
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

const { width, height } = Dimensions.get("window");

const GET_WORKOUTS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getcustomworkouts",
  ios: "http://192.168.1.155:4005/getcustomworkouts",
});

const WorkoutsMain = () => {
  const navigation = useNavigation();
  const [isDarkMode] = useState(true);

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

  const GET_DURATION_URL = Platform.select({
    android: "http://10.0.2.2:4005/getduration",
    ios: "http://192.168.1.155:4005/getduration",
  });

  const DELETE_ROUTINE_URL = Platform.select({
    android: "http://10.0.2.2:4005/deleteroutine",
    ios: "http://192.168.1.155:4005/deleteroutine",
  });

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
      }
    };
    getThisWeekDuration();
  }, []);

  useEffect(() => {
    const getWorkouts = async () => {
      try {
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
      }
    };
    getWorkouts();
  });

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
        console.log("Routine deleted successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <LinearGradient colors={["#09090b", "#18181b"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={tw`pb-20`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`px-5 pt-6 pb-4`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-3xl font-black text-white`}>
                CalistheniX
                <Text style={tw`text-orange-500`}>.</Text>
              </Text>
              <TouchableOpacity
                style={tw`bg-orange-500/20 p-2 rounded-full`}
                onPress={() => navigation.navigate("Profile")}
              >
                <Ionicons name="person" size={24} color="#f97316" />
              </TouchableOpacity>
            </View>

            <View style={tw`flex-row justify-between mb-6`}>
              <LinearGradient
                colors={["rgba(249,115,22,0.4)", "rgba(234,88,12,0.1)"]}
                end={{ x: 1, y: 1 }}
                style={[
                  tw`p-4 rounded-2xl w-[48%] border border-orange-500`,
                  {},
                ]}
              >
                <Text style={tw`text-white text-xs font-bold mb-1`}>
                  Active
                </Text>
                <Text
                  style={tw`text-white text-xl font-black`}
                >{`${routineLength} Routine${
                  routineLength > 1 ? "s" : ""
                }`}</Text>
                <FontAwesome5
                  name="running"
                  size={20}
                  color="white"
                  style={tw`mt-2`}
                />
              </LinearGradient>
              <LinearGradient
                colors={["#1a1a1a", "#000000"]}
                style={tw`p-4 rounded-2xl w-[48%]`}
              >
                <View style={tw``}>
                  <Text style={tw`text-orange-500 text-xs font-bold mb-1`}>
                    This Week
                  </Text>
                  <Text style={tw`text-white text-xl font-black`}>
                    {formatDuration(thisWeekDuration)}
                  </Text>
                  <View style={tw`flex-row items-center mt-2`}>
                    {percentageChange !== 0 && (
                      <>
                        <Ionicons
                          name={isPositive ? "trending-up" : "trending-down"}
                          size={16}
                          color={isPositive ? "#22c55e" : "#ef4444"}
                        />
                        <Text
                          style={[
                            tw`text-xs font-bold ml-1`,
                            isPositive ? tw`text-green-500` : tw`text-red-500`,
                          ]}
                        >
                          {Math.abs(percentageChange).toFixed(1)}%
                        </Text>
                      </>
                    )}
                    {percentageChange === 0 && (
                      <Text style={tw`text-gray-400 text-xs`}>No change</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={[tw`px-5 mb-6`, { height: height * 0.5 }]}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl font-black text-white`}>
                Your Routines
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
                  colors={["#1a1a1a", "#000000"]}
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
                    colors={["#1a1a1a", "#000000"]}
                    style={tw`border-2 border-orange-500 rounded-3xl p-6 mb-4`}
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
                      <Ionicons name="time" size={16} color="#f97316" />
                      <Text style={tw`text-white text-sm ml-2`}>
                        {workout.workout_time}
                      </Text>
                      <Text style={tw`text-zinc-500 mx-2`}>•</Text>
                      <FontAwesome5 name="dumbbell" size={14} color="#f97316" />
                      <Text style={tw`text-white text-sm ml-2`}>
                        {getExerciseCount(workout.workout_id)} Exercises
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={tw`bg-orange-500 py-3 rounded-xl`}
                      onPress={() =>
                        handleStartRoutine(workout.workout_id, workout.title)
                      }
                    >
                      <Text style={tw`text-white text-center font-bold`}>
                        Start Routine
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ))
              )}
            </ScrollView>
          </View>

          <View style={tw`px-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl font-black text-white`}>
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
