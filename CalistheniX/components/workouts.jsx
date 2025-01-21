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
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon } from "react-native-vector-icons/Feather";

const { width, height } = Dimensions.get("window");

const workouts = [
  {
    id: 1,
    title: "Front Lever",
    description: "Master the front lever through progressive training.",
    totalsets: "7-8",
    totalexercises: "2",
    totallevels: "3",
    totaltime: "25",
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
    totalsets: "6-7",
    totalexercises: "2-3",
    totallevels: "3",
    totaltime: "22",
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
            notes: "Control descent and instantly go into the next muscle up",
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
  {
    id: 3,
    title: "Planche",
    description: "Achieve the planche through focused progressions.",
    totalsets: "6-8",
    totalexercises: "3",
    totallevels: "3",
    totaltime: "30",
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Planche Leans",
            sets: "3-4",
            duration: "15-20s",
            rest: "90s",
            notes:
              "Lean forward as far as possible while keeping arms straight.",
          },
          {
            name: "Tuck Planche",
            sets: "3",
            duration: "10-15s",
            rest: "120s",
            notes: "Focus on maintaining shoulder protraction.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Advanced Tuck Planche",
            sets: "3-4",
            duration: "10-12s",
            rest: "120s",
            notes: "Slightly extend legs out from tuck position.",
          },
          {
            name: "Pseudo Planche Push-Ups",
            sets: "3",
            reps: "6-8",
            rest: "120s",
            notes: "Lean forward as you push up, keep core tight.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Straddle Planche Hold",
            sets: "4",
            duration: "5-7s",
            rest: "180s",
            notes: "Open legs to straddle position to reduce difficulty.",
          },
          {
            name: "Planche Push-Ups",
            sets: "3",
            reps: "4-6",
            rest: "180s",
            notes: "Push through scapular protraction, maintain straight arms.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Handstand",
    description: "Master balance and strength for a freestanding handstand.",
    totalsets: "5-7",
    totalexercises: "3",
    totallevels: "3",
    totaltime: "20",
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Wall-Assisted Handstand (Back to Wall)",
            sets: "3-4",
            duration: "20-30s",
            rest: "90s",
            notes: "Focus on alignment and straight arms.",
          },
          {
            name: "Wall Walks",
            sets: "3",
            reps: "4-5",
            rest: "90s",
            notes: "Walk up the wall slowly and return under control.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Wall-Assisted Handstand (Face to Wall)",
            sets: "4",
            duration: "15-25s",
            rest: "120s",
            notes: "Get as close to the wall as possible.",
          },
          {
            name: "Freestanding Handstand Attempts",
            sets: "3",
            duration: "10-15s",
            rest: "120s",
            notes: "Kick up and hold balance without support.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Handstand Hold",
            sets: "4-5",
            duration: "20-30s",
            rest: "180s",
            notes: "Maintain perfect alignment and core tension.",
          },
          {
            name: "Handstand Push-Ups",
            sets: "3",
            reps: "4-6",
            rest: "180s",
            notes: "Lower under control, keep a straight body line.",
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
  const [customWorkoutModal, setCustomWorkoutModal] = useState(null);

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setIsModalVisible(true);
  };

  const startWorkout = () => {
    //navigation.navigate("Workout-Session", {
    //title: selectedWorkout.title
    //})
    setIsModalVisible(false);
    setIsLevelModalVisible(true);
  };

  const selectLevel = (level) => {
    setIsLevelModalVisible(false);

    const exercises = workouts
      .find((workout) => workout.title === selectedWorkout.title)
      ?.levels.find((level) => level.level === level.level)?.exercises;

    navigation.navigate("Workout-Session", {
      title: selectedWorkout.title,
      level: level.level,
      exercises2: exercises,
    });
  };

  return (
    <SafeAreaView>
      <View style={tw`flex-column items-center`}>
        <View
          style={[
            tw`flex-row bg-zinc-900 rounded-3xl mb-5 border-l-4 border-orange-500`,
            { width: width * 0.9, height: height * 0.08 },
          ]}
        >
          <Text style={tw`text-white font-bold m-5 text-lg`}>
            Custom Workout
          </Text>
          <TouchableOpacity onPress={() => setCustomWorkoutModal(true)}>
            <View
              style={[
                tw`mb-5 rounded-lg mt-5 text-center justify-center items-center bg-orange-500`,
                {
                  width: width * 0.35,
                  height: height * 0.04,
                  zIndex: 100,
                },
              ]}
            >
              <Text style={tw`text-white font-bold`}>Start</Text>
            </View>
          </TouchableOpacity>
        </View>
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => handleWorkoutPress(workout)}
          >
            <View
              style={tw`bg-zinc-900 border-l-4 border-l-orange-500 mb-5 rounded-3xl p-4`}
            >
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-lg font-bold text-white`}>
                  {workout.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#f97316" />
              </View>
              <Text style={tw`text-zinc-400 mb-4`}>{workout.description}</Text>
              <View style={tw`flex-row flex-wrap justify-between`}>
                <View style={tw`flex-row items-center mb-2 w-1/2`}>
                  <Ionicons name="layers-outline" size={16} color="#f97316" />
                  <Text style={tw`text-zinc-300 text-sm ml-2`}>
                    {workout.totallevels} Levels
                  </Text>
                </View>
                <View style={tw`flex-row items-center mb-2 w-1/2`}>
                  <MaterialIcons
                    name="fitness-center"
                    size={16}
                    color="#f97316"
                  />
                  <Text style={tw`text-zinc-300 text-sm ml-2`}>
                    {workout.totalexercises} Exercises
                  </Text>
                </View>
                <View style={tw`flex-row items-center mb-2 w-1/2`}>
                  <FontAwesome5 name="dumbbell" size={13} color="#f97316" />
                  <Text style={tw`text-zinc-300 text-sm ml-2`}>
                    {workout.totalsets} Sets
                  </Text>
                </View>
                <View style={tw`flex-row items-center mb-2 w-1/2`}>
                  <Ionicons name="time-outline" size={16} color="#f97316" />
                  <Text style={tw`text-zinc-300 text-sm ml-2`}>
                    {`Approx ${workout.totaltime} min`}
                  </Text>
                </View>
              </View>
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
                tw`flex-1 bg-black border border-orange-500 rounded-t-3xl mt-20`,
                { width: width * 0.95 },
              ]}
            >
              <View
                style={tw`border-b border-orange-800 p-4 flex-row justify-between items-start`}
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
                        style={tw`mb-4 p-4 rounded-xl bg-[#18181b] border border-gray-800`}
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
          <View style={tw`flex-1 bg-black/90 items-center justify-center`}>
            <SafeAreaView style={tw`flex-1 items-center`}>
              <View
                style={[
                  tw`bg-black border border-orange-500 rounded-3xl mt-20 p-4`,
                  {
                    width: width * 0.9,
                    minHeight: height * 0.3,
                    top: height * 0.1,
                  },
                ]}
              >
                <View
                  style={tw`border-b border-orange-400 pb-4 flex-row justify-between items-center`}
                >
                  <Text style={tw`text-xl font-bold text-white`}>
                    Select Difficulty
                  </Text>
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
                      style={tw`mb-4 p-4 rounded-xl bg-[#18181b] border border-gray-800`}
                      onPress={() => {
                        selectLevel(level);
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
        <View>
          <Modal
            visible={customWorkoutModal}
            transparent={true}
            animationType="fade"
          >
            <View style={tw`flex-1 bg-black/90`}>
              <SafeAreaView>
                <View
                  style={[
                    tw`bg-gray-700 rounded-xl self-center mt-${width * 0.14}`,
                    { width: width * 0.75, height: height * 0.45 },
                  ]}
                >
                  <TouchableOpacity
                    style={tw`absolute top-3 left-3`}
                    onPress={() => setCustomWorkoutModal(false)}
                  >
                    <Ionicons name="close" size={30} color="gray" />
                  </TouchableOpacity>

                  <View style={tw`flex-1 mt-3 items-center`}>
                    <Text style={tw`text-white font-bold text-xl`}>
                      Custom Workout
                    </Text>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Workouts;
