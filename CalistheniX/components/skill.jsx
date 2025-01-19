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

const numbers = Array.from({ length: 90 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4005/addprogression",
  ios: "http://192.168.1.137:4005/addprogression",
});
const EDIT_PROGRESSION_URL = Platform.select({
  android: "http://10.0.2.2:4005/editprogression",
  ios: "http://192.168.1.137:4005/editprogression",
});

const Skill = ({ skillData, loadUserData, isDarkMode }) => {
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
    ios: "http://10.0.0.122:4005/deleteskill",
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

  const ProgressCircle = ({ current, goal }) => {
    const size = 64;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - current / goal);

    return (
      <View style={tw`flex-row items-center`}>
        <Text style={[tw`mr-2 ${isDarkMode ? "text-white" : "text-black"}`]}>
          {`${current} / ${goal}`}
        </Text>
        <View style={tw`w-16 h-16 justify-center items-center`}>
          <Svg height={size} width={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDarkMode ? "#27272a" : "#e5e7eb"}
              strokeWidth={strokeWidth}
              fill="none"
            />

            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDarkMode ? "#fb923c" : "#60a5fa"}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <Text
            style={[
              tw`absolute text-sm font-bold`,
              { color: isDarkMode ? "white" : "black" },
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
              tw`mb-4 rounded-xl shadow-md border border-orange-400`,
              {
                backgroundColor: isDarkMode ? "#18181b" : "#f3f4f6",
                width: width * 0.79,
              },
            ]}
          >
            {/* Main Skill Header */}
            <View style={[tw`p-4`, {}]}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text
                      style={[
                        tw`font-bold text-lg`,
                        { color: isDarkMode ? "white" : "black" },
                      ]}
                    >
                      {skillData.skill}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center mt-1`}>
                    <Icon
                      name="award"
                      size={16}
                      color={isDarkMode ? "#fb923c" : "#60a5fa"}
                      style={tw`mr-1`}
                    />
                    <Text style={{ color: isDarkMode ? "#9ca3af" : "#4b5563" }}>
                      5 day streak
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={tw`flex-row`}>
                  <TouchableOpacity
                    style={tw`mr-2 p-2 rounded-lg`}
                    onPress={() => setEditModalVisible(true)}
                  >
                    <Icon
                      name="edit-2"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`mr-2 p-2 rounded-lg`}
                    onPress={() => setProgressionModalVisible(true)}
                  >
                    <Icon
                      name="plus-circle"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`mr-2 p-2 rounded-lg`}
                    onPress={handleSkillDelete}
                  >
                    <Icon
                      name="trash"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Active Progression */}
              {skillData.progressions.map((progression, index) => (
                <View key={index} style={tw`flex-row items-center mt-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={{ color: isDarkMode ? "#9ca3af" : "#4b5563" }}>
                      Current Progression
                    </Text>
                    <Text
                      style={[
                        tw`font-medium mt-1`,
                        { color: isDarkMode ? "white" : "black" },
                      ]}
                    >
                      {progression}
                    </Text>
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

            {/* Expanded Progressions */}
            {expandedSkill === skillData.skill &&
              skillData.progressions.length > 1 && (
                <View
                  style={[
                    tw`border-t`,
                    { borderColor: isDarkMode ? "#27272a" : "#e5e7eb" },
                  ]}
                >
                  {skillData.progressions.slice(1).map((progression, index) => (
                    <View
                      key={index}
                      style={[
                        tw`p-4 flex-row items-center`,
                        index > 0 && tw`border-t`,
                        { borderColor: isDarkMode ? "#27272a" : "#e5e7eb" },
                      ]}
                    >
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            tw`font-medium`,
                            { color: isDarkMode ? "white" : "black" },
                          ]}
                        >
                          {progression}
                        </Text>
                        <Text
                          style={{
                            color: isDarkMode ? "#9ca3af" : "#4b5563",
                          }}
                        >
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

          {/* Add Progression Modal */}
          <Modal
            transparent={true}
            visible={progressionModalVisible}
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
                    <TouchableOpacity onPress={handleProgressionModalClose}>
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
                        {skillData.skill}
                      </Text>
                      <Text style={[tw`ml-5 mt-5 text-xl`, { fontSize: 18 }]}>
                        Progression
                      </Text>
                      <TextInput
                        value={addProgression}
                        onChangeText={(text) => setAddProgression(text)}
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
                          onChange={(item) => setAddCurrent(item.value)}
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
                          value={addCurrent}
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
                          onChange={(item) => setAddGoal(item.value)}
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
                          value={addGoal}
                          style={[
                            tw`self-center border border-[#294241] rounded-lg`,
                            { width: width * 0.72, height: height * 0.04 },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={submitProgression}
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
                    `
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </SafeAreaView>
          </Modal>

          {/* Edit Modal */}
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
