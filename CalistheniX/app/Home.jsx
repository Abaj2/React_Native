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
import Icon from 'react-native-vector-icons/Feather';
import RNPickerSelect from "react-native-picker-select";
import { Dropdown } from "react-native-element-dropdown";
import Skill from "../components/skill.jsx";
import axios from "axios";

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

  const [skill, setSkill] = useState("");
  const [progression, setProgression] = useState("");
  const [current, setCurrent] = useState();
  const [goal, setGoal] = useState();

  const [progressionList, setProgressionList] = useState([]);
  const [currentList, setCurrentList] = useState([]);
  const [goalList, setGoalList] = useState([]);

  const [blurOpacity, setBlurOpacity] = useState(1);

  const SERVER_URL = Platform.select({
    android: "http://10.0.2.2:4003/skills",
    ios: "http://192.168.1.155:4003/skills",
  });
  const SERVER_URL2 = Platform.select({
    android: "http://10.0.2.2:4003/fetchskills",
    ios: "http://192.168.1.155:4003/fetchskills",
  });

  const [skillsData, setSkillsData] = useState([
    {
      skill: "Example skills",
      progressions: ["Example progression 1", "Example progression 2"],
      current: [9, 12],
      goal: [12, 15],
    },
  ]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const storedUserData = await AsyncStorage.getItem("userData");

      if (!token) {
        console.log("No JWT token found");
        navigation.navigate("Sign-in"); // Redirect to sign-in if no token
        return;
      }
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData); // Set the user data from storage
        console.log("Loaded user data from storage:", parsedUserData);
      }

      const response = await axios.get(SERVER_URL2, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSkillsData(response.data.skills);
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
    console.log(userData)
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("jwtToken");
      await AsyncStorage.removeItem("userData"); // Clear user data as well
      navigation.replace("Sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Check if loading or if there's no user data
  if (isLoading) {
    return <Text>Loading...</Text>; // Display loading text or a spinner
  }

  if (!userData) {
    // If user data is not available, display fallback info
    const email = routeEmail || "No email";
    const username = routeUsername || "Unknown";
    const user_id = routeUser_id || "Unknown";
    return (
      <SafeAreaView>
        <View>
          <Text>
            Hello {username}, your email is {email}
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If user data exists
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
          <SafeAreaView>
            <View style={tw`p-5`}>
              {skillsData.map((skillData, index) => (
                <Skill
                  key={index}
                  isDarkMode={isDarkMode}
                  skillData={skillData}
                  loadUserData={loadUserData}
                />
              ))}
            </View>
          </SafeAreaView>
        );
      case "Tab2":
        return (
          <View>

          </View>
        );
      case "Tab3":
        return <Text>This is content for Tab 3</Text>;
      default:
        return <Text>Select a tab</Text>;
    }
  };
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const maxOffset = 100; // Adjust based on how quickly you want the blur to disappear
    const newOpacity = Math.max(0, 1 - offsetY / maxOffset);
    setBlurOpacity(newOpacity);
  };

  return (
    <SafeAreaView style={[tw`flex-1`, {backgroundColor: `${isDarkMode ? 'black' : 'white'}`}]}>
      <ScrollView
        contentContainerStyle={tw`pb-20`}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <StatusBar barStyle={"dark-content"} />
        <View style={[tw`flex-row justify-between`, {backgroundColor: ''}]}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={[tw`text-3xl ${isDarkMode ? 'text-white' : 'text-black'} font-bold m-5`, { fontSize: 28 }]}>
              CalistheniX
            </Text>
          </TouchableOpacity>
          <View style={tw`flex-row`}>
            <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
          <Icon style={tw`mt-5`}name={isDarkMode ? 'sun' : 'moon'}
          size={30}
          color={isDarkMode ? 'orange' : 'lightskyblue'} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon style={tw`m-5`} name="settings" size={32} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          </View>
        </View>
        <View style={tw`flex-row justify-around`}>
          <TouchableOpacity
            style={[
              tw`p-2`,
              selectedTab === "Tab1" && tw`border border-gray-300 rounded-lg`,
            ]}
            onPress={() => setSelectedTab("Tab1")}
          >
            <Text
              style={tw`${
                selectedTab === "Tab1" ? (isDarkMode ? "text-white" : "text-black") : "text-gray-500"
              } font-bold`}
            >
              Skills
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`p-2`,
              selectedTab === "Tab2" && tw`border border-gray-300 rounded-lg`,
            ]}
            onPress={() => setSelectedTab("Tab2")}
          >
            <Text
              style={tw`${
                selectedTab === "Tab2" ? (isDarkMode ? "text-white" : "text-black") : "text-gray-500"
              } font-bold`}
            >
              Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`p-2`,
              selectedTab === "Tab3" && tw`border border-gray-300 rounded-lg`,
            ]}
            onPress={() => setSelectedTab("Tab3")}
          >
            <Text
              style={tw`${
                selectedTab === "Tab3" ? (isDarkMode ? "text-white" : "text-black") : "text-gray-500"
              } font-bold`}
            >
              Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`p-2`,
              selectedTab === "Tab4" && tw`border border-gray-300 rounded-lg`,
            ]}
            onPress={() => setSelectedTab("Tab4")}
          >
            <Text
              style={tw`${
                selectedTab === "Tab4" ? (isDarkMode ? "text-white" : "text-black") : "text-gray-500"
              } font-bold`}
            >
              Community
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw`p-5`}>{renderContent()}</View>
        <View style={[tw`justify-center items-center`, {}]}>
          <Modal transparent={true} visible={modalVisible} animationType="fade">
            <SafeAreaView
              style={tw`flex-1 justify-center items-center bg-black/70`}
            >
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View
                  style={[
                    tw`bg-white rounded-2xl`,
                    { width: 0.8 * width, height: 0.6 * height },
                  ]}
                >
                  <View
                    style={[
                      tw``,
                      { width: width * 0.1, height: height * 0.05 },
                    ]}
                  >
                    <TouchableOpacity onPress={handleModalClose}>
                      <Ionicons
                        name="close-circle-outline"
                        size={40}
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <View style={tw``}>
                      <Text style={tw`self-center font-bold text-2xl`}>
                        Add new skill
                      </Text>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Skill
                      </Text>
                      <TextInput
                        value={skill}
                        onChangeText={(text) => setSkill(text)}
                        placeholder="e.g. front lever"
                        placeholderTextColor={"gray"}
                        style={[
                          tw`text-center self-center border border-[#294241] rounded-lg`,
                          { width: width * 0.72, height: height * 0.04 },
                        ]}
                      ></TextInput>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Progression
                      </Text>
                      <TextInput
                        value={progression}
                        onChangeText={(text) => setProgression(text)}
                        placeholder="e.g. advanced tuck"
                        placeholderTextColor={"gray"}
                        style={[
                          tw`text-center self-center border border-[#294241] rounded-lg`,
                          { width: width * 0.72, height: height * 0.04 },
                        ]}
                      ></TextInput>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Current
                      </Text>
                      <View style={[tw``, { width: width * 0.8 }]}>
                        <Dropdown
                          onChange={(item) => setCurrent(item.value)}
                          data={numbers}
                          labelField="label"
                          valueField="value"
                          placeholder="Select a number (reps/seconds)"
                          placeholderStyle={[
                            tw`text-xl text-center`,
                            {
                              fontSize: 15,
                              color: Platform.OS === "ios" ? "gray" : "757575",
                              fontFamily:
                                Platform.OS === "ios"
                                  ? "SF Pro Text"
                                  : "Roboto",
                            },
                          ]}
                          value={current}
                          style={[
                            tw`self-center border border-[#294241] rounded-lg`,
                            { width: width * 0.72, height: height * 0.04 },
                          ]}
                        />
                      </View>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Goal
                      </Text>
                      <View style={[tw``, { width: width * 0.8 }]}>
                        <Dropdown
                          onChange={(item) => setGoal(item.value)}
                          data={numbers}
                          labelField="label"
                          valueField="value"
                          placeholder="Select a number (reps/seconds)"
                          placeholderStyle={[
                            tw`text-xl text-center`,
                            {
                              fontSize: 15,
                              color: Platform.OS === "ios" ? "gray" : "757575",
                              fontFamily:
                                Platform.OS === "ios"
                                  ? "SF Pro Text"
                                  : "Roboto",
                            },
                          ]}
                          value={goal}
                          style={[
                            tw`self-center border border-[#294241] rounded-lg`,
                            { width: width * 0.72, height: height * 0.04 },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={submitSkill}
                        style={[
                          tw`bg-black self-center justify-center items-center mt-8`,
                          { width: width * 0.72, height: height * 0.045 },
                        ]}
                      >
                        <Text
                          style={[tw`text-white font-bold`, { fontSize: 15 }]}
                        >
                          Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </SafeAreaView>
          </Modal>
        </View>
      </ScrollView>
      <View style={[tw`absolute w-full items-center`]}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            tw`z-10 absolute justify-center items-center rounded-full w-15 h-15 ${isDarkMode ? "bg-orange-400" : "bg-blue-400"}`,
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              top: height * 0.85,
            },
          ]}
        >
          <Ionicons name="add" size={40} color={isDarkMode ? "black" : "white"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;
