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
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LeaderboardCard from "../components/leaderboardCard";
import { useFocusEffect } from "@react-navigation/native";
import { Trophy } from "lucide-react-native";

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
const formatTime = (totalSeconds) => {
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

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-300';
      case 2: return 'text-amber-600';
      default: return 'text-zinc-600';
    }
  };
  

  return (
    <LinearGradient colors={["#000000", "#1a1a1a"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`flex-row items-center py-6`}>
            <View style={tw`justify-between gap-30 flex-row items-center`}>
              <Text style={tw`ml-4 font-extrabold text-3xl text-white`}>Leaderboard</Text>
              <Trophy size={30} color="#f97316" style={tw`ml-2`} />
            </View>
          </View>
          
          <View style={tw`mx-2 mb-6`}>
            <View style={tw`flex-row rounded-xl bg-zinc-800/50 p-1`}>
              <TouchableOpacity 
                style={tw`flex-1 py-2 px-4 rounded-lg ${selectedTab === "Tab1" ? 'bg-orange-500' : ''}`}
                onPress={() => setSelectedTab("Tab1")}
              >
                <Text style={tw`text-sm font-semibold text-center ${selectedTab === "Tab1" ? 'text-white' : 'text-zinc-400'}`}>
                  Workout Count
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={tw`flex-1 py-2 px-4 rounded-lg ${selectedTab === "Tab2" ? 'bg-orange-500' : ''}`}
                onPress={() => setSelectedTab("Tab2")}
              >
                <Text style={tw`text-sm font-semibold text-center ${selectedTab === "Tab2" ? 'text-white' : 'text-zinc-400'}`}>
                  Workout Time
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={tw`mx-1 mb-6`}>
            <LinearGradient
              colors={["rgba(249,115,22,0.2)", "rgba(234,88,12,0.05)"]}
              style={tw`rounded-2xl p-5 border border-orange-500/30`}
            >
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`relative`}>
                  <Image
                    source={blackDefaultProfilePic}
                    style={tw`w-14 h-14 rounded-full bg-zinc-800`}
                  />
                  <View style={tw`absolute -bottom-1 -right-1 bg-orange-500 rounded-full w-6 h-6 items-center justify-center`}>
                    <Text style={tw`text-xs font-bold`}>
                      {selectedTab === "Tab1" ? currentUserEntry?.rank || "-" : currentTimeUserEntry?.rank || "-"}
                    </Text>
                  </View>
                </View>
                <View style={tw`ml-4`}>
                  <Text style={tw`font-bold text-lg text-white`}>{username}</Text>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="trophy-outline" size={14} color="#f97316" style={tw`mr-1`} />
                    <Text style={tw`text-sm text-orange-300`}>Your Monthly Rank</Text>
                  </View>
                </View>
              </View>
              
              <View style={tw`flex-row justify-between mt-4`}>
                <View style={tw`bg-black/30 rounded-xl p-3 flex-1 mr-3`}>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Ionicons name="barbell-outline" size={14} color="#f97316" style={tw`mr-2`} />
                    <Text style={tw`text-xs text-zinc-400`}>Total Workouts</Text>
                  </View>
                  <Text style={tw`text-xl font-bold text-white`}>
                    {currentUserEntry?.count || 0}
                  </Text>
                </View>
                <View style={tw`bg-black/30 rounded-xl p-3 flex-1`}>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Ionicons name="time-outline" size={14} color="#f97316" style={tw`mr-2`} />
                    <Text style={tw`text-xs text-zinc-400`}>Total Time</Text>
                  </View>
                  <Text style={tw`text-xl font-bold text-white`}>
                    {currentTimeUserEntry?.formattedTime || "00:00:00"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          
          {/* Tab navigation */}
         
          
          {/* Leaderboard */}
          <View style={tw`mx-2 mb-6`}>
          <LinearGradient 
      colors={["#000", "#1a1a1a"]} 
      style={tw`bg-zinc-800/50 rounded-2xl p-4`}
    >
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`font-bold text-lg text-white`}>Monthly Leaders</Text>
                <View style={tw`bg-orange-500/20 px-2 py-1 rounded-full`}>
                  <Text style={tw`text-orange-500 text-xs font-semibold`}>March 2025</Text>
                </View>
              </View>
              
              {/* Top 3 Winners */}
              {(selectedTab === "Tab1" ? rankedEntries : rankedTimeEntries).length >= 3 ? (
                <View style={tw`flex-row justify-between mb-6`}>
                  {/* 2nd Place */}
                  <View style={tw`items-center w-1/3`}>
                    <View style={tw`relative`}>
                      <Image
                        source={blackDefaultProfilePic}
                        style={tw`w-16 h-16 rounded-full bg-zinc-800 border-2 border-gray-300`}
                      />
                      <View style={tw`absolute -bottom-1 -right-1 bg-gray-300 rounded-full w-6 h-6 items-center justify-center`}>
                        <Text style={tw`text-xs font-bold text-black`}>2</Text>
                      </View>
                    </View>
                    <Text style={tw`text-sm font-semibold mt-2 text-center text-white`} numberOfLines={1}>
                      {selectedTab === "Tab1" 
                        ? rankedEntries[1]?.username 
                        : rankedTimeEntries[1]?.username}
                    </Text>
                    <Text style={tw`text-xs text-zinc-400 mt-1`}>
                      {selectedTab === "Tab1" 
                        ? `${rankedEntries[1]?.count} workouts` 
                        : rankedTimeEntries[1]?.formattedTime}
                    </Text>
                  </View>
                  
                  {/* 1st Place */}
                  <View style={tw`items-center w-1/3`}>
                    <View style={tw`relative`}>
                      <Image
                        source={blackDefaultProfilePic}
                        style={tw`w-20 h-20 rounded-full bg-zinc-800 border-2 border-yellow-400`}
                      />
                      <View style={tw`absolute -bottom-1 -right-1 bg-yellow-400 rounded-full w-7 h-7 items-center justify-center`}>
                        <MaterialCommunityIcons name="crown-outline" size={14} color="black" />
                      </View>
                    </View>
                    <Text style={tw`text-sm font-semibold mt-2 text-center text-white`} numberOfLines={1}>
                      {selectedTab === "Tab1" 
                        ? rankedEntries[0]?.username 
                        : rankedTimeEntries[0]?.username}
                    </Text>
                    <Text style={tw`text-xs text-zinc-400 mt-1`}>
                      {selectedTab === "Tab1" 
                        ? `${rankedEntries[0]?.count} workouts` 
                        : rankedTimeEntries[0]?.formattedTime}
                    </Text>
                  </View>
                  
                  {/* 3rd Place */}
                  <View style={tw`items-center w-1/3`}>
                    <View style={tw`relative`}>
                      <Image
                        source={blackDefaultProfilePic}
                        style={tw`w-16 h-16 rounded-full bg-zinc-800 border-2 border-amber-600`}
                      />
                      <View style={tw`absolute -bottom-1 -right-1 bg-amber-600 rounded-full w-6 h-6 items-center justify-center`}>
                        <Text style={tw`text-xs font-bold text-black`}>3</Text>
                      </View>
                    </View>
                    <Text style={tw`text-sm font-semibold mt-2 text-center text-white`} numberOfLines={1}>
                      {selectedTab === "Tab1" 
                        ? rankedEntries[2]?.username 
                        : rankedTimeEntries[2]?.username}
                    </Text>
                    <Text style={tw`text-xs text-zinc-400 mt-1`}>
                      {selectedTab === "Tab1" 
                        ? `${rankedEntries[2]?.count} workouts` 
                        : rankedTimeEntries[2]?.formattedTime}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={tw`items-center justify-center py-8 mb-4`}>
                  <Ionicons name="trophy-outline" size={40} color="#f97316" style={tw`mb-3 opacity-50`} />
                  <Text style={tw`text-white text-center font-bold`}>
                    Not enough participants yet
                  </Text>
                </View>
              )}
              
              {/* Rest of the leaderboard */}
              <View style={tw`space-y-3`}>
                {(selectedTab === "Tab1" ? rankedEntries : rankedTimeEntries).slice(3).map((entry, index) => (
                  <View key={entry.username} style={tw`flex-row items-center p-3 bg-zinc-800 rounded-xl`}>
                    <View style={tw`w-8 h-8 items-center justify-center`}>
                      <Text style={tw`text-sm font-bold text-zinc-400`}>{index + 4}</Text>
                    </View>
                    <Image
                      source={blackDefaultProfilePic}
                      style={tw`w-8 h-8 rounded-full bg-zinc-800 mr-3`}
                    />
                    <View style={tw`flex-grow`}>
                      <Text style={tw`text-sm font-semibold text-white`}>{entry.username}</Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                      {selectedTab === "Tab1" ? (
                        <View style={tw`flex-row items-center`}>
                          <Ionicons name="barbell-outline" size={14} color="#f97316" style={tw`mr-2`} />
                          <Text style={tw`text-sm font-semibold text-white`}>{entry.count}</Text>
                        </View>
                      ) : (
                        <View style={tw`flex-row items-center`}>
                          <Ionicons name="time-outline" size={14} color="#f97316" style={tw`mr-2`} />
                          <Text style={tw`text-sm font-semibold text-white`}>{entry.formattedTime}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
                
                {(selectedTab === "Tab1" ? rankedEntries : rankedTimeEntries).length === 0 && (
                  <View style={tw`py-6 items-center justify-center`}>
                    <Ionicons 
                      name={selectedTab === "Tab1" ? "fitness-outline" : "stopwatch-outline"} 
                      size={30} 
                      color="#f97316" 
                      style={tw`mb-3 opacity-50`} 
                    />
                    <Text style={tw`text-white text-center font-bold`}>
                      No entries yet
                    </Text>
                    <Text style={tw`text-gray-400 text-center mt-2`}>
                      Complete workouts to appear on the leaderboard
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
          
         
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Leaderboard;