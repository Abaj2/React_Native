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
  ActivityIndicator,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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

      if (!token) {
        console.log("No JWT token found");
        navigation.navigate("Sign-in");
        return;
      }

      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
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
      <LinearGradient
        colors={["#000", "#1a1a1a"]}
        style={tw`flex-1 justify-center items-center`}
      >
        <ActivityIndicator size="large" color="gray" />
      </LinearGradient>
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

  const getMostRecentDate = (skill) => {
    // Flatten all dates from all progressions into one array
    const allDates = skill.date.flat();
    // Find the maximum date (most recent)
    return Math.max(...allDates);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "Tab1":
        return (
          <View>
            <ScrollView
              horizontal={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-5`}
            >
              {skillsData.length > 0 ? (
                skillsData
                  // Create a new array with the skill and its creation date (oldest date in the array)
                  .map((skill) => ({
                    ...skill,
                    creationDate: Math.min(
                      ...skill.date.map((progressionDates) =>
                        progressionDates.length > 0
                          ? Math.min(...progressionDates)
                          : Infinity
                      )
                    ),
                  }))
                  // Sort by creation date (oldest first)
                  .sort((a, b) => a.creationDate - b.creationDate)
                  // Render the sorted skills
                  .map((skillData, index) => (
                    <Skill
                      key={skillData.id || index} // Prefer using skillData.id if available
                      isDarkMode={isDarkMode}
                      skillData={skillData}
                      loadUserData={loadUserData}
                      selectedTab={selectedTab}
                      setSelectedTab={setSelectedTab}
                      onSendProgress={handleProgressId}
                    />
                  ))
              ) : (
                <View style={tw`flex-1 items-center justify-center mt-26`}>
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
          </View>
        );
      case "Tab4":
        return (
          <View style={tw``}>
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
      colors={isDarkMode ? ["#000", "#1a1a1a"] : ["#FFFFFF", "#87CEEB"]}
      style={tw`flex-1`}
    >
      {selectedTab === "Tab1" && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            tw`absolute self-center w-15 h-15 rounded-full items-center justify-center`,
            isDarkMode ? tw`bg-orange-500` : tw`bg-sky-500`,
            {
              top: height - 180,
              shadowColor: isDarkMode ? "white" : "skyblue",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 9,
              zIndex: 999,
            },
          ]}
        >
          <Ionicons
            name="add"
            size={30}
            color="white"
            style={{ marginLeft: 1 }}
          />
        </TouchableOpacity>
      )}
      <View
        style={tw`w-full ${
          isDarkMode ? "bg-[#121212]" : "bg-sky-100"
        } h-[30] justify-between flex-row relative`}
      >
        <View style={tw`mt-15 ml-5 h-10 w-30 rounded-2xl items-start`}>
          <TouchableOpacity
            onPress={() => setDropdownOpen(!dropdownOpen)}
            style={[
              tw`flex-row justify-between items-center rounded-full px-5 py-2.5`,
              isDarkMode ? tw`bg-[#1e1e1e]` : tw`bg-sky-200`,
              tw`shadow-sm`,
            ]}
          >
            <Text
              style={[
                tw`text-sm font-semibold mr-2`,
                isDarkMode ? tw`text-white` : tw`text-sky-900`,
              ]}
            >
              {selectedTab === "Tab1" ? "My Skills" : "Progress"}
            </Text>
            <Icon
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={isDarkMode ? "#FFA500" : "#87CEEB"}
            />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row gap-3`}>
          {/* <TouchableOpacity
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={tw`p-2 h-10 mt-15 rounded-full`}
          >
            <Icon
              name={isDarkMode ? "sun" : "moon"}
              size={24}
              color={isDarkMode ? "#f97316" : "#87CEEB"}
            />
          </TouchableOpacity> */}
         {/* <TouchableOpacity
            onPress={() => navigation.navigate("Search-User")}
            style={tw`p-2 h-10 mt-15 rounded-full`}
          >
            <Icon
              name="search"
              size={24}
              color={isDarkMode ? "white" : "#87CEEB"}
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings-Main")}
            style={tw`p-2 mr-3 h-10 mt-15 rounded-full ${
              isDarkMode ? "bg-[#1e1e1e]" : "bg-sky-200"
            }`}
          >
            <Icon
              name="settings"
              size={24}
              color={isDarkMode ? "white" : "#87CEEB"}
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown that extends from the main header */}
        {dropdownOpen && (
          <View
            style={[
              tw`absolute top-[30] left-0 w-full `,
              isDarkMode ? tw`bg-[#121212]` : tw`bg-sky-100`,
              { zIndex: 999 },
            ]}
          >
            <View style={tw`py-2 px-4`}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTab("Tab1");
                  setDropdownOpen(false);
                }}
                style={[
                  tw`px-4 py-3 rounded-lg mb-1`,
                  selectedTab === "Tab1"
                    ? isDarkMode
                      ? tw`bg-black`
                      : tw`bg-sky-200`
                    : isDarkMode
                    ? tw``
                    : tw``,
                ]}
              >
                <Text
                  style={[
                    tw`font-medium`,
                    selectedTab === "Tab1"
                      ? tw`text-white`
                      : isDarkMode
                      ? tw`text-gray-300`
                      : tw`text-sky-900`,
                  ]}
                >
                  Skills
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTab("Tab4");
                  setDropdownOpen(false);
                }}
                style={[
                  tw`px-4 py-3 rounded-lg`,
                  selectedTab === "Tab4"
                    ? isDarkMode
                      ? tw`bg-black`
                      : tw`bg-sky-200`
                    : isDarkMode
                    ? tw``
                    : tw``,
                ]}
              >
                <Text
                  style={[
                    tw`font-medium`,
                    selectedTab === "Tab4"
                      ? tw`text-white`
                      : isDarkMode
                      ? tw`text-gray-300`
                      : tw`text-sky-900`,
                  ]}
                >
                  Progress
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <SafeAreaView style={tw`flex-1`}>
        <ScrollView
          contentContainerStyle={tw`pb-20`}
          showsVerticalScrollIndicator={false}
          style={tw`w-full`}
        >
          <View style={tw`mb-10`}>{renderContent()}</View>

          <Modal transparent visible={modalVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={handleModalClose}>
              <View
                style={tw`flex-1 ${
                  isDarkMode ? "bg-black/95" : "bg-sky-100/95"
                } justify-center items-center p-5`}
              >
                <LinearGradient
                  colors={
                    isDarkMode ? ["#000", "#1a1a1a"] : ["#FFFFFF", "#87CEEB"]
                  }
                  style={tw`w-full max-w-sm p-6 rounded-2xl border ${
                    isDarkMode ? "border-orange-500/40" : "border-sky-500/40"
                  } shadow-lg`}
                >
                  <TouchableOpacity
                    onPress={handleModalClose}
                    style={tw`absolute top-4 right-4 p-2`}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDarkMode ? "#f97316" : "#87CEEB"}
                    />
                  </TouchableOpacity>

                  <Text
                    style={tw`text-center text-2xl font-bold ${
                      isDarkMode ? "text-orange-500" : "text-sky-500"
                    } mb-6`}
                  >
                    Create a Skill
                  </Text>

                  <View style={tw`mb-5`}>
                    <Text
                      style={tw`${
                        isDarkMode ? "text-orange-400" : "text-sky-400"
                      } text-sm font-semibold mb-2`}
                    >
                      Skill Name
                    </Text>
                    <TextInput
                      value={skill}
                      onChangeText={setSkill}
                      placeholder="e.g. Front Lever"
                      
                      placeholderTextColor="#888"
                      style={tw`${
                        isDarkMode
                          ? "bg-zinc-800 text-white"
                          : "bg-sky-200 text-sky-900"
                      } p-4 rounded-xl border ${
                        isDarkMode
                          ? "border-orange-500/50"
                          : "border-sky-500/50"
                      } text-base`}
                      textAlignVertical="center"
                      
                    />
                  </View>

                  <View style={tw`mb-5`}>
                    <Text
                      style={tw`${
                        isDarkMode ? "text-orange-400" : "text-sky-400"
                      } text-sm font-semibold mb-2`}
                    >
                      Progression
                    </Text>
                    <TextInput
                      value={progression}
                      onChangeText={setProgression}
                      placeholder="e.g. Tuck Front Lever"
                      placeholderTextColor="#888"
                      style={tw`${
                        isDarkMode
                          ? "bg-zinc-800 text-white"
                          : "bg-sky-200 text-sky-900"
                      } p-4 rounded-xl border ${
                        isDarkMode
                          ? "border-orange-500/50"
                          : "border-sky-500/50"
                      } text-base`}
                    />
                  </View>

                  <View style={tw`flex-row gap-4 mb-6`}>
                    <View style={tw`flex-1`}>
                      <Text
                        style={tw`${
                          isDarkMode ? "text-orange-400" : "text-sky-400"
                        } text-sm font-semibold mb-2`}
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
                        selectedTextStyle={tw`${
                          isDarkMode ? "text-white" : "text-sky-900"
                        } font-medium`}
                        itemTextStyle={tw`${
                          isDarkMode ? "text-gray-200" : "text-sky-900"
                        }`}
                        style={tw`${
                          isDarkMode
                            ? "bg-zinc-800 text-white"
                            : "bg-sky-200 text-sky-900"
                        } p-4 rounded-xl border ${
                          isDarkMode
                            ? "border-orange-500/50"
                            : "border-sky-500/50"
                        }`}
                        containerStyle={tw`${
                          isDarkMode ? "bg-zinc-800" : "bg-sky-200"
                        } border ${
                          isDarkMode
                            ? "border-orange-500/50"
                            : "border-sky-500/50"
                        } rounded-xl mt-2`}
                        activeColor={isDarkMode ? "#f97316" : "#87CEEB"}
                        itemContainerStyle={tw`py-4`}
                      />
                    </View>

                    <View style={tw`flex-1`}>
                      <Text
                        style={tw`${
                          isDarkMode ? "text-orange-400" : "text-sky-400"
                        } text-sm font-semibold mb-2`}
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
                        selectedTextStyle={tw`${
                          isDarkMode ? "text-white" : "text-sky-900"
                        } font-medium`}
                        itemTextStyle={tw`${
                          isDarkMode ? "text-gray-200" : "text-sky-900"
                        }`}
                        style={tw`${
                          isDarkMode
                            ? "bg-zinc-800 text-white"
                            : "bg-sky-200 text-sky-900"
                        } p-4 rounded-xl border ${
                          isDarkMode
                            ? "border-orange-500/50"
                            : "border-sky-500/50"
                        }`}
                        containerStyle={tw`${
                          isDarkMode ? "bg-zinc-800" : "bg-sky-200"
                        } border ${
                          isDarkMode
                            ? "border-orange-500/50"
                            : "border-sky-500/50"
                        } rounded-xl mt-2`}
                        activeColor={isDarkMode ? "#f97316" : "#87CEEB"}
                        itemContainerStyle={tw`py-4`}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={submitSkill}
                    style={tw`${
                      isDarkMode ? "bg-orange-500" : "bg-sky-500"
                    } py-5 rounded-xl shadow-lg ${
                      isDarkMode ? "shadow-orange-500/50" : "shadow-sky-500/50"
                    }`}
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
              isDarkMode ? tw`bg-orange-500` : tw`bg-sky-500`,
              {
                top: height - 180,
                shadowColor: isDarkMode ? "white" : "skyblue",
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
