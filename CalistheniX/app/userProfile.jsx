import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import HistoryCard from "../components/historyCard";
import blackDefaultProfilePic from "../assets/images/blackDefaultProfilePic.png";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserProfileWorkoutGraph from "../components/userProfileWorkoutGraph";
import Constants from "expo-constants";

const GET_PROFILE_PIC_URL = Platform.select({
  android: "http://10.0.2.2:4005/getprofilepicture",
  ios: "http://192.168.1.155:4005/getprofilepicture",
});

const USER_DETAILS = Platform.select({
  android: "http://10.0.2.2:4005/userdetails",
  ios: "http://192.168.1.155:4005/userdetails",
});

const GET_PROFILE_GRAPH = Platform.select({
  android: "http://10.0.2.2:4005/getprofilegraph",
  ios: "http://192.168.1.155:4005/getprofilegraph",
});

const FETCH_SKILLS = Platform.select({
  android: "http://10.0.2.2:4005/fetchskills",
  ios: "http://192.168.1.155:4005/fetchskills",
});

const UserProfile = ({ navigation, route }) => {
  const { users_id } = route.params; // Profile being viewed
  console.log(users_id);

  const [selectedTab, setSelectedTab] = useState("workouts");
  const [userDetails, setUserDetails] = useState();
  const [followers, setFollowers] = useState();
  const [following, setFollowing] = useState();
  const [userData, setUserData] = useState(); // Current user's data
  const [workoutDates, setWorkoutDates] = useState([]);
  const [workoutTimes, setWorkoutTimes] = useState([]);

  const [profilePicUrl, setProfilePicUrl] = useState();
  const [skills, setSkills] = useState([]);
  const [expandedSkills, setExpandedSkills] = useState({});

  // Toggle skill expansion
  const toggleSkillExpansion = (skillId) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  // Fetch the current logged-in user's data
  const fetchUserData = useCallback(async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        console.log("Current User Data:", parsedUserData);
        return parsedUserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }, []);

  // Fetch the profile of the user being viewed
  const fetchUserDetails = useCallback(async (user_id) => {
    try {
      const response = await axios.get(`${USER_DETAILS}?user_id=${user_id}`);
      if (response.status === 200) {
        setUserDetails(response.data.userDetails);
        setFollowers(response.data.followers);
        setFollowing(response.data.following);
        console.log("Viewed User Details:", response.data.userDetails);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  }, []);

  // Fetch the workout profile graph for the viewed user
  const fetchProfileGraph = useCallback(async (user_id) => {
    if (!user_id) return;

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(
        `${GET_PROFILE_GRAPH}?user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.workoutDates && response.data?.workoutTime) {
        setWorkoutDates(response.data.workoutDates);
        setWorkoutTimes(response.data.workoutTime);


      }
    } catch (error) {
      console.error("Error getting stats:", error);
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        console.error("No token found");
        return;
      }
  
      const response = await axios.get(`${FETCH_SKILLS}?user_id=${users_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        setSkills(response.data.skills);

      }
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  }, [users_id]);

  const getProfilePictureUrl = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(GET_PROFILE_PIC_URL, {
        params: {
          user_id: users_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.profile_pic) {
        console.log(response.data.profile_pic)
        return response.data.profile_pic;
      }

      if (response.status === 404) {
        console.log("No profile picture found");
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  }, [users_id]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchUserData(); // Step 1: Get current user data (not needed for details)
        await fetchUserDetails(users_id); // Step 2: Get the viewed user's profile
        await fetchProfileGraph(users_id); // Step 3: Fetch the workout graph for the viewed user
        await fetchSkills(); // Step 4: Fetch the skills of the viewed user
        
        const profilePic = await getProfilePictureUrl();
        console.log(profilePic)
        setProfilePicUrl(profilePic);
        
      };
  
      fetchData();
    }, [fetchUserData, fetchUserDetails, fetchProfileGraph, fetchSkills, getProfilePictureUrl, users_id])
  );

  return (
    <View style={tw`flex-1 w-full`}>
      <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1 w-full`}>
        <View
          style={tw`flex-row items-center gap-26 px-4 pt-4 pb-2 border-b border-zinc-800`}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={tw`text-white font-bold text-lg`}>User Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={tw`px-4 mb-20 pt-6`}>
            <View style={tw`flex-row items-center`}>
              <Image
                source={{
                  uri:
                    users_id && profilePicUrl
                      ? profilePicUrl
                      : `https://calisthenix.s3.ap-southeast-2.amazonaws.com/profile_pics/blackDefaultProfilePic.png`,
                }}
                style={tw`w-20 h-20 rounded-full border-2 border-orange-500`}
              />
              <View>
                <Text style={tw`ml-4 text-xl text-white font-bold`}>
                  {userDetails ? userDetails[0].name : "Loading name..."}
                </Text>
                <Text style={tw`ml-4 text-base text-gray-400`}>
                  @
                  {userDetails
                    ? userDetails[0].username
                    : "Loading username..."}
                </Text>
              </View>
              <View style={tw`ml-5`}>
                <Text style={tw`text-white font-bold text-2xl`}>
                  {followers ? followers.length : "0"}
                </Text>
                <Text style={tw`text-gray-400`}>
                  {`Follower${followers && followers.length !== 1 ? "s" : ""}`}
                </Text>
              </View>
              <View style={tw`ml-5`}>
                <Text style={tw`font-bold text-white text-2xl`}>
                  {following ? following.length : "0"}
                </Text>
                <Text style={tw`text-gray-400`}>Following</Text>
              </View>
            </View>

            <TouchableOpacity
              style={tw`mt-4 bg-orange-500 rounded-full py-2`}
              onPress={() => {}}
            >
              <Text style={tw`text-center font-semibold text-white`}>
                Follow
              </Text>
            </TouchableOpacity>

            {workoutDates.length > 0 && workoutTimes.length > 0 && (
              <UserProfileWorkoutGraph
                workoutDates={workoutDates}
                workoutTimes={workoutTimes}
              />
            )}

            <Text style={tw`text-white font-bold text-lg mt-6 mb-3`}>
              Skills
            </Text>

            {skills && skills.length > 0 ? (
              skills.map((skill) => (
                <View
                  key={skill.id}
                  style={tw`bg-zinc-900 rounded-xl mb-3 overflow-hidden`}
                >
                  <TouchableOpacity
                    style={tw`px-4 py-3 flex-row justify-between items-center`}
                    onPress={() => toggleSkillExpansion(skill.id)}
                  >
                    <Text style={tw`text-white font-bold text-base`}>
                      {skill.skill}
                    </Text>
                    <View style={tw`flex-row items-center`}>
                      {/* Show the current progression level */}
                      <View style={tw`bg-zinc-800 px-2 py-1 rounded-lg mr-2`}>
                        <Text style={tw`text-orange-500 text-xs font-medium`}>
                          {skill.progressions[skill.current.length - 1]}
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          expandedSkills[skill.id]
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color="#ff8c00"
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedSkills[skill.id] && (
                    <View style={tw`px-4 pb-4`}>
                      {skill.progressions.map(
                        (progression, index) =>
                          skill.current[index] &&
                          skill.goal[index] && (
                            <View
                              key={`${skill.id}-${progression}`}
                              style={tw`mb-2`}
                            >
                              <View style={tw`flex-row justify-between mb-1`}>
                                <Text style={tw`text-gray-400 text-xs`}>
                                  {progression}
                                </Text>
                                <Text style={tw`text-gray-400 text-xs`}>
                                  {
                                    skill.current[index][
                                      skill.current[index].length - 1
                                    ]
                                  }
                                  /
                                  {
                                    skill.goal[index][
                                      skill.goal[index].length - 1
                                    ]
                                  }
                                </Text>
                              </View>
                              <View
                                style={tw`h-2 bg-zinc-800 rounded-full w-full overflow-hidden`}
                              >
                                <LinearGradient
                                  colors={["#ff8c00", "#ff6200"]}
                                  start={[0, 0]}
                                  end={[1, 0]}
                                  style={[
                                    tw`h-full rounded-full`,
                                    {
                                      width: `${Math.min(
                                        (skill.current[index][
                                          skill.current[index].length - 1
                                        ] /
                                          skill.goal[index][
                                            skill.goal[index].length - 1
                                          ]) *
                                          100,
                                        100
                                      )}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                          )
                      )}

                      <View style={tw`flex-row justify-between mt-2`}>
                        <Text style={tw`text-gray-400 text-xs`}>
                          Last updated:{" "}
                          {
                            skill.date_formatted[0][
                              skill.date_formatted[0].length - 1
                            ]
                          }
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={tw`py-4 items-center`}>
                <Text style={tw`text-gray-400`}>No skills added yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default UserProfile;
