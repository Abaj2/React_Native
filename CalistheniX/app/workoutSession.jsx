import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

  const SUBMIT_WORKOUT_URL = Platform.select({
    android: "http://10.0.2.2:4005/submitworkout",
    ios: "http://192.168.1.155:4005/submitworkout",
  });

const WorkoutSession = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { title, level, exercises2 } = route.params;
  console.log(title);
  console.log(level);
  console.log(exercises2);

  const workout = {
    title: title,
    level: level,
   /* exercises: [
      {
        name: "Front Lever",
        targetSets: "3-4",
        targetDuration: "10-20s",
        targetRest: "90s",
        notes: "Keep arms straight, maintain hollow body",
      },
      {
        name: "Negative Tuck Pulls",
        targetSets: "3",
        targetReps: "5-8",
        targetRest: "120s",
        notes: "Control the descent, focus on scapular retraction",
      },
    ], */
  };

  const [exerciseData, setExerciseData] = useState(
    exercises2.map((exercise) => ({
      sets: Array(parseInt(exercise.sets[0]))
        .fill(null)
        .map(() => ({
          completed: false,
          reps: "",
          duration: "",
          notes: "",
        })),
    }))
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
    console.log("Workout Summary:", JSON.stringify(workoutSummary, null, 2));
    const jwtToken = await AsyncStorage.getItem("jwtToken")
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));


    try {
      const response = await axios.post(SUBMIT_WORKOUT_URL, {
      workoutSummary: workoutSummary,
      user_id: userData.user_id
    },
  {
    headers: {
      Authorization: `Bearer ${jwtToken}`
    }
  })
  if (response.status === 200) {
    console.log("Sent workout data");
  }
} catch (err) {
  console.error("Error sending complete workout data:", err.message || err.response);
}
  }

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
          },
        },
      ],
      { cancelable: true }
    );
  };

  const cancelWorkout = () => {
    Alert.alert("Exit Workout?", "Your progress will be lost.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Home"),
        style: "cancel",
      },
    ]);
  };
  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      {/* Header */}
      <View style={tw`px-4 py-2 border-b border-gray-800`}>
        <View style={tw`flex-row justify-between items-center`}>
          <TouchableOpacity style={tw`p-2`} onPress={cancelWorkout}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white font-bold text-lg`}>{workout.title}</Text>
          <TouchableOpacity style={tw`p-2`} onPress={finishWorkout}>
            <Text style={tw`text-orange-500 font-bold`}>Finish</Text>
          </TouchableOpacity>
        </View>
        <Text style={tw`text-orange-500 text-center`}>{workout.level}</Text>
      </View>

      <ScrollView style={tw`flex-1`}>
        {/* Exercise Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tw`border-b border-gray-800`}
        >
          {exercises2.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={tw`p-4 ${
                currentExercise === index ? "border-b-2 border-orange-500" : ""
              }`}
              onPress={() => setCurrentExercise(index)}
            >
              <Text style={tw`text-white font-bold`}>{exercise.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Current Exercise */}
        <View style={tw`p-4`}>
          {/* Target Info */}
          <View
            style={tw`mb-4 p-4 bg-[#18181b] rounded-xl border border-gray-800`}
          >
            <Text style={tw`text-white font-bold text-lg mb-2`}>Target</Text>
            <View style={tw`flex-row flex-wrap`}>
              {exercises2[currentExercise].sets && (
                <View style={tw`mr-4 mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Sets</Text>
                  <Text style={tw`text-white font-bold`}>
                    {exercises2[currentExercise].sets}
                  </Text>
                </View>
              )}
              {exercises2[currentExercise].reps && (
                <View style={tw`mr-4 mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Reps</Text>
                  <Text style={tw`text-white font-bold`}>
                    {exercises2[currentExercise].reps}
                  </Text>
                </View>
              )}
              {exercises2[currentExercise].duration && (
                <View style={tw`mr-4 mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Duration</Text>
                  <Text style={tw`text-white font-bold`}>
                    {exercises2[currentExercise].duration}
                  </Text>
                </View>
              )}
              {exercises2[currentExercise].rest && (
                <View style={tw`mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Rest</Text>
                  <Text style={tw`text-white font-bold`}>
                    {exercises2[currentExercise].rest}
                  </Text>
                </View>
              )}
            </View>
            <Text style={tw`text-gray-400 text-sm mt-2`}>
              {exercises2[currentExercise].notes}
            </Text>
          </View>

          {/* Sets Input */}
          {exerciseData[currentExercise].sets.map((set, setIndex) => (
            <View
              key={setIndex}
              style={tw`mb-4 p-4 bg-[#18181b] rounded-xl border border-gray-800`}
            >
              <Text style={tw`text-white font-bold mb-2`}>
                Set {setIndex + 1}
              </Text>
              <View style={tw`flex-row flex-wrap items-center`}>
                {exercises2[currentExercise].reps && (
                  <View style={tw`mr-4 mb-2 w-20`}>
                    <Text style={tw`text-gray-400 text-sm mb-1`}>Reps</Text>
                    <TextInput
                      style={tw`bg-gray-800 text-white p-2 rounded-lg`}
                      keyboardType="number-pad"
                      value={set.reps}
                      onChangeText={(value) =>
                        updateSetData(currentExercise, setIndex, "reps", value)
                      }
                      placeholder="0"
                      placeholderTextColor="#6b7280"
                    />
                  </View>
                )}
                {exercises2[currentExercise].duration && (
                  <View style={tw`mr-4 mb-2 w-20`}>
                    <Text style={tw`text-gray-400 text-sm mb-1`}>Duration</Text>
                    <TextInput
                      style={tw`bg-gray-800 text-white p-2 rounded-lg`}
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
                <TouchableOpacity
                  style={tw`p-2 rounded-lg bg-orange-500 ml-2`}
                  onPress={() => {
                    // Start rest timer
                    Alert.alert("Rest Timer", "Start 90s rest timer?");
                  }}
                >
                  <Text style={tw`text-white font-bold`}>Rest</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={tw`bg-gray-800 text-white p-2 rounded-lg mt-2`}
                placeholder="Notes (optional)"
                placeholderTextColor="#6b7280"
                value={set.notes}
                onChangeText={(value) =>
                  updateSetData(currentExercise, setIndex, "notes", value)
                }
              />
            </View>
          ))}

          {/* Set Controls */}
          <View style={tw`flex-row justify-between mb-4`}>
            <TouchableOpacity
              style={tw`bg-gray-800 p-4 rounded-lg flex-1 mr-2`}
              onPress={() => removeSet(currentExercise)}
            >
              <Text style={tw`text-white text-center font-bold`}>
                Remove Set
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-gray-800 p-4 rounded-lg flex-1 ml-2`}
              onPress={() => addSet(currentExercise)}
            >
              <Text style={tw`text-white text-center font-bold`}>Add Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutSession;
