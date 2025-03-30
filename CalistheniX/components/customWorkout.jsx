import React, { useState, useEffect } from "react";
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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import tw from "twrnc";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/postcustomworkout",
  ios: "http://192.168.1.155:4005/postcustomworkout",
});

const CustomWorkout = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [newWorkoutSummary, setNewWorkoutSummary] = useState("");
  const [isTargetModalVisible, setTargetModalVisible] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [restTimer, setRestTimer] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  const route = useRoute();

  const { workouts, exercisesArray, sets, workoutId, workoutName } =
    route.params || {};
  /*console.log(workouts);
  console.log(exercisesArray);
  console.log(sets);
  console.log(workoutId);
  console.log(workoutName);*/

  const [workoutSummary, setWorkoutSummary] = useState(() => {
    if (exercisesArray) {
      return exercisesArray.map((exercise) => ({
        name: exercise.name,
        sets: [
          {
            reps: "",
            duration: "",
            notes: "",
            type: "reps",
          },
        ],
      }));
    }
    return [];
  });

  useEffect(() => {
    let intervalId;
    if (timerRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerRunning]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const addExercise = () => {
    if (newWorkoutSummary.trim()) {
      setWorkoutSummary([
        ...workoutSummary,
        {
          name: newWorkoutSummary,
          sets: [
            {
              reps: "",
              duration: "",
              notes: "",
              type: "reps",
            },
          ],
        },
      ]);
      setNewWorkoutSummary("");
    }
  };

  const addSet = (workoutIndex) => {
    const updatedWorkoutSummary = [...workoutSummary];
    updatedWorkoutSummary[workoutIndex].sets.push({
      reps: "",
      duration: "",
      notes: "",
      type: "reps",
    });
    setWorkoutSummary(updatedWorkoutSummary);
  };

  const removeSet = (workoutIndex) => {
    if (workoutSummary[workoutIndex].sets.length > 1) {
      const updatedWorkoutSummary = [...workoutSummary];
      updatedWorkoutSummary[workoutIndex].sets.pop();
      setWorkoutSummary(updatedWorkoutSummary);
    }
  };

  const updateSet = (workoutIndex, setIndex, field, value) => {
    const updatedWorkoutSummary = [...workoutSummary];
    const currentSet = updatedWorkoutSummary[workoutIndex].sets[setIndex];

    if (field === "type") {
      if (value === "reps") {
        currentSet.duration = "";
      } else {
        currentSet.reps = "";
      }
      currentSet.type = value;
    } else {
      currentSet[field] = value;
    }

    setWorkoutSummary(updatedWorkoutSummary);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };
  const cancelWorkout = () => {
    stopTimer();
    Alert.alert("Exit Workout?", "Your progress will be lost.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Ok",
        onPress: () => navigation.navigate("Home"),
        style: "destructive", 
      },
    ]);
  };

  const finishWorkout = async () => {
    Alert.alert(
      "Finish Workout?",
      "Are you sure you want to finish this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finish",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("jwtToken");
              const storedUserData = await AsyncStorage.getItem("userData");
              const parsedUserData = JSON.parse(storedUserData);
              const user_id = parsedUserData.user_id;
  
              if (exercisesArray) {
                console.log(exercisesArray);
                setTitle(workoutName);
              }
  
              if (!workoutName && !title) {
                Alert.alert("Enter a title");
                return;
              }
  
              setTimerRunning(false);
  
              const response = await axios.post(
                SERVER_URL,
                {
                  workoutSummary,
                  title: workoutName || title,
                  user_id,
                  duration: formatTimer(timer),
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
  
              if (response.status === 200) {
                console.log("Sent data to backend");
              }
              navigation.navigate("Home");
  
              setTimeout(() => {
                Alert.alert("Successfully completed workout");
              }, 750);
            } catch (err) {
              console.error("Error:", err);
            }
          },
          style: "destructive",
        },
      ]
    );
  };
    const startRestTimer = () => {
      Alert.alert(
        "Rest Timer",
        "Select rest duration:",
        [
          { text: "15s", onPress: () => setRestTimerWithDuration(15) },
          { text: "30s", onPress: () => setRestTimerWithDuration(30) },
          { text: "45s", onPress: () => setRestTimerWithDuration(45) },
          { text: "60s", onPress: () => setRestTimerWithDuration(60) },
          { text: "75s", onPress: () => setRestTimerWithDuration(75) },
          { text: "90s", onPress: () => setRestTimerWithDuration(90) },
          { text: "Custom", onPress: showCustomRestInput },
        ],
        { cancelable: true }
      );
    };
  
    const showCustomRestInput = () => {
      Alert.prompt(
        "Custom Rest Time",
        "Enter rest time in seconds:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK",
            onPress: (seconds) => {
              const duration = parseInt(seconds);
              if (!isNaN(duration) && duration > 0) {
                setRestTimerWithDuration(duration);
              } else {
                Alert.alert("Invalid Input", "Please enter a valid number.");
              }
            },
          },
        ],
        "plain-text",
        "",
        "numeric"
      );
    };
  
    const setRestTimerWithDuration = (duration) => {
      setRestDuration(duration);
      setRestTimer(duration);
      setTargetModalVisible(true);

      if (timerInterval) {
        clearInterval(timerInterval);
      }
  

      const interval = setInterval(() => {
        setRestTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setTargetModalVisible(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
  
      setTimerInterval(interval);
    };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
        <SafeAreaView style={tw`flex-1`}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`flex-grow`}
          >
        
            <View
              style={tw`px-4 py-3 border-b border-orange-500/30 bg-black/20`}
            >
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity style={tw`p-2`} onPress={cancelWorkout}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                {!workoutName ? (
                  <TextInput
                    style={tw`flex-1 mx-4 text-white text-lg font-semibold text-center`}
                    placeholder="Workout Title"
                    placeholderTextColor="#6b7280"
                    value={title}
                    onChangeText={setTitle}
                  />
                ) : (
                  <Text
                    style={tw`flex-1 mx-4 text-white text-lg font-semibold text-center`}
                  >
                    {workoutName}
                  </Text>
                )}
                <TouchableOpacity
                  style={tw`px-4 py-2 bg-orange-500 rounded-lg`}
                  onPress={finishWorkout}
                >
                  <Text style={tw`text-white font-semibold`}>Finish</Text>
                </TouchableOpacity>
              </View>
            </View>

   
            <View style={tw`px-4 py-3 border-b border-gray-800/50 bg-black/10`}>
              <View style={tw`flex-row items-center gap-2`}>
                <TextInput
                  style={tw`flex-1 bg-black/20 text-white px-4 py-2 rounded-lg border border-gray-800/50`}
                  placeholder="Enter exercise name"
                  placeholderTextColor="#6b7280"
                  value={newWorkoutSummary}
                  onChangeText={setNewWorkoutSummary}
                  onSubmitEditing={addExercise}
                />
                <TouchableOpacity
                  onPress={addExercise}
                  style={tw`p-3 bg-orange-500 rounded-lg`}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {workoutSummary.length > 0 && (
              <View style={tw`border-b border-gray-800/50 bg-black/10`}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={tw`px-4 py-2`}
                >
                  {workoutSummary.map((exercise, index) => (
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
                        {exercise.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {workoutSummary.length > 0 && (
              <View style={tw`p-4`}>
                {workoutSummary[currentExercise].sets.map((set, setIndex) => (
                  <View
                    key={setIndex}
                    style={tw`mb-4 bg-black/20 rounded-lg border border-gray-800/50`}
                  >
                    <View style={tw`px-4 py-3 items-center flex-row justify-between border-b border-gray-800/50`}>
                      <Text style={tw`text-white font-semibold`}>
                        Set {setIndex + 1}
                      </Text>
                      <TouchableOpacity
                        style={tw`flex-row items-center bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/30`}
                        onPress={() => {
                          startRestTimer();
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
                    <View style={tw`p-4`}>
                      <View
                        style={tw`flex-row mb-4 bg-black/30 rounded-lg border border-gray-800/50`}
                      >
                        <TouchableOpacity
                          style={tw`flex-1 py-2 ${
                            set.type === "reps"
                              ? "bg-orange-500"
                              : "bg-transparent"
                          } rounded-lg`}
                          onPress={() =>
                            updateSet(currentExercise, setIndex, "type", "reps")
                          }
                        >
                          <Text
                            style={tw`text-white font-semibold text-center`}
                          >
                            Reps
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={tw`flex-1 py-2 ${
                            set.type === "duration"
                              ? "bg-orange-500"
                              : "bg-transparent"
                          } rounded-lg`}
                          onPress={() =>
                            updateSet(
                              currentExercise,
                              setIndex,
                              "type",
                              "duration"
                            )
                          }
                        >
                          <Text
                            style={tw`text-white font-semibold text-center`}
                          >
                            Duration
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {set.type === "reps" ? (
                        <View style={tw`mb-4`}>
                          <Text style={tw`text-gray-400 text-sm mb-1`}>
                            Reps
                          </Text>
                          <TextInput
                            style={tw`bg-black/30 text-white px-4 py-2 rounded-lg border border-gray-800/50`}
                            placeholder="e.g. 12"
                            placeholderTextColor="#6b7280"
                            value={set.reps}
                            onChangeText={(value) =>
                              updateSet(
                                currentExercise,
                                setIndex,
                                "reps",
                                value
                              )
                            }
                            keyboardType="number-pad"
                          />
                        </View>
                      ) : (
                        <View style={tw`mb-4`}>
                          <Text style={tw`text-gray-400 text-sm mb-1`}>
                            Duration
                          </Text>
                          <TextInput
                            style={tw`bg-black/30 text-white px-4 py-2 rounded-lg border border-gray-800/50`}
                            placeholder="e.g. 30s"
                            placeholderTextColor="#6b7280"
                            value={set.duration}
                            onChangeText={(value) =>
                              updateSet(
                                currentExercise,
                                setIndex,
                                "duration",
                                value
                              )
                            }
                          />
                        </View>
                      )}

                      <View>
                        <Text style={tw`text-gray-400 text-sm mb-1`}>
                          Notes
                        </Text>
                        <TextInput
                          style={tw`bg-black/30 text-white px-4 py-2 rounded-lg border border-gray-800/50`}
                          placeholder="Add notes for this set..."
                          placeholderTextColor="#6b7280"
                          value={set.notes}
                          onChangeText={(value) =>
                            updateSet(currentExercise, setIndex, "notes", value)
                          }
                          multiline
                        />
                      </View>
                    </View>
                  </View>
                ))}
                 {isTargetModalVisible && (
              <View
                style={tw`w-full p-4 border border-gray-800/50 rounded-lg items-center`}
              >
                <Text style={tw`text-white text-lg font-bold mb-1`}>
                  Rest Timer
                </Text>

                <Text style={tw`text-orange-400 text-4xl font-bold my-3`}>
                  {Math.floor(restTimer / 60)}:
                  {restTimer % 60 < 10 ? `0${restTimer % 60}` : restTimer % 60}
                </Text>

                <View
                  style={tw`w-full bg-gray-800/50 h-2 rounded-full mt-2 mb-4`}
                >
                  <View
                    style={[
                      tw`bg-orange-500 h-2 rounded-full`,
                      { width: `${(restTimer / restDuration) * 100}%` },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  style={tw`bg-orange-500 py-2 px-6 rounded-lg w-full items-center`}
                  onPress={() => {
                    clearInterval(timerInterval);
                    setTargetModalVisible(false);
                  }}
                >
                  <Text style={tw`text-white font-bold text-base`}>Skip</Text>
                </TouchableOpacity>
              </View>
            )}

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
                    <Text style={tw`text-red-400 font-semibold`}>
                      Remove Set
                    </Text>
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
            )}
           
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default CustomWorkout;
