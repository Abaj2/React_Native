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
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");


const WorkoutSession = () => {
  const route = useRoute();
  
  const { title, level } = route.params;
  console.log(title)
  console.log(level)
  // In a real app, this would come from route.params
  const workout = {
    title: title,
    level: level,
    exercises: [
      {
        name: "Tuck Hold",
        targetSets: "3-4",
        targetDuration: "10-20s",
        targetRest: "90s",
        notes: "Keep arms straight, maintain hollow body"
      },
      {
        name: "Negative Tuck Pulls",
        targetSets: "3",
        targetReps: "5-8",
        targetRest: "120s",
        notes: "Control the descent, focus on scapular retraction"
      }
    ]
  };

  const [exerciseData, setExerciseData] = useState(
    workout.exercises.map(exercise => ({
      sets: Array(parseInt(exercise.targetSets[0])).fill({
        completed: false,
        reps: "",
        duration: "",
        notes: ""
      })
    }))
  );

  const [currentExercise, setCurrentExercise] = useState(0);
  const [timer, setTimer] = useState(null);

  const updateSetData = (exerciseIndex, setIndex, field, value) => {
    setExerciseData(prevData => {
      const newData = [...prevData];
      newData[exerciseIndex].sets[setIndex] = {
        ...newData[exerciseIndex].sets[setIndex],
        [field]: value,
        completed: true
      };
      return newData;
    });
  };

  const addSet = (exerciseIndex) => {
    setExerciseData(prevData => {
      const newData = [...prevData];
      newData[exerciseIndex].sets.push({
        completed: false,
        reps: "",
        duration: "",
        notes: ""
      });
      return newData;
    });
  };

  const removeSet = (exerciseIndex) => {
    if (exerciseData[exerciseIndex].sets.length > 1) {
      setExerciseData(prevData => {
        const newData = [...prevData];
        newData[exerciseIndex].sets.pop();
        return newData;
      });
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-black`}>
      {/* Header */}
      <View style={tw`px-4 py-2 border-b border-gray-800`}>
        <View style={tw`flex-row justify-between items-center`}>
          <TouchableOpacity 
            style={tw`p-2`}
            onPress={() => Alert.alert("Exit Workout?", "Your progress will be lost.")}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white font-bold text-lg`}>{workout.title}</Text>
          <TouchableOpacity 
            style={tw`p-2`}
            onPress={() => Alert.alert("Finish Workout?", "Save your progress?")}
          >
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
          {workout.exercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={tw`p-4 ${currentExercise === index ? 'border-b-2 border-orange-500' : ''}`}
              onPress={() => setCurrentExercise(index)}
            >
              <Text style={tw`text-white font-bold`}>{exercise.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Current Exercise */}
        <View style={tw`p-4`}>
          {/* Target Info */}
          <View style={tw`mb-4 p-4 bg-gray-900 rounded-xl border border-gray-800`}>
            <Text style={tw`text-white font-bold text-lg mb-2`}>Target</Text>
            <View style={tw`flex-row flex-wrap`}>
              {workout.exercises[currentExercise].targetSets && (
                <View style={tw`mr-4 mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Sets</Text>
                  <Text style={tw`text-white font-bold`}>
                    {workout.exercises[currentExercise].targetSets}
                  </Text>
                </View>
              )}
              {workout.exercises[currentExercise].targetReps && (
                <View style={tw`mr-4 mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Reps</Text>
                  <Text style={tw`text-white font-bold`}>
                    {workout.exercises[currentExercise].targetReps}
                  </Text>
                </View>
              )}
              {workout.exercises[currentExercise].targetDuration && (
                <View style={tw`mr-4 mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Duration</Text>
                  <Text style={tw`text-white font-bold`}>
                    {workout.exercises[currentExercise].targetDuration}
                  </Text>
                </View>
              )}
              {workout.exercises[currentExercise].targetRest && (
                <View style={tw`mb-2`}>
                  <Text style={tw`text-gray-400 text-sm`}>Rest</Text>
                  <Text style={tw`text-white font-bold`}>
                    {workout.exercises[currentExercise].targetRest}
                  </Text>
                </View>
              )}
            </View>
            <Text style={tw`text-gray-400 text-sm mt-2`}>
              {workout.exercises[currentExercise].notes}
            </Text>
          </View>

          {/* Sets Input */}
          {exerciseData[currentExercise].sets.map((set, setIndex) => (
            <View 
              key={setIndex}
              style={tw`mb-4 p-4 bg-gray-900 rounded-xl border border-gray-800`}
            >
              <Text style={tw`text-white font-bold mb-2`}>Set {setIndex + 1}</Text>
              <View style={tw`flex-row flex-wrap items-center`}>
                {workout.exercises[currentExercise].targetReps && (
                  <View style={tw`mr-4 mb-2 w-20`}>
                    <Text style={tw`text-gray-400 text-sm mb-1`}>Reps</Text>
                    <TextInput
                      style={tw`bg-gray-800 text-white p-2 rounded-lg`}
                      keyboardType="number-pad"
                      value={set.reps}
                      onChangeText={(value) => updateSetData(currentExercise, setIndex, 'reps', value)}
                      placeholder="0"
                      placeholderTextColor="#6b7280"
                    />
                  </View>
                )}
                {workout.exercises[currentExercise].targetDuration && (
                  <View style={tw`mr-4 mb-2 w-20`}>
                    <Text style={tw`text-gray-400 text-sm mb-1`}>Duration</Text>
                    <TextInput
                      style={tw`bg-gray-800 text-white p-2 rounded-lg`}
                      keyboardType="number-pad"
                      value={set.duration}
                      onChangeText={(value) => updateSetData(currentExercise, setIndex, 'duration', value)}
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
                onChangeText={(value) => updateSetData(currentExercise, setIndex, 'notes', value)}
              />
            </View>
          ))}

          {/* Set Controls */}
          <View style={tw`flex-row justify-between mb-4`}>
            <TouchableOpacity 
              style={tw`bg-gray-800 p-4 rounded-lg flex-1 mr-2`}
              onPress={() => removeSet(currentExercise)}
            >
              <Text style={tw`text-white text-center font-bold`}>Remove Set</Text>
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