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
import Svg, { Circle, Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  background: "#1A1A1A",
  primary: "#F57C00",
  text: "#FFFFFF",
  secondaryText: "#A0A0A0",
  border: "#333333",
  inputBackground: "#222222",
  progressFill: "#F57C00",
  progressTrack: "#333333",
};

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

const Skill = ({
  skillData,
  loadUserData,
  isDarkMode,
  colourTheme,
  selectedTab,
  setSelectedTab,
  onSendProgress,
}) => {
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

  const [selectedProgressionIndex, setSelectedProgressionIndex] = useState(0);

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

    if (index !== -1) {
      setEditCurrent(
        skillData.current[index][skillData.current[index].length - 1]
      );
      setEditGoal(skillData.goal[index][skillData.goal[index].length - 1]);
    }
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
    const progress = Math.min((current / goal) * 100, 100);

    return (
      <View style={tw`w-[90%] self-center mb-6`}>
        <View style={tw`h-4 bg-zinc-800 rounded-full overflow-hidden mb-2`}>
          <LinearGradient
            colors={["#ff6b00", "#ffa500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[tw`h-full rounded-full`, { width: `${progress}%` }]}
          >
            <View
              style={[
                tw`h-full w-full rounded-full`,
                {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                },
              ]}
            />
          </LinearGradient>
        </View>

        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-orange-400 text-sm font-semibold`}>
            PROGRESS
          </Text>
          <Text style={tw`text-white font-bold`}>
            {current} / {goal}
          </Text>
        </View>
      </View>
    );
  };

  const sendProgress = () => {
    console.log("skilldata:", skillData);

    if (skillData.current.every((subArray) => subArray.length < 2)) {
      Alert.alert("Make some progress first!");
      return;
    }

    const progressId = skillData.id;

    onSendProgress(progressId);
  };

  return (
    <SafeAreaView style={tw`flex-1 rounded-3xl`}>
      <StatusBar barStyle="light-content" />
      {/*<ScrollView
        contentContainerStyle={tw`pb-5`}
        showsVerticalScrollIndicator={false}
      >*/}
      <View
        style={[
          tw`rounded-3xl mt-6 mx-2 self-center`,
          { width: width * 0.94 },
        ]}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]}
          style={tw`rounded-3xl border border-zinc-700`}
        >
          <View style={tw`p-4 rounded-3xl`}>
            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw}>
                <Text style={tw`mt-1 text-sm font-bold text-orange-400`}>
                  SKILL
                </Text>
                <Text style={tw`text-2xl mt-1 font-bold text-white`}>
                  {skillData.skill}
                </Text>
              </View>
              <View style={tw`flex-row gap-4`}>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(true)}
                  style={tw`p-2 bg-orange-500/10 rounded-full`}
                >
                  <MaterialIcons name="edit" size={22} color="#f97316" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSkillDelete}
                  style={tw`p-2 bg-red-500/10 rounded-full`}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={tw`border-b border-zinc-800 mb-4`} />
          <ProgressCircle
            current={
              skillData.current[selectedProgressionIndex]?.slice(-1)[0] || 0
            }
            goal={skillData.goal[selectedProgressionIndex]?.slice(-1)[0] || 1}
          />
          <View>
            <Text style={tw`text-orange-400 font-semibold text-sm ml-5`}>
              SELECT PROGRESSION
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-4l mt-2`}
          >
            {skillData.progressions.map((progression, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedProgressionIndex(index)}
                style={tw`mr-3 mb-2`}
              >
                <LinearGradient
                  colors={
                    index === selectedProgressionIndex
                      ? ["#f97316", "#d1580f"]
                      : ["#27272a", "#27272a"]
                  }
                  style={[
                    tw`px-5 py-2.5 rounded-full border`,
                    {
                      borderColor:
                        index === selectedProgressionIndex
                          ? "#ea580c"
                          : "#4b4b4b",
                      shadowColor:
                        index === selectedProgressionIndex
                          ? "#f97316"
                          : "transparent",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 4,
                    },
                  ]}
                >
                  <Text style={tw`text-white font-semibold tracking-wide`}>
                    {progression}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={openProgressionModal}
              style={tw`h-[42px] w-[42px] items-center justify-center rounded-full bg-zinc-800 border-2 border border-orange-500/50 mr-2`}
            >
              <Ionicons name="add" size={24} color="#f97316" />
            </TouchableOpacity>
          </ScrollView>

          <View style={tw`p-5`}>
            <View style={tw`flex-row gap-4 mb-4`}>
              <LinearGradient
                colors={["#18181b", "#18181b"]}
                style={tw`flex-1 p-4 rounded-xl border-l-4 border-orange-500`}
              >
                <View style={tw`flex-row items-center gap-2 mb-1`}>
                 {/* <Ionicons name="arrow-up" size={16} color="#f97316" /> */}
                  <Text style={tw`text-gray-400 text-sm font-medium`}>
                    Current (sec/rep)
                  </Text>
                </View>
                <View style={tw`flex-row items-center gap-2`}>
                <Text style={tw`text-2xl font-bold text-orange-400`}>
                  {skillData.current[selectedProgressionIndex]?.slice(-1)[0] ||
                    0}
                </Text>
                
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["#18181b", "#18181b"]}
                style={tw`flex-1 p-4 rounded-xl border-r-4 border-orange-500`}
              >
                <View style={tw`flex-row items-center gap-2 mb-1`}>
                {/*  <Ionicons name="flag" size={16} color="#f97316" /> */}
                  <Text style={tw`text-gray-400 text-sm font-medium`}>
                    Goal (sec/rep)
                  </Text>
                </View>
                <Text style={tw`text-2xl font-bold text-orange-400`}>
                  {skillData.goal[selectedProgressionIndex]?.slice(-1)[0] || 0}
                </Text>
              </LinearGradient>
            </View>
          </View>
          <LinearGradient colors={["#f97316", "#d1580f"]} style={tw`w-[80] self-center mb-4 rounded-3xl p-4 `}>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <Text
              style={[
                tw`text-white text-center font-extrabold`,
                { fontSize: 15 },
              ]}
            >
              UPDATE PROGRESSION
            </Text>
            </TouchableOpacity>
          </LinearGradient>
        </LinearGradient>
      </View>

      <Modal transparent visible={progressionModalVisible} animationType="fade">
        <View style={tw`flex-1 bg-black/95 justify-center items-center p-5`}>
          <LinearGradient
            colors={["#000", "#1a1a1a"]}
            style={[
              tw`rounded-3xl w-full max-w-md p-6`,
              { borderWidth: 1, borderColor: "#f97316/30" },
            ]}
          >
            <View
              style={tw`flex-row justify-between items-center border-b border-orange-500/30 pb-4 mb-4`}
            >
              <Text style={tw`text-xl font-bold text-orange-500`}>
                New Progression
              </Text>
              <TouchableOpacity
                onPress={handleProgressionModalClose}
                style={tw`p-1.5 bg-orange-500/10 rounded-full`}
              >
                <Ionicons name="close" size={22} color="#f97316" />
              </TouchableOpacity>
            </View>

            <View style={tw`mb-6`}>
              <Text
                style={tw`text-orange-400/80 text-sm font-medium font-bold mb-2`}
              >
                Progression Name
              </Text>
              <TextInput
                value={addProgression}
                onChangeText={setAddProgression}
                style={tw`bg-zinc-800 text-white p-4 rounded-xl border border-orange-500/50 font-medium`}
                placeholderTextColor="#6b6b6b"
                placeholder="e.g. Advanced Tuck"
              />
            </View>

            <View style={tw`flex-row gap-4 mb-6`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-orange-400/80 font-bold text-sm mb-2`}>
                  Current
                </Text>
                <Dropdown
                  data={numbers}
                  labelField="label"
                  valueField="value"
                  placeholder="Select current"
                  value={addCurrent}
                  onChange={(item) => setAddCurrent(item.value)}
                  placeholderStyle={tw`text-gray-500`}
                  selectedTextStyle={tw`text-white font-medium`}
                  itemTextStyle={tw`text-gray-300`}
                  style={[
                    tw`bg-zinc-800 text-white rounded-xl border p-2 border-orange-500/50`,
                    { height: 50, paddingVertical: 10 },
                  ]}
                  containerStyle={tw`bg-zinc-800 rounded-xl border border-orange-500/50 mt-2`}
                  activeColor="#f97316"
                  itemContainerStyle={tw`py-3`}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              <View style={tw`flex-1`}>
                <Text style={tw`text-orange-400/80 text-sm font-bold mb-2`}>
                  Goal
                </Text>
                <Dropdown
                  data={numbers}
                  labelField="label"
                  valueField="value"
                  placeholder="Select goal"
                  value={addGoal}
                  onChange={(item) => setAddGoal(item.value)}
                  placeholderStyle={tw`text-gray-500`}
                  selectedTextStyle={tw`text-white font-medium`}
                  itemTextStyle={tw`text-gray-300`}
                  style={[
                    tw`bg-zinc-800 text-white rounded-xl p-2 border border-orange-500/50`,
                    { height: 50, paddingVertical: 10 },
                  ]}
                  containerStyle={tw`bg-zinc-800 rounded-xl border border-orange-500/50 mt-2`}
                  activeColor="#f97316"
                  itemContainerStyle={tw`py-3`}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={submitProgression}
              style={[
                tw`bg-orange-500 py-4 rounded-xl`,
                {
                  shadowColor: "#f97316",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                },
              ]}
            >
              <Text
                style={tw`text-center font-bold text-white uppercase tracking-wide`}
              >
                Create Progression
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      <Modal transparent visible={editModalVisible} animationType="fade">
        <View style={tw`flex-1 bg-black/95 justify-center items-center p-5`}>
          <LinearGradient
            colors={["#000", "#1a1a1a"]}
            style={[
              tw`rounded-3xl w-full max-w-md p-6`,
              { borderWidth: 1, borderColor: "#f97316/30" },
            ]}
          >
            <View
              style={tw`flex-row justify-between items-center border-b border-orange-500/30 pb-4 mb-4`}
            >
              <Text style={tw`text-xl font-bold text-orange-500`}>
                Edit Progression
              </Text>
              <TouchableOpacity
                onPress={handleEditModalClose}
                style={tw`p-1.5 bg-orange-500/10 rounded-full`}
              >
                <Ionicons name="close" size={22} color="#f97316" />
              </TouchableOpacity>
            </View>

            <View style={tw`mb-6`}>
              <Text
                style={tw`text-orange-400/80 text-sm font-medium font-bold mb-2`}
              >
                Select Progression
              </Text>
              <Dropdown
                data={formattedSkillData}
                labelField="label"
                valueField="value"
                placeholder="Select progression"
                value={editProgression}
                onChange={handleEditModalChange}
                placeholderStyle={tw`text-gray-500`}
                selectedTextStyle={tw`text-white font-medium`}
                itemTextStyle={tw`text-gray-300`}
                style={[
                  tw`bg-zinc-800 text-white rounded-xl border p-2 border-orange-500/50`,
                  { height: 50, paddingVertical: 10 },
                ]}
                containerStyle={tw`bg-zinc-800 rounded-xl border border-orange-500/50 mt-2`}
                activeColor="#f97316"
                itemContainerStyle={tw`py-3`}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={tw`mb-6`}>
              <Text
                style={tw`text-orange-400/80 text-sm font-medium font-bold mb-2`}
              >
                Progression Name
              </Text>
              <TextInput
                value={editProgressionName}
                onChangeText={setEditProgressionName}
                style={tw`bg-zinc-800 text-white p-4 rounded-xl border border-orange-500/50 font-medium`}
                placeholderTextColor="#6b6b6b"
                placeholder="e.g. Advanced Tuck"
              />
            </View>

            <View style={tw`flex-row gap-4 mb-6`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-orange-400/80 font-bold text-sm mb-2`}>
                  Current
                </Text>
                <Dropdown
                  data={numbers}
                  labelField="label"
                  valueField="value"
                  placeholder="Select current"
                  value={editCurrent}
                  onChange={(item) => setEditCurrent(item.value)}
                  placeholderStyle={tw`text-gray-500`}
                  selectedTextStyle={tw`text-white font-medium`}
                  itemTextStyle={tw`text-gray-300`}
                  style={[
                    tw`bg-zinc-800 text-white rounded-xl border p-2 border-orange-500/50`,
                    { height: 50, paddingVertical: 10 },
                  ]}
                  containerStyle={tw`bg-zinc-800 rounded-xl border border-orange-500/50 mt-2`}
                  activeColor="#f97316"
                  itemContainerStyle={tw`py-3`}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              <View style={tw`flex-1`}>
                <Text style={tw`text-orange-400/80 text-sm font-bold mb-2`}>
                  Goal
                </Text>
                <Dropdown
                  data={numbers}
                  labelField="label"
                  valueField="value"
                  placeholder="Select goal"
                  value={editGoal}
                  onChange={(item) => setEditGoal(item.value)}
                  placeholderStyle={tw`text-gray-500`}
                  selectedTextStyle={tw`text-white font-medium`}
                  itemTextStyle={tw`text-gray-300`}
                  style={[
                    tw`bg-zinc-800 text-white rounded-xl p-2 border border-orange-500/50`,
                    { height: 50, paddingVertical: 10 },
                  ]}
                  containerStyle={tw`bg-zinc-800 rounded-xl border border-orange-500/50 mt-2`}
                  activeColor="#f97316"
                  itemContainerStyle={tw`py-3`}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={submitEditProgression}
              style={[
                tw`bg-orange-500 py-4 rounded-xl`,
                {
                  shadowColor: "#f97316",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                },
              ]}
            >
              <Text
                style={tw`text-center font-bold text-white uppercase tracking-wide`}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Skill;
