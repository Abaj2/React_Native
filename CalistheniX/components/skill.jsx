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
      setEditGoal(
        skillData.goal[index][skillData.goal[index].length - 1]
      );
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
    const size = 64;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - current / goal);

    return (
      <View style={tw`flex-row items-center`}>
        <Text style={[tw`mr-2`, { color: COLORS.text }]}>
          {`${current} / ${goal}`}
        </Text>
        <View style={tw`w-16 h-16 justify-center items-center`}>
          <Svg height={size} width={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.progressTrack}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.progressFill}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <Text style={[tw`absolute text-sm font-bold`, { color: COLORS.text }]}>
            {Math.round((current / goal) * 100)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    
    <SafeAreaView style={[tw`mt-5 flex-1`, {}]}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-1 w-full`}>
        <ScrollView
          style={tw`flex-1 w-full`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`items-center w-full px-2`}
        >
          <LinearGradient colors={["#1a1a1a", "#000000"]} style={tw`border border-zinc-800 rounded-3xl w-full`}>
          <View style={[
            tw`mb-4 rounded-2xl w-[100%] overflow-hidden`,
            {
            }
          ]}>
            <View style={[
              tw`p-4 border-b`,
              { 
                borderColor: '#FFA500', 
              }
            ]}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={[tw`text-xl font-bold`, { color: '#FFFFFF' }]}>
                  {skillData.skill}
                </Text>
                <View style={tw`flex-row`}>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(true)}
                    style={tw`mr-4`}
                  >
                    <MaterialIcons name="edit" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSkillDelete}>
                    <MaterialIcons name="delete-outline" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
  
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`px-4 pt-4`}
            >
              {skillData.progressions.map((progression, index) => (
               <TouchableOpacity
               key={index}
               onPress={() => setSelectedProgressionIndex(index)}
               style={[
                 tw`px-4 py-2 mr-2 rounded-lg relative`,
                 {
                   borderWidth: 1,
                   borderColor: index === selectedProgressionIndex ? '' : '#666666',
                   backgroundColor: index === selectedProgressionIndex ? 'transparent' : '#333333',
                 },
               ]}
             >
               {index === selectedProgressionIndex && (
                 <LinearGradient
                   colors={["#f97316", "#ea580c"]}
                   style={tw`absolute inset-0 rounded-lg`}
                 />
               )}
               <Text style={tw`text-white font-bold relative text-center`}>
                 {progression}
               </Text>
             </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={openProgressionModal}
                style={[
                  tw`px-4 py-2 rounded-lg items-center justify-center`,
                  {
                    borderWidth: 1,
                    borderColor: '#666666',
                    backgroundColor: '#333333'
                  }
                ]}
              >
                <Ionicons name="add-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
  
            <View style={tw`p-4`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-sm mb-1`, { color: '#CCCCCC' }]}>
                    Current Progress
                  </Text>
                  <View style={tw`flex-row items-center justify-between`}>
                    <Text style={[tw`text-2xl font-bold`, { color: '#FFFFFF' }]}>
                      {skillData.current[selectedProgressionIndex]?.slice(-1)[0] || 0}
                    </Text>
                    <ProgressCircle
                      current={skillData.current[selectedProgressionIndex]?.slice(-1)[0] || 0}
                      goal={skillData.goal[selectedProgressionIndex]?.slice(-1)[0] || 1}
                    />
                  </View>
                </View>
              </View>
  
              <View style={[
                tw`rounded-lg p-3`,
                { 
                  backgroundColor: '#F97316',
                  borderWidth: 1,
                  borderColor: ''
                }
              ]}>
                 <LinearGradient
                   colors={["#f97316", "#ea580c"]}
                   style={tw`absolute inset-0 rounded-lg`}
                 />
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={{fontWeight: 'bold', color: '#FFFFFF' }}>Goal:</Text>
                  <Text style={{fontWeight: 'bold', color: '#FFFFFF' }}>
                    {skillData.goal[selectedProgressionIndex]?.slice(-1)[0] || 0}
                  </Text>
                </View>
                <View style={tw`flex-row justify-between`}>
                  <Text style={{fontWeight: 'bold', color: '#FFFFFF' }}>Progress:</Text>
                  <Text style={{fontWeight: 'bold', color: '#FFFFFF' }}>
                    {Math.round(
                      (skillData.current[selectedProgressionIndex]?.slice(-1)[0] / 
                      skillData.goal[selectedProgressionIndex]?.slice(-1)[0]) * 100
                    )}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </LinearGradient>
          

          <Modal
            transparent={true}
            visible={progressionModalVisible}
            animationType="fade"
          >
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-black/90`}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={[
                  tw`rounded-2xl p-5`,
                  {
                    width: width * 0.85,
                    backgroundColor: '#333333',
                    borderColor: '#FFA500',
                    borderWidth: 1,
                  }
                ]}>
                  <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={[tw`text-xl font-bold`, { color: '#FFA500' }]}>
                      Add Progression
                    </Text>
                    <TouchableOpacity onPress={handleProgressionModalClose}>
                      <Ionicons
                        name="close"
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
  
                  <View style={tw`space-y-4`}>
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Progression Name
                      </Text>
                      <TextInput
                        value={addProgression}
                        onChangeText={setAddProgression}
                        placeholder="e.g. advanced tuck"
                        placeholderTextColor="#666666"
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            color: '#FFFFFF',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                      />
                    </View>
  
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Current
                      </Text>
                      <Dropdown
                        onChange={(item) => setAddCurrent(item.value)}
                        data={numbers}
                        labelField="label"
                        valueField="value"
                        placeholder="Select current value"
                        placeholderStyle={{ color: '#666666' }}
                        itemTextStyle={{ color: '#FFFFFF' }}
                        selectedTextStyle={{ color: '#FFFFFF' }}
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                        containerStyle={{
                          backgroundColor: '#333333',
                          borderColor: '#FFA500',
                        }}
                      />
                    </View>
  
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Goal
                      </Text>
                      <Dropdown
                        onChange={(item) => setAddGoal(item.value)}
                        data={numbers}
                        labelField="label"
                        valueField="value"
                        placeholder="Select goal value"
                        placeholderStyle={{ color: '#666666' }}
                        itemTextStyle={{ color: '#FFFFFF' }}
                        selectedTextStyle={{ color: '#FFFFFF' }}
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                        containerStyle={{
                          backgroundColor: '#333333',
                          borderColor: '#FFA500',
                        }}
                      />
                    </View>
  
                    <TouchableOpacity
                      onPress={submitProgression}
                      style={[
                        tw`rounded-lg p-3 items-center mt-4`,
                        { backgroundColor: '#FFA500' }
                      ]}
                    >
                      <Text style={[tw`font-bold`, { color: '#000000' }]}>
                        Add Progression
                      </Text>
                    </TouchableOpacity>
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
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-black/90`}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={[
                  tw`rounded-2xl p-5`,
                  {
                    width: width * 0.85,
                    backgroundColor: '#333333',
                    borderColor: '#FFA500',
                    borderWidth: 1,
                  }
                ]}>
                  <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={[tw`text-xl font-bold`, { color: '#FFA500' }]}>
                      Edit Progression
                    </Text>
                    <TouchableOpacity onPress={handleEditModalClose}>
                      <Ionicons
                        name="close"
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
  
                  <View style={tw`space-y-4`}>
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Select Progression
                      </Text>
                      <Dropdown
                        onChange={handleEditModalChange}
                        data={formattedSkillData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select progression"
                        placeholderStyle={{ color: '#666666' }}
                        itemTextStyle={{ color: '#FFFFFF' }}
                        selectedTextStyle={{ color: '#FFFFFF' }}
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                        containerStyle={{
                          backgroundColor: '#333333',
                          borderColor: '#FFA500',
                        }}
                      />
                    </View>
  
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Name
                      </Text>
                      <TextInput
                        value={editProgressionName}
                        onChangeText={setEditProgressionName}
                        placeholder="Progression name"
                        placeholderTextColor="#666666"
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            color: '#FFFFFF',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                      />
                    </View>
  
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Current
                      </Text>
                      <Dropdown
                        onChange={(item) => setEditCurrent(item.value)}
                        data={numbers}
                        labelField="label"
                        valueField="value"
                        placeholder="Select current value"
                        placeholderStyle={{ color: '#666666' }}
                        itemTextStyle={{ color: '#FFFFFF' }}
                        selectedTextStyle={{ color: '#FFFFFF' }}
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                        containerStyle={{
                          backgroundColor: '#333333',
                          borderColor: '#FFA500',
                        }}
                      />
                    </View>
  
                    <View>
                      <Text style={[tw`mb-1`, { color: '#CCCCCC' }]}>
                        Goal
                      </Text>
                      <Dropdown
                        onChange={(item) => setEditGoal(item.value)}
                        data={numbers}
                        labelField="label"
                        valueField="value"
                        placeholder="Select goal value"
                        placeholderStyle={{ color: '#666666' }}
                        itemTextStyle={{ color: '#FFFFFF' }}
                        selectedTextStyle={{ color: '#FFFFFF' }}
                        style={[
                          tw`rounded-lg p-3`,
                          {
                            backgroundColor: '#1A1A1A',
                            borderColor: '#FFA500',
                            borderWidth: 1,
                          }
                        ]}
                        containerStyle={{
                          backgroundColor: '#333333',
                          borderColor: '#FFA500',
                        }}
                      />
                    </View>
  
                    <TouchableOpacity
                      onPress={submitEditProgression}
                      style={[
                        tw`rounded-lg p-3 items-center mt-4`,
                        { backgroundColor: '#FFA500' }
                      ]}
                    >
                      <Text style={[tw`font-bold`, { color: '#000000' }]}>
                        Save Changes
                      </Text>
                    </TouchableOpacity>
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
