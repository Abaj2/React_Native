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
  Platform,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/postcustomworkout",
  ios: "http://192.168.1.155:4005/postcustomworkout",
});

const CustomWorkout = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [workoutSummary, setWorkoutSummary] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [newWorkoutSummary, setNewWorkoutSummary] = useState("");

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

  const cancelWorkout = () => {
    navigation.goBack();
  };

  const finishWorkout = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const storedUserData = await AsyncStorage.getItem("userData");
      const parsedUserData = JSON.parse(storedUserData);
      const user_id = parsedUserData.user_id;
      if (!title) {
        Alert.alert("Enter a title");
        return;
      }

      const response = await axios.post(
        SERVER_URL,
        {
          workoutSummary,
          title,
          user_id,
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
     Alert.alert("Successfully completed workout")
    }, 750);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      <View style={tw`px-4 py-2 border-b border-gray-800`}>
        <View style={tw`flex-row justify-between items-center`}>
          <TouchableOpacity style={tw`p-2`} onPress={cancelWorkout}>
            <Text style={tw`text-white text-xl`}>×</Text>
          </TouchableOpacity>
          <TextInput
            style={tw`text-white font-bold text-lg text-center flex-1 mx-4`}
            placeholder="Workout Title"
            placeholderTextColor="#6b7280"
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity onPress={finishWorkout} style={tw`p-2`}>
            <Text style={tw`text-orange-500 font-bold`}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`p-4 border-b border-gray-800`}>
        <View style={tw`flex-row gap-2`}>
          <TextInput
            style={tw`flex-1 bg-zinc-900 text-white p-2 rounded-lg`}
            placeholder="Enter exercise name"
            placeholderTextColor="#6b7280"
            value={newWorkoutSummary}
            onChangeText={setNewWorkoutSummary}
            onSubmitEditing={addExercise}
          />
          <TouchableOpacity
            onPress={addExercise}
            style={tw`bg-orange-500 px-4 rounded-lg justify-center`}
          >
            <Text style={tw`text-white text-xl`}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {workoutSummary.length > 0 && (
        <View style={tw`h-14 border-b border-gray-800`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workoutSummary.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={tw`px-4 h-14 justify-center ${
                  currentExercise === index
                    ? "border-b-2 border-orange-500"
                    : ""
                }`}
                onPress={() => setCurrentExercise(index)}
              >
                <Text style={tw`text-white font-bold`}>{exercise.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {workoutSummary.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={tw`flex-1`}
          contentContainerStyle={tw`p-4 pb-8`}
        >
          <View style={tw`space-y-4 mb-4`}>
            {workoutSummary[currentExercise].sets.map((set, setIndex) => (
              <View
                key={setIndex}
                style={tw`p-4 mb-4 bg-zinc-900 rounded-xl border border-gray-800`}
              >
                <Text style={tw`text-white font-bold mb-3`}>
                  Set {setIndex + 1}
                </Text>

 
                <View style={tw`flex-row mb-3`}>
                  <TouchableOpacity
                    style={tw`flex-1 p-2 ${
                      set.type === "reps" ? "bg-orange-500" : "bg-gray-800"
                    } rounded-l-lg`}
                    onPress={() =>
                      updateSet(currentExercise, setIndex, "type", "reps")
                    }
                  >
                    <Text style={tw`text-white text-center`}>Reps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`flex-1 p-2 ${
                      set.type === "duration" ? "bg-orange-500" : "bg-gray-800"
                    } rounded-r-lg`}
                    onPress={() =>
                      updateSet(currentExercise, setIndex, "type", "duration")
                    }
                  >
                    <Text style={tw`text-white text-center`}>Duration</Text>
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-row gap-4`}>
                  {set.type === "reps" ? (
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-400 text-sm`}>Reps</Text>
                      <TextInput
                        style={tw`bg-gray-800 text-white p-2 rounded-lg mt-1`}
                        placeholder="e.g., 12"
                        placeholderTextColor="#6b7280"
                        value={set.reps}
                        onChangeText={(value) =>
                          updateSet(currentExercise, setIndex, "reps", value)
                        }
                        keyboardType="number-pad"
                      />
                    </View>
                  ) : (
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-400 text-sm`}>Duration</Text>
                      <TextInput
                        style={tw`bg-gray-800 text-white p-2 rounded-lg mt-1`}
                        placeholder="e.g., 30s"
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
                </View>
                <View style={tw`mt-3`}>
                  <Text style={tw`text-gray-400 text-sm`}>Notes</Text>
                  <TextInput
                    style={tw`bg-gray-800 text-white p-2 rounded-lg mt-1`}
                    placeholder="Optional notes"
                    placeholderTextColor="#6b7280"
                    value={set.notes}
                    onChangeText={(value) =>
                      updateSet(currentExercise, setIndex, "notes", value)
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={tw`flex-row gap-4 mb-8`}>
            <TouchableOpacity
              onPress={() => removeSet(currentExercise)}
              style={tw`flex-1 bg-gray-800 p-4 rounded-xl`}
            >
              <Text style={tw`text-white font-bold text-center`}>
                Remove Set
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => addSet(currentExercise)}
              style={tw`flex-1 bg-gray-800 p-4 rounded-xl`}
            >
              <Text style={tw`text-white font-bold text-center`}>Add Set</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CustomWorkout;
