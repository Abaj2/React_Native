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
import Skill from "../components/skill.jsx";
import Workouts from "../components/workouts.jsx";
import { LinearGradient } from "expo-linear-gradient";

import HistoryCard from "../components/historyCard.jsx";

import axios from "axios";
import Progress from "../components/progress.jsx";

const { width, height } = Dimensions.get("window");

const Home = () => {
  const route = useRoute();
  const {
    email: routeEmail,
    username: routeUsername,
    user_id: routeUser_id,
  } = route.params || {};

  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Tab1");

  const [progressId, setProgressId] = useState(null);

  const handleProgressId = (id) => {
    setProgressId(id);
    console.log("Received progressId from Skill:", id);
    setSelectedTab("Tab4");
  };

  const [skill, setSkill] = useState("");
  const [progression, setProgression] = useState("");
  const [current, setCurrent] = useState();
  const [goal, setGoal] = useState();

  const [progressionList, setProgressionList] = useState([]);
  const [currentList, setCurrentList] = useState([]);
  const [goalList, setGoalList] = useState([]);

  const [blurOpacity, setBlurOpacity] = useState(1);

  const SERVER_URL = Platform.select({
    android: "http://10.0.2.2:4005/skills",
    ios: "http://192.168.1.155:4005/skills",
  });
  const SERVER_URL2 = Platform.select({
    android: "http://10.0.2.2:4005/fetchskills",
    ios: "http://192.168.1.155:4005/fetchskills",
  });

  const [skillsData, setSkillsData] = useState([]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const storedUserData = await AsyncStorage.getItem("userData");

      const colourThemeAsyncStorage = await AsyncStorage.getItem("colourTheme");
      const colourTheme = colourThemeAsyncStorage || "Minimalistic";

      console.log("Retrieved token:", token);
      console.log("Retrieved storedUserData:", storedUserData);
      console.log("Retrieved colourTheme:", colourThemeAsyncStorage);

      if (!token) {
        console.log("No JWT token found");
        navigation.navigate("Sign-in");
        return;
      }

      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          console.log(parsedUserData);
        } catch (error) {
          console.error("Error parsing userData:", error);
        }
      }

      const response = await axios.get(SERVER_URL2, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setSkillsData(response.data.skills || []); // Default to empty array for new users
      } else {
        console.log("Failed to fetch user data from server");
      }
    } catch (error) {
      console.error("Error retrieving data from AsyncStorage:", error);
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data.error === "Token expired")
      ) {
        console.log("Token expired, logging out");

        await AsyncStorage.multiRemove(["jwtToken", "userData"]);
        navigation.replace("Sign-in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const submitSkill = async () => {
    if (!skill || !progression || !current || !goal) {
      Alert.alert("Enter all fields");
      return;
    }
    /* const newSkill = {
      skill: skill,
      progressions: [progression],
      current: [current],
      goal: [goal],
    }; */

    try {
      const response = await axios.post(
        SERVER_URL,
        {
          skill,
          progression,
          current,
          goal,
          user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Successfully inserted skills");
        loadUserData();
        setSkill("");
        setProgression("");
        setCurrent(0);
        setGoal(0);
        setModalVisible(false);
      }
    } catch (err) {
      if (err.response) {
        handleError(err.response.status);
      }
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSkill("");
    setProgression("");
    setCurrent("");
    setGoal("");
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1`}>
        <LinearGradient
          colors={isDarkMode ? ["#000", "#1a1a1a"] : ["#f9f9f9", "#e3e3e3"]}
          style={tw`flex-1`}
        ></LinearGradient>
      </View>
    );
  }

  if (!userData) {
    const email = routeEmail || "No email";
    const username = routeUsername || "Unknown";
    const user_id = routeUser_id || "Unknown";
    return (
      <SafeAreaView>
        <View>
          <Text>
            Hello {username}, your email is {email}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const email = userData?.email || routeEmail || "No email";
  const username = userData?.username || routeUsername || "Unknown";
  const user_id = userData?.user_id || "unknown";

  const numbers = Array.from({ length: 90 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }));

  const renderContent = () => {
    switch (selectedTab) {
      case "Tab1":
        return (
          <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-5`}
          >
            {skillsData.length > 0 ? (
              skillsData.map((skillData, index) => (
                <Skill
                  key={index}
                  isDarkMode={isDarkMode}
                  skillData={skillData}
                  loadUserData={loadUserData}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  onSendProgress={handleProgressId}
                />
              ))
            ) : (
              <View style={tw`flex-1 items-center justify-center mt-20`}>
                <Icon
                  name="package"
                  size={60}
                  color="#ffa500"
                  style={tw`opacity-50 mb-4`}
                />
                <Text style={tw`text-orange-500 text-xl font-bold mb-2`}>
                  No Skills Data Yet
                </Text>
                <Text style={tw`text-zinc-500 text-center px-10`}>
                  Start tracking your skills to see progress graphs and
                  analytics.
                </Text>
              </View>
            )}
          </ScrollView>
        );
      case "Tab4":
        return (
          <View style={tw`px-5`}>
            <Progress
              isDarkMode={isDarkMode}
              userData={userData}
              skillsData={skillsData}
              progressId={progressId}
            />
          </View>
        );
      default:
        return <Text>Select a tab</Text>;
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const maxOffset = 100;
    const newOpacity = Math.max(0, 1 - offsetY / maxOffset);
    setBlurOpacity(newOpacity);
  };
  const styles = {
    gradientBackground: {
      flex: 1,
      backgroundColor: "linear-gradient(to bottom, black, orange)",
    },
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#000", "#1a1a1a"] : ["#f9f9f9", "#e3e3e3"]}
      style={tw`flex-1`}
    >
      <SafeAreaView style={tw`flex-1`}>
        <ScrollView
          contentContainerStyle={tw`pb-20`}
          showsVerticalScrollIndicator={false}
          style={tw`w-full`}
        >
          <View style={tw`flex-row justify-between items-center px-5 pt-4`}>
            <View>
              <Text
                style={[
                  tw`text-3xl font-extrabold`,
                  isDarkMode ? tw`text-white` : tw`text-black`,
                  { fontFamily: "Inter_900Black" },
                ]}
              >
                CalistheniX
              </Text>
              <Text
                style={[
                  tw`text-sm -mt-1`,
                  isDarkMode ? tw`text-orange-400/80` : tw`text-blue-500/80`,
                ]}
              >
                {username}'s Training Hub
              </Text>
            </View>

            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={() => setIsDarkMode(!isDarkMode)}
                style={tw`p-2 rounded-full ${
                  isDarkMode ? "bg-orange-400/10" : "bg-blue-500/10"
                }`}
              >
                <Icon
                  name={isDarkMode ? "sun" : "moon"}
                  size={24}
                  color={isDarkMode ? "#f97316" : "lightskyblue"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Search-User")}
                style={tw`p-2 rounded-full ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <Icon
                  name="search"
                  size={24}
                  color={isDarkMode ? "white" : "black"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Settings-Main")}
                style={tw`p-2 rounded-full ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <Icon
                  name="settings"
                  size={24}
                  color={isDarkMode ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={tw`mx-2 mt-6 bg-transparent`}>
            <View
              style={tw`flex-row justify-between bg-transparent rounded-xl p-1 ${
                isDarkMode ? "bg-gray-800/30" : "bg-gray-200/50"
              }`}
            >
              {["Tab1", "Tab4"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={[
                    tw`flex-1 items-center py-3 rounded-lg`,
                    selectedTab === tab &&
                      (isDarkMode ? tw`bg-orange-500` : tw`bg-blue-500`),
                  ]}
                >
                  <Text
                    style={[
                      tw`font-semibold`,
                      selectedTab === tab
                        ? tw`text-white`
                        : isDarkMode
                        ? tw`text-gray-400`
                        : tw`text-gray-600`,
                    ]}
                  >
                    {tab === "Tab1" ? "My Skills" : "Progress"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={tw`mb-24`}>{renderContent()}</View>

          <Modal transparent visible={modalVisible} animationType="fade">
            {/* Click outside to close */}
            <TouchableWithoutFeedback onPress={handleModalClose}>
              <View
                style={tw`flex-1 bg-black/95 justify-center items-center p-5`}
              >
                {/* Modal Container with Linear Gradient */}
                <LinearGradient
                  colors={["#000", "#1a1a1a"]}
                  style={tw`w-full max-w-sm p-6 rounded-2xl border border-orange-500/40 shadow-lg`}
                >
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={handleModalClose}
                    style={tw`absolute top-4 right-4 p-2`}
                  >
                    <Ionicons name="close" size={24} color="#f97316" />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text
                    style={tw`text-center text-2xl font-bold text-orange-500 mb-6`}
                  >
                    Create a Skill
                  </Text>

                  {/* Skill Name */}
                  <View style={tw`mb-5`}>
                    <Text
                      style={tw`text-orange-400 text-sm font-semibold mb-2`}
                    >
                      Skill Name
                    </Text>
                    <TextInput
                      value={skill}
                      onChangeText={setSkill}
                      placeholder="e.g. Front Lever"
                      placeholderTextColor="#888"
                      style={tw`bg-zinc-800 text-white p-4 rounded-xl border border-orange-500/50 text-base`}
                    />
                  </View>

                  {/* Progression Name */}
                  <View style={tw`mb-5`}>
                    <Text
                      style={tw`text-orange-400 text-sm font-semibold mb-2`}
                    >
                      Progression
                    </Text>
                    <TextInput
                      value={progression}
                      onChangeText={setProgression}
                      placeholder="e.g. Tuck Front Lever"
                      placeholderTextColor="#888"
                      style={tw`bg-zinc-800 text-white p-4 rounded-xl border border-orange-500/50 text-base`}
                    />
                  </View>

                  {/* Current & Goal - Now with Consistent Style */}
                  <View style={tw`flex-row gap-4 mb-6`}>
                    <View style={tw`flex-1`}>
                      <Text
                        style={tw`text-orange-400 text-sm font-semibold mb-2`}
                      >
                        Current
                      </Text>
                      <Dropdown
                        data={numbers}
                        labelField="label"
                        valueField="value"
                        placeholder="Select"
                        value={current}
                        onChange={(item) => setCurrent(item.value)}
                        placeholderStyle={tw`text-gray-500`}
                        selectedTextStyle={tw`text-white font-medium`}
                        itemTextStyle={tw`text-gray-200`}
                        style={tw`bg-zinc-800 text-white p-4 rounded-xl border border-orange-500/50`}
                        containerStyle={tw`bg-zinc-800 border border-orange-500/50 rounded-xl mt-2`}
                        activeColor="#f97316"
                        itemContainerStyle={tw`py-4`}
                      />
                    </View>

                    <View style={tw`flex-1`}>
                      <Text
                        style={tw`text-orange-400 text-sm font-semibold mb-2`}
                      >
                        Goal
                      </Text>
                      <Dropdown
                        data={numbers}
                        labelField="label"
                        valueField="value"
                        placeholder="Select"
                        value={goal}
                        onChange={(item) => setGoal(item.value)}
                        placeholderStyle={tw`text-gray-500`}
                        selectedTextStyle={tw`text-white font-medium`}
                        itemTextStyle={tw`text-gray-200`}
                        style={tw`bg-zinc-800 text-white p-4 rounded-xl border border-orange-500/50`}
                        containerStyle={tw`bg-zinc-800 border border-orange-500/50 rounded-xl mt-2`}
                        activeColor="#f97316"
                        itemContainerStyle={tw`py-4`}
                      />
                    </View>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={submitSkill}
                    style={tw`bg-orange-500 py-5 rounded-xl shadow-lg shadow-orange-500/50`}
                  >
                    <Text
                      style={tw`text-center font-bold text-white uppercase tracking-wide`}
                    >
                      Create Skill
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>

        {selectedTab === "Tab1" && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[
              tw`absolute self-center w-14 h-14 rounded-full items-center justify-center`,
              isDarkMode ? tw`bg-orange-500` : tw`bg-blue-500`,
              {
                top: height - 180,
                shadowColor: "white",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              },
            ]}
          >
            <Ionicons
              name="add"
              size={28}
              color="white"
              style={{ marginLeft: 1 }}
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Home;
