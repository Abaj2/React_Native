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
        workoutCount[workout.username] = (workoutCount[workout.username] || 0) + 1;
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
        if (!timeMap[time.user_id]) {
          timeMap[time.user_id] = {
            username: time.username,
            totalSeconds: 0
          };
        }
        timeMap[time.user_id].totalSeconds += timeStringToSeconds(time.workout_time);
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
      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        <SafeAreaView>
          <View>
            <Text style={tw`text-white font-bold text-3xl mb- mt-8 self-center`}>
              Leaderboards
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity onPress={() => setSelectedTab("Tab1")}>
                  <View
                    style={tw`flex-row gap-2 rounded-2xl p-3 ml-5 mt-5 ${
                      selectedTab === "Tab1"
                        ? "bg-orange-500"
                        : "border border-zinc-800"
                    } justify-center items-center text-center`}
                  >
                    <Ionicons
                      name="calendar-clear-outline"
                      size={24}
                      color="white"
                    />
                    <Text style={tw`font-bold text-white`}>
                      Monthly Workouts
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("Tab2")}>
                  <View
                    style={tw`flex-row gap-2 rounded-2xl p-3 mt-5 ${
                      selectedTab === "Tab2"
                        ? "bg-orange-500"
                        : "border border-zinc-800"
                    } justify-center items-center text-center`}
                  >
                    <Ionicons
                      name="stopwatch-outline"
                      size={24}
                      color="white"
                    />
                    <Text style={tw`font-bold text-white`}>Workout Time</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <LinearGradient
              colors={["rgba(249,115,22,0.4)", "rgba(234,88,12,0.1)"]}
              style={[
                tw`border border-orange-500 self-center mt-8 rounded-3xl`,
                {},
              ]}
            >
              <View
                style={[tw``, { width: width * 0.93, height: height * 0.19 }]}
              >
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw`ml-7 mt-7 font-bold text-orange-400 text-xl`}>
                    Your Ranking
                  </Text>
                  <Ionicons
                    style={tw`mt-7 mr-4`}
                    name="trophy-outline"
                    size={30}
                    color="orange"
                  />
                </View>
                <View style={tw`flex-row`}>
                  <Image
                    source={blackDefaultProfilePic}
                    style={tw`w-18 mt-3 ml-6 h-18 rounded-full border-4 border-orange-500`}
                  />
                  <View style={tw``}>
                    <Text style={tw`font-bold text-white text-xl ml-5 mt-3`}>
                      {username}
                    </Text>
                    <View style={tw`flex-row`}>
                      <Text style={tw`ml-5 mt-3 text-gray-200`}>
                        Rank #{selectedTab === "Tab1" 
                          ? currentUserEntry?.rank || "N/A" 
                          : currentTimeUserEntry?.rank || "N/A"}
                      </Text>
                      <Text style={tw`mt-3 text-gray-200 ml-3`}>
                        {selectedTab === "Tab1"
                          ? `${currentUserEntry?.count || 0} Workouts`
                          : currentTimeUserEntry?.formattedTime || "00:00:00"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-white font-bold text-xl mt-6 ml-5`}>
                Top Rankings
              </Text>
              <View style={tw`flex-row gap-3`}>
                <Ionicons
                  style={tw`mt-7`}
                  name="people-outline"
                  size={22}
                  color="gray"
                />
                <Text style={tw`text-gray-500 mt-8 mr-4`}>
                  {selectedTab === "Tab1" 
                    ? rankedEntries.length 
                    : rankedTimeEntries.length} participants
                </Text>
              </View>
            </View>

            {selectedTab === "Tab1" ? (
              Array.isArray(rankedEntries) && rankedEntries.length > 0 ? (
                rankedEntries.map((entry) => (
                  <LeaderboardCard
                    key={entry.username}
                    username={entry.username}
                    workouts={entry.count}
                    rank={entry.rank}
                  />
                ))
              ) : (
                <Text style={tw`text-white text-xl`}>
                  No leaderboard entries available.
                </Text>
              )
            ) : (
              Array.isArray(rankedTimeEntries) && rankedTimeEntries.length > 0 ? (
                rankedTimeEntries.map((entry) => (
                  <LeaderboardCard
                    key={entry.username}
                    username={entry.username}
                    metric={entry.formattedTime}
                    rank={entry.rank}
                  />
                ))
              ) : (
                <Text style={tw`text-white text-xl`}>
                  No time entries available.
                </Text>
              )
            )}
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
};

export default Leaderboard;