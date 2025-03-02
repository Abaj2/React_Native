import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");
const GET_WORKOUTS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getworkouts",
  ios: "http://192.168.1.155:4005/getworkouts",
});

const HistoryCard = ({ isDarkMode, onDataChange, user_id, widthNumber }) => {
  const [workoutsData, setWorkoutsData] = useState([]);
  const [exercisesData, setExercisesData] = useState([]);
  const [setsData, setSetsData] = useState([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDataAndWorkouts = async () => {
      try {
        setLoading(true);

        const jwtToken = await AsyncStorage.getItem("jwtToken");
        let finalUserId = user_id; 

        if (!finalUserId) {
          const storedUserData = await AsyncStorage.getItem("userData");
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            setUserData(parsedUserData);
            finalUserId = parsedUserData.user_id;
          }
        }

        if (!finalUserId) {
          console.error("No user ID available");
          return;
        }

        const response = await axios.get(`${GET_WORKOUTS_URL}?user_id=${finalUserId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (response.status === 200) {
          setWorkoutsData(response.data.workouts);
          setExercisesData(response.data.exercises);
          setSetsData(response.data.sets);
          onDataChange?.(response.data.workouts);
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndWorkouts();
  }, [user_id]); 


  const toggleExpandWorkout = (workoutId) => {
    setExpandedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "#22c55e";
      case "intermediate":
        return "#eab308";
      case "advanced":
        return "#ef4444";
      case "custom":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date
      .toLocaleString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/,/g, "");
  };

  const getWorkoutStats = (workoutId) => {
    const exercises = exercisesData.filter((ex) => ex.workout_id === workoutId);
    const sets = setsData.filter((set) => set.workout_id === workoutId);
    return {
      totalExercises: exercises.length,
      totalSets: sets.length,
      totalReps: sets.reduce((acc, set) => acc + (set.reps || 0), 0),
    };
  };

  return (
    <SafeAreaView style={tw`flex-1 w-full`}>
      <ScrollView style={tw`w-full`} showsVerticalScrollIndicator={false}>
        {workoutsData.map((workout) => {
          const stats = getWorkoutStats(workout.workout_id);
          const isExpanded = expandedWorkouts.includes(workout.workout_id);

          return (
            <View
              key={workout.workout_id}
              style={[
                tw`mb-5 p-4 mx-4 self-center shadow-xl rounded-3xl overflow-hidden border-l-4 border-r-4 border-r-orange-500 border-l-orange-500`,
                { width: width * widthNumber || 0.9 },
              ]}
            >
              <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center mb-2`}>
                    <Icon
                      name="calendar"
                      size={18}
                      color="#f97316"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-white font-bold text-lg`}>
                      {workout.title}
                    </Text>
                  </View>
                  <Text
                    style={tw`text-orange-500 text-xs font-medium uppercase tracking-wider`}
                  >
                    {formatDate(workout.date)}
                  </Text>
                </View>

                <View style={tw`items-end`}>
                  <View
                    style={[
                      tw`px-2 py-1 rounded-full`,
                      { backgroundColor: getLevelColor(workout.level) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs font-semibold uppercase tracking-wider`,
                        { color: getLevelColor(workout.level) },
                      ]}
                    >
                      {workout.level}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={tw`flex-row justify-between mb-5`}>
                <View style={tw`items-center`}>
                  <Icon name="dumbbell" size={20} color="#f97316" />
                  <Text style={tw`text-white font-bold mt-1`}>
                    {stats.totalExercises}
                  </Text>
                  <Text style={tw`text-gray-400 text-xs`}>Exercises</Text>
                </View>
                <View style={tw`items-center`}>
                  <Icon name="repeat" size={20} color="#f97316" />
                  <Text style={tw`text-white font-bold mt-1`}>
                    {stats.totalSets}
                  </Text>
                  <Text style={tw`text-gray-400 text-xs`}>Sets</Text>
                </View>
                <View style={tw`items-center`}>
                  <Icon name="chart-bar" size={20} color="#f97316" />
                  <Text style={tw`text-white font-bold mt-1`}>
                    {stats.totalReps}
                  </Text>
                  <Text style={tw`text-gray-400 text-xs`}>Reps</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => toggleExpandWorkout(workout.workout_id)}
                style={tw`bg-orange-500 rounded-xl py-3`}
              >
                <View style={tw`flex-row justify-center items-center`}>
                  <Text style={tw`text-white font-medium mr-2`}>
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </Text>
                  <Icon
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="white"
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={tw`mt-4`}>
                  {exercisesData
                    .filter((ex) => ex.workout_id === workout.workout_id)
                    .map((exercise) => (
                      <View key={exercise.exercise_id} style={tw`mb-6`}>
                        <View style={tw`flex-row items-center mb-4`}>
                          <Text style={tw`text-white font-semibold text-base`}>
                            {exercise.name}
                          </Text>
                        </View>

                        {setsData
                          .filter(
                            (set) =>
                              set.workout_id === workout.workout_id &&
                              set.exercise_id === exercise.exercise_id
                          )
                          .map((set, index) => (
                            <View
                              key={index}
                              style={tw`bg-black/30 mb-3 p-4 rounded-xl border border-gray-800`}
                            >
                              <View
                                style={tw`flex-row justify-between items-center mb-2`}
                              >
                                <Text
                                  style={tw`text-gray-400 text-xs font-medium`}
                                >
                                  Set {index + 1}
                                </Text>
                                <View style={tw`flex-row items-center`}>
                                  <View
                                    style={[
                                      tw`px-3 py-1 rounded-full flex-row items-center`,
                                      {
                                        backgroundColor: set.duration
                                          ? "#05966920"
                                          : `${
                                              set.reps === null
                                                ? "#FF000053"
                                                : "#f9731620"
                                            }`,
                                      },
                                    ]}
                                  >
                                    <Icon
                                      name={
                                        set.duration
                                          ? "timer-outline"
                                          : "dumbbell"
                                      }
                                      size={14}
                                      color={
                                        set.duration ? "#34d399" : "#f97316"
                                      }
                                      style={tw`mr-2`}
                                    />
                                    <Text
                                      style={[
                                        tw`text-xs font-semibold`,
                                        {
                                          color: set.duration
                                            ? "#34d399"
                                            : "#f97316",
                                        },
                                      ]}
                                    >
                                      {set.duration
                                        ? `${set.duration}s`
                                        : `${
                                            set.reps === null ? "0" : set.reps
                                          } reps`}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              {set.notes && (
                                <Text style={tw`text-gray-500 text-sm italic`}>
                                  "{set.notes}"
                                </Text>
                              )}
                            </View>
                          ))}
                      </View>
                    ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryCard;