import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const workouts = [
  {
    id: 1,
    title: "Front Lever",
    description: "Mater the front lever through progressive training.",
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Tuck Hold",
            sets: "3-4",
            duration: "10-20s",
            rest: "90s",
            notes: "Keep arms straight, maintain hollow body",
          },
          {
            name: "Negative Tuck Pulls",
            sets: "3",
            reps: "5-8",
            rest: "120s",
            notes: "Control descent, focus on scapular retraction",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Advanced Tuck Hold",
            sets: "4",
            duration: "10-15s",
            rest: "120s",
            notes: "Extend legs slightly from tuck position.",
          },
          {
            name: "Single Leg Extensions",
            sets: "3",
            reps: "5 each leg",
            rest: "120s",
            notes: "Alternate legs, maintain stable position.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Straddle Front Lever Hold",
            sets: "4-5",
            duration: "3-7s",
            rest: "180s",
            notes: "Maintain straight body, squeeze lats.",
          },
          {
            name: "One Leg Front Lever Pulls",
            sets: "3",
            reps: "3-5",
            rest: "180s",
            notes: "Keep one leg in advanced tuck, and extend the other",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Muscle Up",
    description: "Progress from pull-ups to clean muscle ups",
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "High Pull-Ups",
            sets: "4",
            reps: "6-8",
            rest: "90s",
            notes: "Pull to upper chest, focus on exploding upward.",
          },
          {
            name: "Straight Bar Dips",
            sets: "3",
            reps: "8-10",
            rest: "90s",
            notes: "Full range of motion, use weight if too easy.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Explosive Pull-Ups",
            sets: "4",
            reps: "5-7",
            rest: "120s",
            notes: "Pull bar to waist, lean forward slightly",
          },
          {
            name: "Russian Dips",
            sets: "3",
            reps: "6-8",
            rest: "120s",
            notes: "Focus on transition",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Weighted Pullups",
            sets: "3",
            reps: "8-10",
            rest: "180s",
            notes: "Clean form, try to be explosive",
          },
          {
            name: "Band Assisted Muscle Ups",
            sets: "3",
            reps: "3-5",
            rest: "180s",
            notes: "Control descent and instantly go into the next muslce up",
          },
          {
            name: "Negative Muscle Ups",
            sets: "3",
            reps: "3-5",
            rest: "180s",
            notes: "Be as slow as possible",
          },
        ],
      },
    ],
  },
];

const Workouts = ({ isDarkMode }) => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLevelModalVisible, setIsLevelModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setIsModalVisible(true);
  };

  const startWorkout = () => {
    //navigation.navigate("Workout-Session", {
      //title: selectedWorkout.title
    //})
    setIsModalVisible(false);
    setIsLevelModalVisible(true)
  };

  const selectLevel = (level) => {
    setIsLevelModalVisible(false)
    setSelectedLevel(level);
    navigation.navigate("Workout-Session", {
      title: selectedWorkout.title,
      level: selectedLevel,
    })
  }

  return (
    <SafeAreaView>
      <View style={tw`flex-column items-center`}>
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => handleWorkoutPress(workout)}
          >
            <View
              style={[
                tw`mb-5 ${
                  isDarkMode ? "bg-[#0d121d]" : "bg-white"
                } border rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                }`,
                { width: width * 0.9, height: height * 0.12 },
              ]}
            >
              <View style={tw`flex-row justify-between`}>
                <Text
                  style={[
                    tw`font-bold ${
                      isDarkMode ? "text-white" : "text-black"
                    } mb-3 ml-3 mt-6`,
                    { fontSize: 16 },
                  ]}
                >
                  {workout.title}
                </Text>
                <Ionicons
                  style={tw`mt-6 mr-5`}
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? "#f97316" : "lightblue"}
                />
              </View>
              <Text
                style={[
                  tw`ml-3 mr-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-700"
                  }`,
                  { fontSize: 14 },
                ]}
              >
                {workout.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
        >
          <SafeAreaView style={[tw`items-center flex-1 bg-black/90`, {}]}>
            <View
              style={[
                tw`flex-1 bg-black border border-gray-800 rounded-t-3xl mt-20`,
                { width: width * 0.95 },
              ]}
            >
              <View
                style={tw`border-b border-gray-800 p-4 flex-row justify-between items-start`}
              >
                <View>
                  <Text style={tw`text-xl font-bold text-white`}>
                    {selectedWorkout?.title}
                  </Text>
                  <Text style={tw`text-sm text-orange-400`}>Skill Levels</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={tw`p-2`}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <ScrollView style={tw`flex-1 p-4`}>
                {selectedWorkout?.levels.map((level, levelIndex) => (
                  <View key={levelIndex} style={tw`mb-8`}>
                    <Text style={tw`text-lg font-bold mb-4 text-orange-500`}>
                      {level.level}
                    </Text>
                    {level.exercises.map((exercise, index) => (
                      <View
                        key={index}
                        style={tw`mb-4 p-4 rounded-xl bg-gray-900 border border-gray-800`}
                      >
                        <Text style={tw`text-lg font-bold mb-2 text-white`}>
                          {exercise.name}
                        </Text>
                        <View style={tw`flex-row flex-wrap mb-2`}>
                          {exercise.sets && (
                            <View style={tw`mr-4 mb-2`}>
                              <Text style={tw`text-sm text-gray-400`}>
                                Sets
                              </Text>
                              <Text style={tw`font-bold text-white`}>
                                {exercise.sets}
                              </Text>
                            </View>
                          )}
                          {exercise.reps && (
                            <View style={tw`mr-4 mb-2`}>
                              <Text style={tw`text-sm text-gray-400`}>
                                Reps
                              </Text>
                              <Text style={tw`font-bold text-white`}>
                                {exercise.reps}
                              </Text>
                            </View>
                          )}
                          {exercise.duration && (
                            <View style={tw`mr-4 mb-2`}>
                              <Text style={tw`text-sm text-gray-400`}>
                                Duration
                              </Text>
                              <Text style={tw`font-bold text-white`}>
                                {exercise.duration}
                              </Text>
                            </View>
                          )}
                          {exercise.rest && (
                            <View style={tw`mb-2`}>
                              <Text style={tw`text-sm text-gray-400`}>
                                Rest
                              </Text>
                              <Text style={tw`font-bold text-white`}>
                                {exercise.rest}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={tw`text-sm text-gray-400`}>
                          {exercise.notes}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
              <View style={tw`border-t border-gray-800 p-4`}>
                <TouchableOpacity
                  style={tw`bg-orange-500 p-4 rounded-xl`}
                  onPress={startWorkout}
                >
                  <Text style={tw`text-white text-center font-bold`}>
                    Start Workout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        <Modal
  visible={isLevelModalVisible}
  transparent={true}
  animationType="slide"
>
  <View style={tw`flex-1 bg-black/90`}>
    <SafeAreaView style={tw`flex-1 items-center`}>
      <View
        style={[
          tw`bg-black border border-gray-800 rounded-3xl mt-20 p-4`,
          { width: width * 0.9, minHeight: height * 0.3 },
        ]}
      >
        <View style={tw`border-b border-gray-800 pb-4 flex-row justify-between items-center`}>
          <Text style={tw`text-xl font-bold text-white`}>Select Level</Text>
          <TouchableOpacity
            onPress={() => setIsLevelModalVisible(false)}
            style={tw`p-2`}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={tw`mt-4`}>
          {selectedWorkout?.levels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={tw`mb-4 p-4 rounded-xl bg-gray-900 border border-gray-800`}
              onPress={() => {
                selectLevel(level)
                
              }}
            >
              <Text style={tw`text-lg font-bold text-orange-500`}>
                {level.level}
              </Text>
              <Text style={tw`text-sm text-gray-400 mt-2`}>
                {level.exercises.length} exercises
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  </View>
</Modal>
      </View>
    </SafeAreaView>
  );
};

export default Workouts;
