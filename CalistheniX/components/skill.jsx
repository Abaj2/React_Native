import axios from "axios";
import React, { useState, useEffect } from "react";
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
} from "react-native";
import tw from "twrnc";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const numbers = Array.from({ length: 90 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/addprogression",
  ios: "http://192.168.1.155:4005/addprogression",
});
const EDIT_PROGRESSION_URL = Platform.select({
  android: "http://10.0.2.2:4005/editprogression",
  ios: "http://192.168.1.155:4005/editprogression",
});

const Skill = ({ skillData, loadUserData, isDarkMode, colourTheme }) => {
  const [themeColors, setThemeColors] = useState({
    text: "black",
    secondaryText: "#4b5563",
    background: "#f3f4f6",
    border: "#e5e7eb",
    progressTrack: "#e5e7eb",
    progressFill: "#60a5fa",
  });

  const [addProgression, setAddProgression] = useState("");
  const [addCurrent, setAddCurrent] = useState();
  const [addGoal, setAddGoal] = useState();

  const [editProgression, setEditProgression] = useState();
  const [editProgressionName, setEditProgressionName] = useState("");
  const [editCurrent, setEditCurrent] = useState();
  const [editGoal, setEditGoal] = useState();
  const [editIndex, setEditIndex] = useState(null);

  const [progressionModalVisible, setProgressionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [expandedSkill, setExpandedSkill] = useState(null);

  const submitProgression = async () => {
    const skill = skillData.skill.trim();
    const addProgressionTrimmed = addProgression.trim();
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));

    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      console.log("progression trimmed:", addProgressionTrimmed);
      const response = await axios.post(
        SERVER_URL,
        {
          skill,
          addProgressionTrimmed,
          addCurrent,
          addGoal,
          user_id: userData.user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Sent add progression data");
        loadUserData();
      }
    } catch (err) {
      console.error(
        "Error sending add progression data:",
        err.message || err.response
      );
    }
    setProgressionModalVisible(false);
    setAddProgression("");
    setAddCurrent();
    setAddGoal();
    setEditIndex();
  };

  const editSkill = () => {
    setEditModalVisible(true);
  };

  const handleProgressionModalClose = () => {
    setProgressionModalVisible(false);
    setAddProgression("");
    setAddCurrent();
    setAddGoal();
  };
  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setEditProgression("");
    setEditCurrent();
    setEditGoal();
    setEditProgressionName("");
  };

  const openProgressionModal = () => {
    setProgressionModalVisible(true);
  };

  const submitEditProgression = async () => {
    console.log("Edit button clicked");
    try {
      if (!editCurrent) {
        setEditCurrent(
          skillData.current[editIndex][skillData.current[editIndex].length - 1]
        );
      }
      if (!editGoal) {
        setEditGoal(
          skillData.goal[editIndex][skillData.goal[editIndex].length - 1]
        );
      }

      if (
        editCurrent ===
          skillData.current[editIndex][
            skillData.current[editIndex].length - 1
          ] &&
        editGoal ===
          skillData.goal[editIndex][skillData.goal[editIndex].length - 1] &&
        editProgressionName === skillData.progressions[editIndex]
      ) {
        Alert.alert("No changes made to update");
        return;
      }

      const skill = skillData.skill;
      const editProgressionNameTrimmed = editProgressionName.trim();
      const oldCurrent =
        skillData.current[editIndex][skillData.current[editIndex].length - 1];
      const oldGoal =
        skillData.goal[editIndex][skillData.goal[editIndex].length - 1];

      const jwtToken = await AsyncStorage.getItem("jwtToken");
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));

      const response = await axios.post(
        EDIT_PROGRESSION_URL,
        {
          skill,
          editProgression,
          editCurrent,
          oldCurrent,
          editGoal,
          oldGoal,
          editProgressionNameTrimmed,
          editIndex,
          user_id: userData.user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Progression updated successfully");
        Alert.alert("Progression updated successfully");
        setEditModalVisible(false);
        setEditProgression("");
        setEditCurrent();
        setEditGoal();
        setEditProgressionName("");
        loadUserData();
      } else {
        console.error("Unexpected response status:", response.status);
        Alert.alert("Failed to update progression");
      }
    } catch (err) {
      console.error(
        "Error sending edit progression data:",
        err.response?.data || err.message
      );
      Alert.alert("An error occurred while updating progression");
    }
  };

  const formattedSkillData = skillData.progressions.map((item, index) => ({
    label: item,
    value: item,
  }));

  const SKILL_DELETE_URL = Platform.select({
    android: "http://10.0.2.2:4005/deleteskill",
    ios: "http://192.168.1.155:4005/deleteskill",
  });

  const handleSkillDelete = async (item) => {
    const skill = skillData.skill.trim();
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.post(
        SKILL_DELETE_URL,
        {
          skill: skill,
          user_id: userData.user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Deleted skill");
        loadUserData();
      }
    } catch (err) {
      console.error(
        "Error sending complete workout data:",
        err.message || err.response
      );
    }
  };

  const handleEditModalChange = (item) => {
    const index = skillData.progressions.findIndex(
      (progression) => progression === item.value
    );
    setEditIndex(index);
    setEditProgression(item.value);
    setEditProgressionName(item.value);
  };

  useEffect(() => {
    const getThemeColours = (theme) => {
      switch (theme) {
        case "Minimalistic":
          return {
            text: "#000000",
            secondaryText: "#4b5563",
            background: "#f3f4f6",
            border: "#60a5fa",
            progressTrack: "#e5e7eb",
            progressFill: "#60a5fa",
            placeholder: "#9ca3af",
            buttonBackground: "#3b82f6",
            buttonText: "#ffffff",
            inputBorder: "#d1d5db",
          };
        case "Halloween":
          return {
            text: "#ffffff",
            secondaryText: "#ffb347",
            background: "#1A1A1A",
            border: "#FB8C00",
            progressTrack: "#4a4a4a",
            progressFill: "#FB8C00",
            placeholder: "#757575",
            buttonBackground: "#FB8C00",
            buttonText: "#000000",
            inputBorder: "#ffb347",
          };
        case "Nature":
          return {
            text: "green",
            secondaryText: "#4b5320",
            background: "#e8f5e9",
            border: "#66bb6a",
            progressTrack: "#c5e1a5",
            progressFill: "#66bb6a",
            placeholder: "#a5d6a7",
            buttonBackground: "#4caf50",
            buttonText: "#ffffff",
            inputBorder: "#a5d6a7",
          };
        case "Ocean":
          return {
            text: "#0077be",
            secondaryText: "#004c8c",
            background: "#e0f7fa",
            border: "#0288d1",
            progressTrack: "#b3e5fc",
            progressFill: "#0288d1",
            placeholder: "#81d4fa",
            buttonBackground: "#0288d1",
            buttonText: "#ffffff",
            inputBorder: "#81d4fa",
          };
        case "Warm":
          return {
            text: "#5d4037",
            secondaryText: "#3e2723",
            background: "#fbe9e7",
            border: "#8d6e63",
            progressTrack: "#d7ccc8",
            progressFill: "#8d6e63",
            placeholder: "#bcaaa4",
            buttonBackground: "#6d4c41",
            buttonText: "#ffffff",
            inputBorder: "#bcaaa4",
          };
        default:
          return {
            text: "#000000",
            secondaryText: "#4b5563",
            background: "#f3f4f6",
            border: "#60a5fa",
            progressTrack: "#e5e7eb",
            progressFill: "#60a5fa",
            placeholder: "#9ca3af",
            buttonBackground: "#3b82f6",
            buttonText: "#ffffff",
            inputBorder: "#d1d5db",
          };
      }
    };

    const fetchThemeColors = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("colourTheme");
        const colors = getThemeColours(storedTheme);
        setThemeColors(colors);
      } catch (error) {
        console.error("Error fetching theme colors:", error);
      }
    };

    fetchThemeColors();
  }, [colourTheme]);

  const ProgressCircle = ({ current, goal }) => {
    const size = 64;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - current / goal);

    return (
      <View style={tw`flex-row items-center`}>
        <Text style={[tw`mr-2 text-[${themeColors.text}]`, {}]}>
          {`${current} / ${goal}`}
        </Text>
        <View style={tw`w-16 h-16 justify-center items-center`}>
          <Svg height={size} width={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={themeColors.progressTrack}
              strokeWidth={strokeWidth}
              fill="none"
            />

            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={themeColors.progressFill}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <Text
            style={[
              tw`text-[${themeColors.text}] absolute text-sm font-bold`,
              {},
            ]}
          >
            {Math.round((current / goal) * 100)}%
          </Text>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={[tw`flex-1`, {}]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={tw`flex-1 w-full`}>
        <ScrollView
          style={tw`flex-1 w-full`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw` items-center w-full px-2`, {}]}
        >
          <View
            style={[
              tw`mb-4 bg-[${themeColors.background}] rounded-xl shadow-md border-2 border-[${themeColors.border}]`,
              {
                width: width * 0.88,
              },
            ]}
          >
            <View style={[tw`p-4`, {}]}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text
                      style={[tw`font-bold text-lg text-[${themeColors.text}]`]}
                    >
                      {skillData.skill}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center mt-1`}>
                    <Icon
                      name="award"
                      size={16}
                      color={themeColors.border}
                      style={tw`mr-1`}
                    />
                    <Text style={tw`text-[${themeColors.secondaryText}]`}>
                      5 day streak
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row`}>
                  <TouchableOpacity
                    style={tw`mr-2 p-2 rounded-lg`}
                    onPress={() => setEditModalVisible(true)}
                  >
                    <Icon name="edit-2" size={20} color={themeColors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`mr-2 p-2 rounded-lg`}
                    onPress={() => setProgressionModalVisible(true)}
                  >
                    <Icon
                      name="plus-circle"
                      size={20}
                      color={themeColors.text}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`mr-2 p-2 rounded-lg`}
                    onPress={handleSkillDelete}
                  >
                    <Icon name="trash" size={20} color={themeColors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {skillData.progressions.map((progression, index) => (
                <View key={index} style={tw`flex-row items-center mt-4`}>
                  <View style={tw`flex-1`}>
                    {/*<Text style={tw`mt-1 text-white`}>
                      {skillData.date_formatted[index][0].slice(0, -6)}
                    </Text>*/}
                    <Text style={tw`text-[${themeColors.secondaryText}]`}>
                      Current Progression
                    </Text>
                    <View style={tw`flex-column`}>
                      <Text
                        style={[
                          tw`font-medium mt-1 text-[${themeColors.text}]`,
                          {},
                        ]}
                      >
                        {progression}
                      </Text>
                    </View>
                  </View>
                  <ProgressCircle
                    current={
                      skillData.current[index][
                        skillData.current[index].length - 1
                      ]
                    }
                    goal={
                      skillData.goal[index][skillData.goal[index].length - 1]
                    }
                  />
                </View>
              ))}
            </View>

            {expandedSkill === skillData.skill &&
              skillData.progressions.length > 1 && (
                <View style={[tw`border-[${themeColors.border}] border-t`, {}]}>
                  {skillData.progressions.slice(1).map((progression, index) => (
                    <View
                      key={index}
                      style={[
                        tw`pflex-row items-center`,
                        index > 0 &&
                          tw`border-t border-[${themeColors.border}]`,
                        {},
                      ]}
                    >
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            tw`text-[${themeColors.text}] font-medium`,
                            {},
                          ]}
                        >
                          {progression}
                        </Text>
                        <Text style={tw`text-[${themeColors.secondaryText}]`}>
                          {
                            skillData.current[index][
                              skillData.current[index].length - 1
                            ]
                          }
                          /
                          {
                            skillData.goal[index][
                              skillData.current[index].length - 1
                            ]
                          }
                        </Text>
                      </View>
                      <ProgressCircle
                        current={
                          skillData.current[index][
                            skillData.current[index].length - 1
                          ]
                        }
                        goal={
                          skillData.goal[index][
                            skillData.current[index].length - 1
                          ]
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
          </View>
          <Modal
            transparent={true}
            visible={progressionModalVisible}
            animationType="fade"
          >
            <SafeAreaView
              style={tw`flex-1 justify-center items-center bg-black/60`}
            >
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View
                  style={[
                    tw`border border-[${themeColors.border}] bg-[${themeColors.background}] rounded-2xl`,
                    { width: 0.8 * width, height: 0.5 * height },
                  ]}
                >
                  <View
                    style={[
                      tw`bg-[${themeColors.background}]`,
                      { width: width * 0.15, height: height * 0.07 },
                    ]}
                  >
                    <TouchableOpacity onPress={handleProgressionModalClose}>
                      <Ionicons
                        style={tw`m-2`}
                        name="close-circle-outline"
                        size={40}
                        color={themeColors.border}
                      />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <View style={tw``}>
                      <Text
                        style={tw`text-[${themeColors.text}] self-center font-bold text-2xl`}
                      >
                        {skillData.skill}
                      </Text>
                      <Text style={[tw`ml-5 mt-5 text-xl`, { fontSize: 18 }]}>
                        Progression
                      </Text>
                      <TextInput
                        value={addProgression}
                        onChangeText={(text) => setAddProgression(text)}
                        placeholder="e.g. advanced tuck"
                        placeholderTextColor={`${themeColors.placeholder}`}
                        style={[
                          tw`self-center text-center border border-[${themeColors.inputBorder}] rounded-lg`,
                          { width: width * 0.72, height: height * 0.04 },
                        ]}
                      ></TextInput>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Current
                      </Text>
                      <View style={[tw``, { width: width * 0.8 }]}>
                        <Dropdown
                          onChange={(item) => setAddCurrent(item.value)}
                          data={numbers}
                          labelField="label"
                          valueField="value"
                          placeholder="Select a number (reps/seconds)"
                          placeholderStyle={[
                            tw`text-xl text-center`,
                            {
                              fontSize: 15,
                              color: themeColors.placeholder,
                              fontFamily:
                                Platform.OS === "ios"
                                  ? "SF Pro Text"
                                  : "Roboto",
                            },
                          ]}
                          value={addCurrent}
                          style={[
                            tw`self-center border border-[${themeColors.inputBorder}] rounded-lg`,
                            { width: width * 0.72, height: height * 0.04 },
                          ]}
                        />
                      </View>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Goal
                      </Text>
                      <View style={[tw``, { width: width * 0.8 }]}>
                        <Dropdown
                          onChange={(item) => setAddGoal(item.value)}
                          data={numbers}
                          labelField="label"
                          valueField="value"
                          placeholder="Select a number (reps/seconds)"
                          placeholderStyle={[
                            tw`text-xl text-center`,
                            {
                              fontSize: 15,
                              color: themeColors.placeholder,
                              fontFamily:
                                Platform.OS === "ios"
                                  ? "SF Pro Text"
                                  : "Roboto",
                            },
                          ]}
                          value={addGoal}
                          style={[
                            tw`self-center border border-[${themeColors.inputBorder}] rounded-lg`,
                            { width: width * 0.72, height: height * 0.04 },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={submitProgression}
                        style={[
                          tw`bg-[${themeColors.buttonBackground}] rounded-lg self-center justify-center items-center mt-8`,
                          { width: width * 0.72, height: height * 0.045 },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-[${themeColors.buttonText}] font-bold`,
                            { fontSize: 15 },
                          ]}
                        >
                          Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                    `
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </SafeAreaView>
          </Modal>

      
          <Modal
            transparent={true}
            visible={editModalVisible}
            animationType="fade"
          >
            <SafeAreaView
              style={tw`flex-1 justify-center items-center bg-black/70`}
            >
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View
                  style={[
                    tw`bg-white rounded-2xl`,
                    { width: 0.8 * width, height: 0.5 * height },
                  ]}
                >
                  <View
                    style={[
                      tw``,
                      { width: width * 0.1, height: height * 0.05 },
                    ]}
                  >
                    <TouchableOpacity onPress={handleEditModalClose}>
                      <Ionicons
                        name="close-circle-outline"
                        size={40}
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <View style={tw`text-center`}>
                      <Dropdown
                        style={[tw`self-center`, { width: width * 0.5 }]}
                        onChange={handleEditModalChange}
                        data={formattedSkillData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Progression"
                        selectedTextStyle={[tw`text-xl text-center`, {}]}
                        placeholderStyle={tw`text-xl text-center`}
                        value={editProgression}
                        renderRightIcon={() => (
                          <MaterialIcons
                            name="arrow-drop-down"
                            size={30}
                            color="black"
                          />
                        )}
                      />
                      <Text style={[tw`ml-5 mt-5 text-xl`, { fontSize: 18 }]}>
                        Name
                      </Text>
                      <TextInput
                        value={editProgressionName}
                        onChangeText={(text) => setEditProgressionName(text)}
                        placeholder="e.g. advanced tuck"
                        placeholderTextColor={"gray"}
                        style={[
                          tw`self-center text-center border border-[#294241] rounded-lg`,
                          { width: width * 0.72, height: height * 0.04 },
                        ]}
                      ></TextInput>
                      <Text style={[tw`mt-5 ml-5 text-xl`, { fontSize: 18 }]}>
                        Current
                      </Text>
                      <View style={[tw``, { width: width * 0.8 }]}>
                        <Dropdown
                          onChange={(item) => setEditCurrent(item.value)}
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
                          value={
                            editIndex !== null &&
                            skillData.current[editIndex] &&
                            skillData.current[editIndex].length > 0
                              ? skillData.current[editIndex][
                                  skillData.current[editIndex].length - 1
                                ]
                              : "N/A"
                          }
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
                          onChange={(item) => setEditGoal(item.value)}
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
                          value={
                            editIndex !== null &&
                            skillData.goal[editIndex] &&
                            skillData.goal[editIndex].length > 0
                              ? skillData.goal[editIndex][
                                  skillData.goal[editIndex].length - 1
                                ]
                              : "N/A"
                          }
                          style={[
                            tw`self-center border border-[#294241] rounded-lg`,
                            { width: width * 0.72, height: height * 0.04 },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={submitEditProgression}
                        style={[
                          tw`bg-black self-center justify-center items-center mt-8`,
                          { width: width * 0.72, height: height * 0.045 },
                        ]}
                      >
                        <Text
                          style={[tw`text-white font-bold`, { fontSize: 15 }]}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </SafeAreaView>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
export default Skill;
