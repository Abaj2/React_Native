import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import tw from "twrnc";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const workouts = [
  {
    id: 1,
    title: "Front Lever",
    description: "Master the front lever through progressive training.",
    totalsets: 8,
    totalexercises: 2,
    totallevels: 3,
    totaltime: 25,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Tuck Hold",
            sets: 4,
            duration: "10-20s",
            rest: "90s",
            notes: "Keep arms straight, maintain hollow body.",
          },
          {
            name: "Negative Tuck Pulls",
            sets: 3,
            reps: "5-8",
            rest: "120s",
            notes: "Control descent, focus on scapular retraction.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Advanced Tuck Hold",
            sets: 4,
            duration: "10-15s",
            rest: "120s",
            notes: "Extend legs slightly from tuck position.",
          },
          {
            name: "Single Leg Extensions",
            sets: 3,
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
            sets: 5,
            duration: "3-7s",
            rest: "180s",
            notes: "Maintain straight body, squeeze lats.",
          },
          {
            name: "One Leg Front Lever Pulls",
            sets: 3,
            reps: "3-5",
            rest: "180s",
            notes: "Keep one leg in advanced tuck, extend the other.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Muscle Up",
    description: "Progress from pull-ups to clean muscle-ups.",
    totalsets: 7,
    totalexercises: 3,
    totallevels: 3,
    totaltime: 22,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "High Pull-Ups",
            sets: 4,
            reps: "6-8",
            rest: "90s",
            notes: "Pull to upper chest, focus on exploding upward.",
          },
          {
            name: "Straight Bar Dips",
            sets: 3,
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
            sets: 4,
            reps: "5-7",
            rest: "120s",
            notes: "Pull bar to waist, lean forward slightly.",
          },
          {
            name: "Russian Dips",
            sets: 3,
            reps: "6-8",
            rest: "120s",
            notes: "Focus on transition.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Weighted Pull-Ups",
            sets: 3,
            reps: "8-10",
            rest: "180s",
            notes: "Clean form, try to be explosive.",
          },
          {
            name: "Band-Assisted Muscle-Ups",
            sets: 3,
            reps: "3-5",
            rest: "180s",
            notes: "Control descent, transition smoothly.",
          },
          {
            name: "Negative Muscle-Ups",
            sets: 3,
            reps: "3-5",
            rest: "180s",
            notes: "Slow controlled descent.",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Planche",
    description: "Achieve the planche through focused progressions.",
    totalsets: 8,
    totalexercises: 3,
    totallevels: 3,
    totaltime: 30,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Planche Leans",
            sets: 4,
            duration: "15-20s",
            rest: "90s",
            notes: "Lean forward while keeping arms straight.",
          },
          {
            name: "Tuck Planche",
            sets: 3,
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
            sets: 4,
            duration: "10-12s",
            rest: "120s",
            notes: "Slightly extend legs out from tuck position.",
          },
          {
            name: "Pseudo Planche Push-Ups",
            sets: 3,
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
            sets: 4,
            duration: "5-7s",
            rest: "180s",
            notes: "Open legs to straddle position to reduce difficulty.",
          },
          {
            name: "Planche Push-Ups",
            sets: 3,
            reps: "4-6",
            rest: "180s",
            notes: "Push through scapular protraction, keep arms straight.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Handstand",
    description: "Master balance and strength for a freestanding handstand.",
    totalsets: 7,
    totalexercises: 3,
    totallevels: 3,
    totaltime: 20,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Wall-Assisted Handstand (Back to Wall)",
            sets: 4,
            duration: "20-30s",
            rest: "90s",
            notes: "Focus on alignment and straight arms.",
          },
          {
            name: "Wall Walks",
            sets: 3,
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
            sets: 4,
            duration: "15-25s",
            rest: "120s",
            notes: "Get as close to the wall as possible.",
          },
          {
            name: "Freestanding Handstand Attempts",
            sets: 3,
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
            sets: 5,
            duration: "20-30s",
            rest: "180s",
            notes: "Maintain perfect alignment and core tension.",
          },
          {
            name: "Handstand Push-Ups",
            sets: 3,
            reps: "4-6",
            rest: "180s",
            notes: "Lower under control, keep a straight body line.",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Back Lever",
    description: "Develop strength and flexibility for the back lever.",
    totalsets: 7,
    totalexercises: 2,
    totallevels: 3,
    totaltime: 25,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Tuck Back Lever",
            sets: 4,
            duration: "10-15s",
            rest: "90s",
            notes:
              "Tuck legs and maintain a straight line from shoulders to hips.",
          },
          {
            name: "Skin the Cat",
            sets: 3,
            reps: "3-5",
            rest: "120s",
            notes: "Control the rotation, avoid swinging.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Advanced Tuck Back Lever",
            sets: 4,
            duration: "8-12s",
            rest: "120s",
            notes: "Slightly extend legs from the tuck position.",
          },
          {
            name: "German Hang",
            sets: 3,
            duration: "10-20s",
            rest: "90s",
            notes: "Stretch shoulders and focus on scapular retraction.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Straddle Back Lever",
            sets: 4,
            duration: "5-10s",
            rest: "180s",
            notes: "Open legs to straddle for balance.",
          },
          {
            name: "Full Back Lever",
            sets: 3,
            duration: "5-8s",
            rest: "180s",
            notes: "Hold a straight line from shoulders to toes.",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Human Flag",
    description: "Learn to hold the human flag through strength and technique.",
    totalsets: 8,
    totalexercises: 2,
    totallevels: 3,
    totaltime: 30,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Vertical Flag Holds",
            sets: 3,
            duration: "10-20s",
            rest: "90s",
            notes: "Focus on alignment and grip strength.",
          },
          {
            name: "Side Plank",
            sets: 3,
            duration: "20-30s",
            rest: "60s",
            notes: "Strengthen obliques for better stability.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Tuck Flag Holds",
            sets: 4,
            duration: "8-12s",
            rest: "120s",
            notes: "Bring knees toward chest to reduce difficulty.",
          },
          {
            name: "Dynamic Side Raises",
            sets: 3,
            reps: "4-6",
            rest: "90s",
            notes: "Raise legs to the side while gripping the bar.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Straddle Flag",
            sets: 4,
            duration: "5-10s",
            rest: "180s",
            notes: "Open legs to straddle for balance.",
          },
          {
            name: "Full Human Flag",
            sets: 3,
            duration: "5-8s",
            rest: "180s",
            notes: "Hold a straight line from head to toe.",
          },
        ],
      },
    ],
  },
  {
    id: 7,
    title: "L-Sit",
    description: "Develop core and hip flexor strength for the L-Sit.",
    totalsets: 6,
    totalexercises: 2,
    totallevels: 3,
    totaltime: 20,
    levels: [
      {
        level: "Beginner",
        exercises: [
          {
            name: "Tuck L-Sit",
            sets: 4,
            duration: "10-20s",
            rest: "60s",
            notes: "Tuck knees to chest and keep arms locked.",
          },
          {
            name: "Hanging Knee Raises",
            sets: 3,
            reps: "8-10",
            rest: "60s",
            notes: "Control movement, avoid swinging.",
          },
        ],
      },
      {
        level: "Intermediate",
        exercises: [
          {
            name: "Parallel Bar L-Sit",
            sets: 4,
            duration: "10-15s",
            rest: "90s",
            notes: "Keep legs straight and parallel to the ground.",
          },
          {
            name: "Hanging Leg Raises",
            sets: 3,
            reps: "8-10",
            rest: "90s",
            notes: "Engage core and avoid arching back.",
          },
        ],
      },
      {
        level: "Advanced",
        exercises: [
          {
            name: "Ring L-Sit",
            sets: 4,
            duration: "10-15s",
            rest: "120s",
            notes: "Stabilize rings while maintaining L-Sit position.",
          },
          {
            name: "V-Sit",
            sets: 3,
            duration: "5-10s",
            rest: "120s",
            notes: "Lift legs higher than L-Sit, keeping straight form.",
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
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setIsModalVisible(true);
  };

  const startWorkout = () => {
    setIsModalVisible(false);
    setIsLevelModalVisible(true);
  };

  const selectLevel = (level) => {
    setIsLevelModalVisible(false);
    

    const selectedWorkoutData = workouts.find(
      (workout) => workout.title === selectedWorkout.title
    );
  

    const selectedLevelData = selectedWorkoutData?.levels.find(
      (l) => l.level === level.level
    );
 
    const exercises = selectedLevelData?.exercises || [];
    console.log(exercises)
  
    navigation.navigate("Workout-Session", {
      
      title: selectedWorkout.title,
      level: level.level,
      exercises2: exercises,
    });
  };
  const ExerciseItem = ({ exercise }) => (
    <View
      style={tw`mb-4 p-4 bg-zinc-900 rounded-xl border-l-4 border-orange-500`}
    >
      <View style={tw`flex-row justify-between items-start mb-3`}>
        <Text style={tw`text-lg font-black text-white flex-1`}>
          {exercise.name}
        </Text>
        <Ionicons name="barbell" size={20} color="#f97316" />
      </View>

      <View style={tw`flex-row flex-wrap gap-4`}>
        {exercise.sets && (
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-orange-500 font-bold`}>{exercise.sets}</Text>
            <Text style={tw`text-zinc-400 ml-1 text-xs`}>SETS</Text>
          </View>
        )}
        {exercise.reps && (
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-orange-500 font-bold`}>{exercise.reps}</Text>
            <Text style={tw`text-zinc-400 ml-1 text-xs`}>REPS</Text>
          </View>
        )}
        {exercise.duration && (
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-orange-500 font-bold`}>
              {exercise.duration}
            </Text>
            <Text style={tw`text-zinc-400 ml-1 text-xs`}>DURATION</Text>
          </View>
        )}
        {exercise.rest && (
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-orange-500 font-bold`}>{exercise.rest}</Text>
            <Text style={tw`text-zinc-400 ml-1 text-xs`}>REST</Text>
          </View>
        )}
      </View>

      {exercise.notes && (
        <View style={tw`mt-3 bg-orange-500/10 p-3 rounded-lg`}>
          <Text style={tw`text-orange-300 text-xs font-medium`}>
            {exercise.notes}
          </Text>
        </View>
      )}
    </View>
  );

  const ModalHeader = ({ title, subtitle }) => (
    <LinearGradient
      colors={["#18181b", "#09090b"]}
      style={tw`border-b border-orange-800 p-6 rounded-t-3xl`}
    >
      <View style={tw`flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-2xl font-black text-white`}>{title}</Text>
          <Text style={tw`text-orange-400 font-semibold mt-1`}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsModalVisible(false)}
          style={tw`p-2 bg-orange-500/20 rounded-full`}
        >
          <Ionicons name="close" size={20} color="#f97316" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`pb-20`}>
        <View style={tw`pt-4`}>
     
          <TouchableOpacity
            onPress={() => navigation.navigate("custom-workout")}
            style={tw`mb-6 rounded-3xl overflow-hidden`}
          >
            <LinearGradient colors={["#f97316", "#ea580c"]} style={tw`p-6`}>
              <Text style={tw`text-white font-black text-xl mb-2`}>
                Custom Workout
              </Text>
              <Text style={tw`text-orange-100 text-sm mb-4`}>
                Build your own workout
              </Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-white/10 p-2 rounded-full`}>
                  <FontAwesome5 name="plus" size={18} color="white" />
                </View>
                <Text style={tw`text-white font-bold ml-3`}>
                  Start Creating
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

  
<View style={tw`flex-row gap-3`}>
  <ScrollView style={[tw`w-[90%]`, {}]} horizontal showsHorizontalScrollIndicator={false}>
  {workouts.map((workout) => (
    <TouchableOpacity
      key={workout.id}
      onPress={() => handleWorkoutPress(workout)}
      activeOpacity={0.9}
      style={tw`w-[8%] mr-3 mb-4`}
    >
      <Animated.View style={[
        tw`rounded-3xl p-3 overflow-hidden`,
        { 
          transform: [{ scale: scaleValue }],
          height: height * 0.22,
        }
      ]}>
        <LinearGradient
          colors={['#18181b', '#09090b']}
          style={tw`absolute top-0 left-0 right-0 bottom-0`}
        />
        
        <View style={tw`relative z-10 h-full justify-between`}>
      
          <View>
            <Text 
              style={tw`text-[15px] font-extrabold text-white mb-1 pr-4`}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {workout.title}
            </Text>
            
            <View style={tw` bg-orange-500/20 px-2 py-1 rounded-full self-start`}>
              <Text style={tw`text-orange-500 text-[10px] font-bold`}>
                {workout.totallevels} LEVELS
              </Text>
            </View>
          </View>

          <Text 
            style={tw`text-zinc-400 text-xs leading-[14px] mb-5`}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {workout.description}
          </Text>

          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="time" size={14} color="#f97316" />
              <Text style={tw`text-white text-xs font-semibold ml-1`}>
                {workout.totaltime}m
              </Text>
            </View>
            
            <View style={tw`flex-row items-center`}>
              <FontAwesome5 name="dumbbell" size={12} color="#f97316" />
              <Text style={tw`text-white text-xs font-semibold ml-1`}>
                {workout.totalsets}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  ))}
  </ScrollView>
</View>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <SafeAreaView style={tw`flex-1 bg-black/90`}>
          <View
            style={[
              tw`flex-1 bg-black border border-orange-500 rounded-t-3xl mt-20`,
              { width: width * 0.95 },
            ]}
          >
            <ModalHeader
              title={selectedWorkout?.title}
              subtitle="Skill Levels"
            />

            <ScrollView style={tw`flex-1 p-4`}>
              {selectedWorkout?.levels.map((level, levelIndex) => (
                <View key={levelIndex} style={tw`mb-8`}>
                  <Text style={tw`text-lg font-bold mb-4 text-orange-500`}>
                    {level.level}
                  </Text>
                  {level.exercises.map((exercise, index) => (
                    <ExerciseItem key={index} exercise={exercise} />
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

      <Modal visible={isLevelModalVisible} transparent animationType="slide">
        <View style={tw`flex-1 bg-black/90 items-center justify-center`}>
          <SafeAreaView style={tw`flex-1 items-center`}>
            <View
              style={[
                tw`bg-black border border-orange-500 rounded-3xl mt-20 p-4`,
                { width: width * 0.9 },
              ]}
            >
              <ModalHeader
                title="Select Difficulty"
                subtitle="Choose your challenge level"
              />

              <View style={tw`mt-4`}>
                {selectedWorkout?.levels.map((level, index) => (
                  <TouchableOpacity
                    key={index}
                    style={tw`mb-4 p-4 rounded-xl bg-zinc-900 border border-gray-800`}
                    onPress={() => selectLevel(level)}
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
    </SafeAreaView>
  );
};

export default Workouts;
