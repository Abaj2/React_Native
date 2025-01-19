import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  TextInput,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from "twrnc";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import RNPickerSelect from "react-native-picker-select";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const GET_WORKOUTS_URL = Platform.select({
  android: "http://10.0.2.2:4005/getworkouts",
  ios: "http://10.0.0.122:4005/getworkouts",
});

const HistoryCard = ({ isDarkMode }) => {
  const [workoutsData, setWorkoutsData] = useState([]);
  const [exercisesData, setExercisesData] = useState({});
  const [setsData, setSetsData] = useState({});
  const navigation = useNavigation();

  const getWorkouts = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));
    const jwtToken = await AsyncStorage.getItem("jwtToken");

    const response = await axios.get(GET_WORKOUTS_URL, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (response.status === 200) {
      setWorkoutsData(response.data.workouts);
      setExercisesData(response.data.exercises);
      setSetsData(response.data.sets);
    } else {
      console.log("Failed to fetch user data from server");
    }
  };
  useEffect(() => {
    getWorkouts();
  }, []);

  useEffect(() => {
    if (
      workoutsData.length > 0 ||
      Object.keys(exercisesData).length > 0 ||
      Object.keys(setsData).length > 0
    ) {
      console.log(workoutsData);
      console.log(exercisesData);
      console.log(setsData);
    }
  }, [workoutsData, exercisesData, setsData]);

  return (
    <SafeAreaView style={tw``}>
      <View
        style={[
          tw`items-center flex-row justify-between self-center bg-gray-800 rounded-lg mb-3`,
          { width: width * 0.9, height: height * 0.1 },
        ]}
      >
        <View
          style={tw`border-r border-white pr-22 flex-column items-center justify-center`}
        >
          <Text
            style={[
              tw`text-orange-500 ml-5 font-bold text-xl`,
              { fontSize: 22 },
            ]}
          >{`${workoutsData.length}`}</Text>
          <Text style={tw`text-white ml-5`}>Workouts</Text>
        </View>
        <View style={tw`flex-column items-center justify-center`}>
          <Text
            style={[
              tw`text-orange-500 mr-5 font-bold text-xl`,
              { fontSize: 22 },
            ]}
          >
            1
          </Text>
          <Text style={tw`text-white mr-5`}>Daily Streak</Text>
        </View>
      </View>
      <ScrollView>
        <View>
          {workoutsData.map((workout) => (
            <View
              style={tw`border ${
                isDarkMode ? "border-orange-500" : "border-gray-700"
              } rounded-lg mb-5 p-4`}
            >
              <View style={tw`flex-row justify-between`}>
                <Text
                  style={[
                    tw`font-bold ${isDarkMode ? "text-white" : "text-black"}`,
                    { fontSize: 18 },
                  ]}
                >
                  {workout.title}
                </Text>
                <Text
                  style={[
                    tw`mb-3 ${isDarkMode ? "text-gray-500" : "text-gray-700"}`,
                  ]}
                >
                  {workout.date}
                </Text>
              </View>
              <Text
                style={tw`mb-5 ${
                  isDarkMode ? "text-[#fb923c]" : "text-[#60a5fa]"
                }`}
              >
                {workout.level}
              </Text>
              {exercisesData
                .filter(
                  (exercise) => exercise.workout_id === workout.workout_id
                )
                .map((exercise) => (
                  <View style={tw`mb-3`}>
                    <Text
                      style={tw`self-center mb-2 ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {exercise.name}
                    </Text>

                    {setsData
                      .filter(
                        (set) =>
                          set.workout_id === workout.workout_id &&
                          set.exercise_id === exercise.exercise_id
                      )
                      .map((set, index) => (
                        <View
                          style={[
                            tw`border border-gray-500 flex-row justify-between items-center mb-3 ${
                              isDarkMode ? "bg-[#18181b]" : "bg-[#f3f4f6]"
                            } rounded-2xl`,
                            { width: width * 0.8, height: height * 0.07 },
                          ]}
                        >
                          <Text
                            style={tw`m-5 ${
                              isDarkMode ? "text-gray-500" : "text-gray-700"
                            }`}
                          >{`Set ${index + 1}`}</Text>
                          <Text
                            style={tw`${
                              isDarkMode ? "text-gray-500" : "text-gray-700"
                            }`}
                          >
                            {set.notes || ""}
                          </Text>
                          <View
                            style={[
                              tw`justify-center items-center mr-2 rounded-xl ${
                                isDarkMode ? "bg-gray-800" : "bg-gray-400"
                              }`,
                              { width: width * 0.13, height: height * 0.05 },
                            ]}
                          >
                            <Text
                              style={[
                                tw`${
                                  isDarkMode ? "text-gray-400" : "text-gray-700"
                                }`,
                                {},
                              ]}
                            >
                              {set.duration
                                ? `${set.duration}s`
                                : set.reps
                                ? `${set.reps} reps`
                                : "N/A"}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryCard;
