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
  Animated,
} from "react-native";
import tw from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");
const GET_WORKOUTS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getworkouts",

  ios: "http://192.168.1.155:4005/getworkouts",
});

const HistoryCard = ({ isDarkMode, onDataChange, filteredWorkouts, isCustom }) => {
  const [workoutsData, setWorkoutsData] = useState([]);
  const [exercisesData, setExercisesData] = useState({});
  const [setsData, setSetsData] = useState({});

  const [expandedWorkouts, setExpandedWorkouts] = useState([]);
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const jwtToken = await AsyncStorage.getItem("jwtToken");
        const response = await axios.get(GET_WORKOUTS_URL, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (response.status === 200) {
          setWorkoutsData(response.data.workouts);
          setExercisesData(response.data.exercises);
          setSetsData(response.data.sets);

          const newAnimatedValues = {};
          response.data.workouts.forEach((workout) => {
            newAnimatedValues[workout.workout_id] = new Animated.Value(0);
          });
          setAnimatedValues(newAnimatedValues);

          if (onDataChange) {
            onDataChange(response.data.workouts);
          }
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };
    fetchWorkouts();
  }, []);

  const toggleExpandWorkout = (workoutId) => {
    const isExpanding = !expandedWorkouts.includes(workoutId);

    Animated.spring(animatedValues[workoutId], {
      toValue: isExpanding ? 1 : 0,
      useNativeDriver: true,
    }).start();

    setExpandedWorkouts((prevState) =>
      prevState.includes(workoutId)
        ? prevState.filter((id) => id !== workoutId)
        : [...prevState, workoutId]
    );
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "green";
      case "intermediate":
        return "yellow";
      case "advanced":
        return "red";
      case "custom":
        return "green"
      default:
        return "gray";
    }
  };
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getWorkoutStats = (workoutId) => {
    const exercises = exercisesData.filter((ex) => ex.workout_id === workoutId);
    const sets = setsData.filter((set) => set.workout_id === workoutId);
    const totalExercises = exercises.length;
    const totalSets = sets.length;
    const totalReps = sets.reduce((acc, set) => acc + (set.reps || 0), 0);

    return { totalExercises, totalSets, totalReps };
  };

  const displayedWorkouts = (filteredWorkouts || workoutsData).filter(workout => isCustom ? workout.custom : !workout.custom);
  console.log("Displaying workouts:", displayedWorkouts);

  return (
    <SafeAreaView style={tw`flex-1 bg-${isDarkMode ? "" : ""}`}>
      <ScrollView style={tw`px-4 py-6`}>
        {displayedWorkouts.map((workout) => {
          const stats = getWorkoutStats(workout.workout_id);
          const rotateAnimation = animatedValues[
            workout.workout_id
          ]?.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
          });

          return (
            <View
              key={workout.workout_id}
              style={[
                tw`rounded-3xl p-5 mb-5 shadow-xl border-l-4 border-l-orange-500`,
                {
                  backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                  width: width * 0.9,
                  alignSelf: "center",
                },
              ]}
            >
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <View style={tw`flex-row items-center`}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color="#f97316"
                    style={tw`mr-2`}
                  />
                  <Text
                    style={tw`text-${
                      isDarkMode ? "white" : "gray-800"
                    } font-bold text-lg`}
                  >
                    {workout.title}
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <Text style={tw`text-gray-400 text-sm mr-2`}>
                    {formatDate(workout.date)}
                  </Text>
                  <Icon name="clock-outline" size={16} color="#9ca3af" />
                </View>
              </View>

  
              <View style={tw`flex-row items-center mb-4`}>
                <Icon
                  name="account-star-outline"
                  size={16}
                  color={getLevelColor(workout.level)}
                  style={tw`mr-2`}
                />
                <Text
                  style={tw`text-${getLevelColor(
                    workout.level
                  )}-500 text-sm font-medium`}
                >
                  {workout.level}
                </Text>
              </View>

     
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <View style={tw`flex-row items-center`}>
                  <Icon
                    name="dumbbell"
                    size={16}
                    color="#f97316"
                    style={tw`mr-1`}
                  />
                  <Text style={tw`text-gray-400 text-sm`}>
                    {stats.totalExercises} exercises
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <Icon
                    name="target"
                    size={16}
                    color="#f97316"
                    style={tw`mr-1`}
                  />
                  <Text style={tw`text-gray-400 text-sm`}>
                    {stats.totalSets} sets
                  </Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <Icon
                    name="fire"
                    size={16}
                    color="#f97316"
                    style={tw`mr-1`}
                  />
                  <Text style={tw`text-gray-400 text-sm`}>
                    {stats.totalReps} reps
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => toggleExpandWorkout(workout.workout_id)}
                style={tw`bg-orange-500 rounded-xl py-3 px-4`}
              >
                <View style={tw`flex-row justify-center items-center`}>
                  <Text style={tw`text-white font-medium mr-2`}>
                    {expandedWorkouts.includes(workout.workout_id)
                      ? "Hide Details"
                      : "Show Details"}
                  </Text>
                  <Animated.View
                    style={{ transform: [{ rotate: rotateAnimation }] }}
                  >
                    <Icon name="chevron-down" size={20} color="white" />
                  </Animated.View>
                </View>
              </TouchableOpacity>

              {expandedWorkouts.includes(workout.workout_id) && (
                <>
                  {exercisesData
                    .filter(
                      (exercise) => exercise.workout_id === workout.workout_id
                    )
                    .map((exercise) => (
                      <View
                        key={exercise.exercise_id}
                        style={[
                          tw`rounded-xl p-4 mt-4`,
                          {
                            backgroundColor: isDarkMode ? "#303030" : "#f8f8f8",
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowRadius: 5,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 3,
                          },
                        ]}
                      >
                   
                        <View style={tw`flex-row items-center mb-3`}>
                          <Icon
                            name="run-fast"
                            size={24}
                            color="#f97316"
                            style={tw`mr-3`}
                          />
                          <Text
                            style={tw`text-${
                              isDarkMode ? "white" : "gray-800"
                            } font-bold text-lg`}
                          >
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
                              style={[
                                tw`flex-row items-center justify-between rounded-lg p-4 mb-2`,
                                {
                                  backgroundColor: isDarkMode
                                    ? "#2a2a2a"
                                    : "#ffffff",
                                  shadowColor: "#000",
                                  shadowOpacity: 0.05,
                                  shadowRadius: 4,
                                  shadowOffset: { width: 0, height: 1 },
                                  elevation: 2,
                                },
                              ]}
                            >
                              <View>
                                <Text
                                  style={tw`text-${
                                    isDarkMode ? "gray-300" : "gray-700"
                                  } font-medium text-sm`}
                                >
                                  Set {index + 1}
                                </Text>
                                <Text
                                  style={tw`text-${
                                    isDarkMode ? "gray-400" : "gray-500"
                                  } italic text-xs mt-1`}
                                >
                                  {set.notes || "No notes"}
                                </Text>
                              </View>

                      
                              <View
                                style={[
                                  tw`px-3 py-1 rounded-full`,
                                  {
                                    backgroundColor: set.duration
                                      ? "#34d399"
                                      : "#f97316",
                                  },
                                ]}
                              >
                                <Text style={tw`text-white font-bold text-xs`}>
                                  {set.duration
                                    ? `${set.duration}s`
                                    : set.reps
                                    ? `${set.reps} reps`
                                    : "N/A"}
                                </Text>
                              </View>

                    
                              <Icon
                                name={
                                  set.duration ? "timer-outline" : "dumbbell"
                                }
                                size={20}
                                color={set.duration ? "#34d399" : "#f97316"}
                                style={tw`ml-3`}
                              />
                            </View>
                          ))}
                      </View>
                    ))}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryCard;
