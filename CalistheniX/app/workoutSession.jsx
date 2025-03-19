import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const SUBMIT_WORKOUT_URL = Platform.select({
  android: "http://10.0.2.2:4005/submitworkout",
  ios: "http://192.168.1.155:4005/submitworkout",
});

const WorkoutSession = () => {
  const navigation = useNavigation();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const [isTargetModalVisible, setTargetModalVisible] = useState(false);

  useEffect(() => {
    startTimer();

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    console.log(time);
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };
  const formattedTime = formatTime(time);

  const route = useRoute();

  const { title, level, exercises2 } = route.params;

  const workout = {
    title: title,
    level: level,
  };

  const [exerciseData, setExerciseData] = useState(
    exercises2.map((exercise) => {
      const setsCount =
        typeof exercise.sets === "string"
          ? parseInt(exercise.sets.replace(/\D/g, ""), 10)
          : exercise.sets;

      const validSetsCount =
        Number.isInteger(setsCount) && setsCount > 0 ? setsCount : 1;

      return {
        sets: Array(validSetsCount)
          .fill(null)
          .map(() => ({
            completed: false,
            reps: "",
            duration: "",
            notes: "",
          })),
      };
    })
  );
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timer, setTimer] = useState(null);

  const updateSetData = (exerciseIndex, setIndex, field, value) => {
    setExerciseData((prevData) => {
      const newData = [...prevData];
      newData[exerciseIndex].sets[setIndex] = {
        ...newData[exerciseIndex].sets[setIndex],
        [field]: value,
        completed: true,
      };
      return newData;
    });
  };

  const addSet = (exerciseIndex) => {
    setExerciseData((prevData) => {
      const newData = [...prevData];
      newData[exerciseIndex].sets.push({
        completed: false,
        reps: "",
        duration: "",
        notes: "",
      });
      return newData;
    });
  };

  const removeSet = (exerciseIndex) => {
    if (exerciseData[exerciseIndex].sets.length > 1) {
      setExerciseData((prevData) => {
        const newData = [...prevData];
        newData[exerciseIndex].sets.pop();
        return newData;
      });
    }
  };

  const submitWorkout = async () => {
    console.log(formattedTime);
    const isoDate = new Date().toISOString();

    const date = new Date(isoDate);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = String(date.getFullYear()).slice(-2);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedDate = `${day}/${month
      .toString()
      .padStart(2, "0")}/${year} ${hours}:${minutes} ${ampm}`;

    const workoutSummary = {
      duration: formattedTime,
      title: workout.title.trim(),
      level: workout.level.trim(),
      date: formattedDate.trim(),
      exercises: exercises2.map((exercise, exerciseIndex) => ({
        name: exercise.name.trim(),
        sets: exerciseData[exerciseIndex].sets.map((set) => ({
          reps: set.reps || null,
          duration: set.duration || null,
          notes: set.notes || "",
          completed: set.completed,
        })),
      })),
    };
    const jwtToken = await AsyncStorage.getItem("jwtToken");
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));

    try {
      const response = await axios.post(
        SUBMIT_WORKOUT_URL,
        {
          workoutSummary: workoutSummary,
          user_id: userData.user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Sent workout data");
      }
    } catch (err) {
      console.error(
        "Error sending complete workout data:",
        err.message || err.response
      );
    }
  };

  const finishWorkout = () => {
    Alert.alert(
      "Finish Workout?",
      "Save your progress?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled workout"),
          style: "cancel",
        },
        {
          text: "Finish",
          onPress: () => {
            submitWorkout();
            navigation.navigate("Home");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const cancelWorkout = () => {
    stopTimer();
    Alert.alert("Exit Workout?", "Your progress will be lost.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Home"),
        style: "cancel",
      },
    ]);
  };
  useEffect(() => {
    console.log("Exercises 2", exercises2);
    console.log("Exercise Data:", JSON.stringify(exerciseData));
  }, [exercises2, JSON.stringify(exerciseData)]);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
        <SafeAreaView style={tw`flex-1`}>
          <View style={tw`w-full bg-black/30 border-b border-orange-500/30`}>
            <View style={tw`flex-row justify-between items-center px-4 py-3`}>
              <TouchableOpacity
                style={tw`p-2`}
                onPress={cancelWorkout}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={tw`items-center`}>
                <Text style={tw`text-white font-semibold text-lg`}>
                  {workout.title}
                </Text>
                {workout.level && (
                  <Text style={tw`text-orange-400 text-sm font-medium`}>
                    {workout.level}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={tw`px-4 py-2 bg-orange-500 rounded-lg`}
                onPress={finishWorkout}
              >
                <Text style={tw`text-white font-semibold`}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`flex-grow`}
          >
            <View style={tw`border-b border-gray-800/50 bg-black/10`}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`px-4 py-2`}
              >
                {exercises2.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={tw`px-4 py-2 mr-2 rounded-lg ${
                      currentExercise === index
                        ? "bg-orange-500/10 border border-orange-500/30"
                        : "bg-black/20 border border-gray-800/50"
                    }`}
                    onPress={() => setCurrentExercise(index)}
                  >
                    <Text
                      style={tw`${
                        currentExercise === index
                          ? "text-orange-400 font-semibold"
                          : "text-gray-400 font-medium"
                      }`}
                    >
                      {exercise.name || exercise.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
  
            <View style={tw`p-4`}>
              {workout.level !== "Custom" && (
                <View
                  style={tw`mb-4 rounded-lg overflow-hidden border border-gray-800/50 bg-black/20`}
                >
                  <View style={tw`px-4 py-3 border-b border-gray-800/50`}>
                    <Text style={tw`text-white font-semibold`}>
                      Workout Target
                    </Text>
                  </View>
  
                  <View style={tw`p-4`}>
                    <View style={tw`flex-row flex-wrap`}>
                      {exercises2[currentExercise].sets && (
                        <View style={tw`w-1/2 pr-2 mb-4`}>
                          <View
                            style={tw`p-3 rounded-lg border border-gray-800/50 bg-black/30`}
                          >
                            <Text
                              style={tw`text-orange-400 font-semibold text-lg mb-1`}
                            >
                              {exercises2[currentExercise].sets}
                            </Text>
                            <Text style={tw`text-gray-400 text-sm`}>Sets</Text>
                          </View>
                        </View>
                      )}
                      {exercises2[currentExercise].reps && (
                        <View style={tw`w-1/2 pl-2 mb-4`}>
                          <View
                            style={tw`p-3 rounded-lg border border-gray-800/50 bg-black/30`}
                          >
                            <Text
                              style={tw`text-orange-400 font-semibold text-lg mb-1`}
                            >
                              {exercises2[currentExercise].reps}
                            </Text>
                            <Text style={tw`text-gray-400 text-sm`}>Reps</Text>
                          </View>
                        </View>
                      )}
                      {exercises2[currentExercise].duration && (
                        <View style={tw`w-1/2 pr-2`}>
                          <View
                            style={tw`p-3 rounded-lg border border-gray-800/50 bg-black/30`}
                          >
                            <Text
                              style={tw`text-orange-400 font-semibold text-lg mb-1`}
                            >
                              {exercises2[currentExercise].duration}
                            </Text>
                            <Text style={tw`text-gray-400 text-sm`}>
                              Duration
                            </Text>
                          </View>
                        </View>
                      )}
                      {exercises2[currentExercise].rest && (
                        <View style={tw`w-1/2 pl-2`}>
                          <View
                            style={tw`p-3 rounded-lg border border-gray-800/50 bg-black/30`}
                          >
                            <Text
                              style={tw`text-orange-400 font-semibold text-lg mb-1`}
                            >
                              {exercises2[currentExercise].rest}
                            </Text>
                            <Text style={tw`text-gray-400 text-sm`}>Rest</Text>
                          </View>
                        </View>
                      )}
                    </View>
  
                    {exercises2[currentExercise].notes && (
                      <View
                        style={tw`mt-3 p-3 rounded-lg border border-gray-800/50 bg-black/30`}
                      >
                        <Text style={tw`text-gray-400 text-sm leading-5`}>
                          {exercises2[currentExercise].notes}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
  
              {exerciseData[currentExercise].sets.map((set, setIndex) => (
                <View
                  key={setIndex}
                  style={tw`mb-4 bg-black/20 rounded-lg border border-gray-800/50`}
                >
                  <View style={tw`px-4 py-3 border-b border-gray-800/50`}>
                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-white font-semibold`}>
                        Set {setIndex + 1}
                      </Text>
                      <TouchableOpacity
                        style={tw`flex-row items-center bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/30`}
                        onPress={() => {
                          Alert.alert("Rest Timer", "Start 90s rest timer?");
                        }}
                      >
                        <Ionicons
                          name="timer-outline"
                          size={16}
                          color="#f97316"
                          style={tw`mr-1`}
                        />
                        <Text style={tw`text-orange-400 font-medium`}>
                          Rest
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
  
                  <View style={tw`p-4`}>
                    <View style={tw`flex-row flex-wrap -mx-2`}>
                      {exercises2[currentExercise].reps && (
                        <View style={tw`px-2 w-1/2 mb-4`}>
                          <Text style={tw`text-gray-400 text-sm mb-1 ml-1`}>
                            Reps
                          </Text>
                          <TextInput
                            style={tw`bg-black/30 text-white px-4 py-2 rounded-lg text-lg font-medium border border-gray-800/50`}
                            keyboardType="number-pad"
                            value={set.reps}
                            onChangeText={(value) =>
                              updateSetData(
                                currentExercise,
                                setIndex,
                                "reps",
                                value
                              )
                            }
                            placeholder="0"
                            placeholderTextColor="#6b7280"
                          />
                        </View>
                      )}
                      {exercises2[currentExercise].duration && (
                        <View style={tw`px-2 w-1/2 mb-4`}>
                          <Text style={tw`text-gray-400 text-sm mb-1 ml-1`}>
                            Duration
                          </Text>
                          <TextInput
                            style={tw`bg-black/30 text-white px-4 py-2 rounded-lg text-lg font-medium border border-gray-800/50`}
                            keyboardType="number-pad"
                            value={set.duration}
                            onChangeText={(value) =>
                              updateSetData(
                                currentExercise,
                                setIndex,
                                "duration",
                                value
                              )
                            }
                            placeholder="0s"
                            placeholderTextColor="#6b7280"
                          />
                        </View>
                      )}
                    </View>
  
                    <View>
                      <Text style={tw`text-gray-400 text-sm mb-1`}>Notes</Text>
                      <TextInput
                        style={tw`bg-black/30 text-white px-4 py-2 rounded-lg border border-gray-800/50`}
                        placeholder="Add notes for this set..."
                        placeholderTextColor="#6b7280"
                        value={set.notes}
                        onChangeText={(value) =>
                          updateSetData(currentExercise, setIndex, "notes", value)
                        }
                        multiline
                      />
                    </View>
                  </View>
                </View>
              ))}
  
              <View style={tw`flex-row justify-between mt-4`}>
                <TouchableOpacity
                  style={tw`flex-1 mr-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex-row items-center justify-center`}
                  onPress={() => removeSet(currentExercise)}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={20}
                    color="#ef4444"
                    style={tw`mr-2`}
                  />
                  <Text style={tw`text-red-400 font-semibold`}>Remove Set</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 ml-2 px-4 py-2 bg-orange-500 rounded-lg flex-row items-center justify-center`}
                  onPress={() => addSet(currentExercise)}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="white"
                    style={tw`mr-2`}
                  />
                  <Text style={tw`text-white font-semibold`}>Add Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default WorkoutSession;
