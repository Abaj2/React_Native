import axios from "axios";
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
  ScrollView,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LeaderboardCard from "../components/leaderboardCard";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const LEADERBOARD_STATS_URL = Platform.select({
  android: "http://10.0.2.2:4005/leaderboardstats",
  ios: "http://192.168.1.155:4005/leaderboardstats",
});

// Helper function to convert time string to total seconds
const timeStringToSeconds = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to format seconds to HH:MM:SS
const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(v => v < 10 ? "0" + v : v)
    .join(":");
};

const Leaderboard = () => {
  const [username, setUsername] = useState("Error fetching username");
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState();
  const [loading, setIsLoading] = useState(false);
  const [monthlyWorkouts, setMonthlyWorkouts] = useState([]);
  const [workoutTimes, setWorkoutTimes] = useState([]);
  const [rankedEntries, setRankedEntries] = useState([]);
  const [rankedTimeEntries, setRankedTimeEntries] = useState([]);
  const [currentUserEntry, setCurrentUserEntry] = useState(null);
  const [currentTimeUserEntry, setCurrentTimeUserEntry] = useState(null);


    const fetchData = useCallback(async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        console.log("Fetched userData:", userData);
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUsername(parsedData.username);
          setUserId(parsedData.user_id);
        } else {
          console.log("No userData found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        throw error; 
      }
    }, []);


    const getLeaderboardStats = useCallback(async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const response = await axios.get(LEADERBOARD_STATS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setUsers(response.data.users);
          const usersData = response.data.users;
          
          const workouts = response.data.workoutStats.map((workout) => {
            const user = usersData.find(
              (user) => user.user_id === workout.user_id
            );
            return {
              ...workout,
              username: user ? user.username : "Unknown",
            };
          });
          setMonthlyWorkouts(workouts);

          const times = response.data.workoutTime.map((time) => {
            const user = usersData.find(
              (user) => user.user_id === time.user_id
            );
            return {
              ...time,
              username: user ? user.username : "Unknown"
            };
          });
          setWorkoutTimes(times);
        }
      } catch (err) {
        console.error(err);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        let isActive = true;
    
        const initializeData = async () => {
          try {
            setIsLoading(true);
            
            if (isActive) {
              await fetchData();
              await getLeaderboardStats();
            }
          } catch (error) {
            console.error("Error in initializeData:", error);
          } finally {
            if (isActive) {
              setIsLoading(false);
            }
          }
        };
    
        initializeData();
    
 
        return () => {
          isActive = false;
        };
      }, [fetchData, getLeaderboardStats])
    );

  useEffect(() => {
    const groupWorkoutsByUser = (workouts) => {
      const workoutCount = {};
      workouts.forEach((workout) => {
        if (workout.username !== "Unknown") {
          workoutCount[workout.username] = (workoutCount[workout.username] || 0) + 1;
        }
      });
      return workoutCount;
    };
    const workoutsByUser = groupWorkoutsByUser(monthlyWorkouts);
    const workoutEntries = Object.entries(workoutsByUser);

    const sortedEntries = workoutEntries.sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      } else {
        return a[0].localeCompare(b[0]);
      }
    });

    const ranked = sortedEntries.map((entry, index) => ({
      username: entry[0],
      count: entry[1],
      rank: index + 1,
    }));

    setRankedEntries(ranked);
    setCurrentUserEntry(ranked.find((entry) => entry.username === username));
  }, [monthlyWorkouts, username]);

  
  const timeStringToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  useEffect(() => {
    const calculateTotalTimes = (times) => {
      const timeMap = {};
      
      times.forEach((time) => {
        if (time.username !== "Unknown") {
          if (!timeMap[time.user_id]) {
            timeMap[time.user_id] = {
              username: time.username,
              totalSeconds: 0
            };
          }
          timeMap[time.user_id].totalSeconds += timeStringToSeconds(time.workout_time);
        }
      });
  
      return Object.values(timeMap).map(user => ({
        username: user.username,
        totalSeconds: user.totalSeconds,
        formattedTime: formatDuration(user.totalSeconds)
      }));
    };

    const timeEntries = calculateTotalTimes(workoutTimes);
    
    const sortedTimeEntries = timeEntries.sort((a, b) => {
      if (b.totalSeconds !== a.totalSeconds) {
        return b.totalSeconds - a.totalSeconds;
      } else {
        return a.username.localeCompare(b.username);
      }
    });

    const rankedTimes = sortedTimeEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    setRankedTimeEntries(rankedTimes);
    setCurrentTimeUserEntry(rankedTimes.find(entry => entry.username === username));
  }, [workoutTimes, username]);

  const [selectedTab, setSelectedTab] = useState("Tab1");

  return (
    <LinearGradient colors={["#000000", "#1a1a1a"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
          <View style={tw`px-4 pb-8`}>
            {/* Header */}
            <View style={tw`flex-row items-center justify-between mt-8 mb-6`}>
              <Text style={tw`text-white font-bold text-3xl`}>
                Leaderboards
              </Text>
              <Ionicons name="trophy-outline" size={28} color="#f97316" />
            </View>
  
            {/* Tabs */}
            <View style={tw`mb-6`}>
              <View style={tw`flex-row gap-3 justify-between`}>
                <TouchableOpacity 
                  style={tw`flex-1`} 
                  onPress={() => setSelectedTab("Tab1")}
                >
                  <View
                    style={tw`flex-row gap-2 rounded-2xl py-3 px-4 ${
                      selectedTab === "Tab1"
                        ? "bg-orange-500"
                        : "bg-zinc-900 border border-zinc-800"
                    } justify-center items-center`}
                  >
                    <Ionicons
                      name="calendar-clear-outline"
                      size={22}
                      color="white"
                    />
                    <Text style={tw`font-bold text-white`}>
                      Monthly Workouts
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={tw`flex-1`} 
                  onPress={() => setSelectedTab("Tab2")}
                >
                  <View
                    style={tw`flex-row gap-2 rounded-2xl py-3 px-4 ${
                      selectedTab === "Tab2"
                        ? "bg-orange-500"
                        : "bg-zinc-900 border border-zinc-800"
                    } justify-center items-center`}
                  >
                    <Ionicons
                      name="stopwatch-outline"
                      size={22}
                      color="white"
                    />
                    <Text style={tw`font-bold text-white`}>Workout Time</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* User Ranking Card */}
            <LinearGradient
              colors={["rgba(249,115,22,0.4)", "rgba(234,88,12,0.1)"]}
              style={tw`border border-orange-500 rounded-3xl mb-6 overflow-hidden`}
            >
              <View style={tw`p-5`}>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                  <Text style={tw`font-bold text-orange-400 text-xl`}>
                    Your Ranking
                  </Text>
                  <View style={tw`bg-orange-500/20 p-2 rounded-full`}>
                    <Ionicons
                      name="trophy-outline"
                      size={24}
                      color="#f97316"
                    />
                  </View>
                </View>
                
                <View style={tw`flex-row items-center`}>
                  <Image
                    source={blackDefaultProfilePic}
                    style={tw`w-16 h-16 rounded-full border-2 border-orange-500`}
                  />
                  <View style={tw`ml-4 flex-1`}>
                    <Text style={tw`font-bold text-white text-xl mb-1`}>
                      {username}
                    </Text>
                    <View style={tw`flex-row justify-between items-center`}>
                      <View style={tw`bg-zinc-900/80 py-1 px-3 rounded-full`}>
                        <Text style={tw`text-gray-200 font-bold`}>
                          Rank #{selectedTab === "Tab1" 
                            ? currentUserEntry?.rank || "N/A" 
                            : currentTimeUserEntry?.rank || "N/A"}
                        </Text>
                      </View>
                      <View style={tw`bg-orange-500/20 py-1 px-3 rounded-full`}>
                        <Text style={tw`text-orange-300 font-bold`}>
                          {selectedTab === "Tab1"
                            ? `${currentUserEntry?.count || 0} Workouts`
                            : currentTimeUserEntry?.formattedTime || "00:00:00"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
  
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View style={tw`flex-row items-center`}>
       
                <Text style={tw`text-white font-bold text-xl`}>
                  Top Rankings
                </Text>
              
              </View>
             
              <View style={tw`flex-row items-center bg-zinc-900 py-1 px-3 rounded-full`}>
                <Ionicons name="people-outline" size={18} color="#f97316" />
                <Text style={tw`text-gray-300 ml-2`}>
                  {selectedTab === "Tab1" 
                    ? rankedEntries.length 
                    : rankedTimeEntries.length} participants
                </Text>
              </View>
              
            </View>
            <View style={tw`bg-orange-500 h-1 rounded-xl mb-10 w-full self-center`}></View>
  
            {/* Leaderboard List */}
            {selectedTab === "Tab1" ? (
              rankedEntries.length > 0 ? (
                <View style={tw`bg-zinc-900/60 rounded-3xl overflow-hidden border border-zinc-800`}>
                  {rankedEntries.map((entry, index) => (
                    <View key={entry.username} style={tw`${
                      index !== rankedEntries.length - 1 ? "border-b border-zinc-800" : ""
                    }`}>
                      <LeaderboardCard
                        username={entry.username}
                        workouts={entry.count}
                        rank={entry.rank}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={tw`bg-zinc-900/60 p-8 rounded-3xl items-center justify-center border border-zinc-800`}>
                  <Ionicons name="fitness-outline" size={40} color="#f97316" style={tw`mb-3 opacity-50`} />
                  <Text style={tw`text-white text-xl text-center font-bold`}>
                    No workout entries yet
                  </Text>
                  <Text style={tw`text-gray-400 text-center mt-2`}>
                    Complete workouts to appear on the leaderboard
                  </Text>
                </View>
              )
            ) : rankedTimeEntries.length > 0 ? (
              <View style={tw`bg-zinc-900/60 rounded-3xl overflow-hidden border border-zinc-800`}>
                {rankedTimeEntries.map((entry, index) => (
                  <View key={entry.username} style={tw`${
                    index !== rankedTimeEntries.length - 1 ? "border-b border-zinc-800" : ""
                  }`}>
                    <LeaderboardCard
                      username={entry.username}
                      metric={entry.formattedTime}
                      rank={entry.rank}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={tw`bg-zinc-900/60 p-8 rounded-3xl items-center justify-center border border-zinc-800`}>
                <Ionicons name="stopwatch-outline" size={40} color="#f97316" style={tw`mb-3 opacity-50`} />
                <Text style={tw`text-white text-xl text-center font-bold`}>
                  No time entries yet
                </Text>
                <Text style={tw`text-gray-400 text-center mt-2`}>
                  Complete workouts to appear on the leaderboard
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Leaderboard;