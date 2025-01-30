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
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import RNPickerSelect from "react-native-picker-select";
import { Dropdown } from "react-native-element-dropdown";
import Skill from "../components/skill.jsx";
import Workouts from "../components/workouts.jsx";
import { LinearGradient } from "expo-linear-gradient";

import HistoryCard from "../components/historyCard.jsx";

import axios from "axios";
import Progress from "../components/progress.jsx";

const { width, height } = Dimensions.get("window");

const WorkoutsMain = () => {
  const navigation = useNavigation();
  const [isDarkMode] = useState(true);

  const [thisWeekDuration, setThisWeekDuration] = useState({ total_duration_seconds: { seconds: 0 } });
  const [lastWeekDuration, setLastWeekDuration] = useState({ total_duration_seconds: { seconds: 0 } });
  const [routineLength, setRoutineLength] = useState(0);

  const GET_DURATION_URL = Platform.select({
    android: "http://10.0.2.2:4005/getduration",
    ios: "http://192.168.1.155:4005/getduration",
  });

  const formatDuration = (duration) => {
    if (!duration || !duration.total_duration_seconds || isNaN(duration.total_duration_seconds)) {
      return '0m';
    }

    const totalSeconds = Math.floor(parseFloat(duration.total_duration_seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${totalSeconds}s`;
  };

  const getPercentageChange = () => {
    const thisWeek = parseFloat(thisWeekDuration?.total_duration_seconds || 0);
    const lastWeek = parseFloat(lastWeekDuration?.total_duration_seconds || 0);

    if (lastWeek === 0) {
      return thisWeek === 0 ? 0 : 100;
    }
    
    return ((thisWeek - lastWeek) / lastWeek) * 100;
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;

  useEffect(() => {
    const getThisWeekDuration = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const userData = JSON.parse(await AsyncStorage.getItem("userData"));
        const response = await axios.get(GET_DURATION_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            user_id: userData.user_id,
          },
        });
        console.log(response.data)
        console.log(response.data.thisWeekDuration.total_duration_seconds);
        console.log(response.data.lastWeekDuration.total_duration_seconds);
        setThisWeekDuration(response.data.thisWeekDuration);
        setLastWeekDuration(response.data.lastWeekDuration);
        setRoutineLength(response.data.routineLength);
      } catch (error) {
        console.error(error);
      }
    };
    getThisWeekDuration();
  }, []);

  return (
    <LinearGradient colors={["#09090b", "#18181b"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={tw`pb-20`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`px-5 pt-6 pb-4`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-3xl font-black text-white`}>
                CalistheniX
                <Text style={tw`text-orange-500`}>.</Text>
              </Text>
              <TouchableOpacity
                style={tw`bg-orange-500/20 p-2 rounded-full`}
                onPress={() => navigation.navigate("Profile")}
              >
                <Ionicons name="person" size={24} color="#f97316" />
              </TouchableOpacity>
            </View>

            
            <View style={tw`flex-row justify-between mb-6`}>
              <LinearGradient
                colors={["#f97316", "#ea580c"]}
                style={tw`p-4 rounded-2xl w-[48%]`}
              >
                <Text style={tw`text-white text-xs font-bold mb-1`}>
                  Active
                </Text>
                <Text style={tw`text-white text-xl font-black`}>{`${routineLength} Routine${routineLength > 1 ? 's' : ''}`}</Text>
                <FontAwesome5
                  name="running"
                  size={20}
                  color="white"
                  style={tw`mt-2`}
                />
              </LinearGradient>

              <View style={tw`bg-zinc-900 p-4 rounded-2xl w-[48%]`}>
                <Text style={tw`text-orange-500 text-xs font-bold mb-1`}>
                  This Week
                </Text>
                <Text style={tw`text-white text-xl font-black`}>
                  {formatDuration(thisWeekDuration)}
                </Text>
                <View style={tw`flex-row items-center mt-2`}>
                  {percentageChange !== 0 && (
                    <>
                      <Ionicons
                        name={isPositive ? "trending-up" : "trending-down"}
                        size={16}
                        color={isPositive ? "#22c55e" : "#ef4444"}
                      />
                      <Text
                        style={[
                          tw`text-xs font-bold ml-1`,
                          isPositive ? tw`text-green-500` : tw`text-red-500`,
                        ]}
                      >
                        {Math.abs(percentageChange).toFixed(1)}%
                      </Text>
                    </>
                  )}
                  {percentageChange === 0 && (
                    <Text style={tw`text-gray-400 text-xs`}>No change</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
     
          <View style={tw`px-5 mb-6`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl font-black text-white`}>
                Your Routines
              </Text>
              <TouchableOpacity>
                <Text style={tw`text-orange-500 text-sm font-bold`}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

          
            <TouchableOpacity
              style={tw`bg-zinc-900 rounded-3xl p-4`}
              activeOpacity={0.9}
            >
              <View style={tw`flex-row justify-between items-start mb-4`}>
                <Text style={tw`text-white text-lg font-bold max-w-[60%]`}>
                  Full Body Mastery
                </Text>
                <View style={tw`bg-orange-500/20 px-2 py-1 rounded-full`}>
                  <Text style={tw`text-orange-500 text-xs font-bold`}>NEW</Text>
                </View>
              </View>
              <View style={tw`flex-row items-center mb-4`}>
                <Ionicons name="time" size={16} color="#f97316" />
                <Text style={tw`text-white text-sm ml-2`}>45m</Text>
                <Text style={tw`text-zinc-500 mx-2`}>•</Text>
                <FontAwesome5 name="dumbbell" size={14} color="#f97316" />
                <Text style={tw`text-white text-sm ml-2`}>6 Exercises</Text>
              </View>
              <TouchableOpacity
                style={tw`bg-orange-500 py-3 rounded-xl`}
                onPress={() => navigation.navigate("Workout-Session")}
              >
                <Text style={tw`text-white text-center font-bold`}>
                  Start Routine
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View style={tw`px-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl font-black text-white`}>
                All Exercises
              </Text>
              <TouchableOpacity>
                <Text style={tw`text-orange-500 text-sm font-bold`}>
                  Filter
                </Text>
              </TouchableOpacity>
            </View>

            <Workouts isDarkMode={isDarkMode} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WorkoutsMain;
