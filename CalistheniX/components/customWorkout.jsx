import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const CustomWorkout = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [newExerciseName, setNewExerciseName] = useState("");

  const addExercise = () => {
    if (newExerciseName.trim()) {
      setExercises([
        ...exercises,
        {
          name: newExerciseName,
          sets: [
            {
              reps: "",
              duration: "",
              notes: "",
            },
          ],
        },
      ]);
      setNewExerciseName("");
    }
  };

  const addSet = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      reps: "",
      duration: "",
      notes: "",
    });
    setExercises(updatedExercises);
  };

  const removeSet = (exerciseIndex) => {
    if (exercises[exerciseIndex].sets.length > 1) {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets.pop();
      setExercises(updatedExercises);
    }
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const cancelWorkout = () => {
    navigation.goBack();
  };

  const finishWorkout = () => {
    console.log(JSON.stringify(exercises));
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

      {/* Add Exercise Section */}
      <View style={tw`p-4 border-b border-gray-800`}>
        <View style={tw`flex-row gap-2`}>
          <TextInput
            style={tw`flex-1 bg-zinc-900 text-white p-2 rounded-lg`}
            placeholder="Enter exercise name"
            placeholderTextColor="#6b7280"
            value={newExerciseName}
            onChangeText={setNewExerciseName}
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

      {/* Exercise tabs - Fixed height */}
      {exercises.length > 0 && (
        <View style={tw`h-14 border-b border-gray-800`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {exercises.map((exercise, index) => (
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

      {exercises.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={tw`flex-1`}
          contentContainerStyle={tw`p-4 pb-8`}
        >
          <View style={tw`space-y-4 mb-4`}>
            {exercises[currentExercise].sets.map((set, setIndex) => (
              <View
                key={setIndex}
                style={tw`p-4 mb-4 bg-zinc-900 rounded-xl border border-gray-800`}
              >
                <Text style={tw`text-white font-bold mb-3`}>
                  Set {setIndex + 1}
                </Text>
                <View style={tw`flex-row gap-4`}>
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
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-gray-400 text-sm`}>Duration</Text>
                    <TextInput
                      style={tw`bg-gray-800 text-white p-2 rounded-lg mt-1`}
                      placeholder="e.g., 30s"
                      placeholderTextColor="#6b7280"
                      value={set.duration}
                      onChangeText={(value) =>
                        updateSet(currentExercise, setIndex, "duration", value)
                      }
                    />
                  </View>
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
