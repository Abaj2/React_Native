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
  StatusBar,
  Alert
} from "react-native";
import tw from "twrnc";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from "react-native-element-dropdown";

const numbers = Array.from({ length: 90 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

const { width, height } = Dimensions.get("window");

const SERVER_URL = Platform.select({
  android: "http://10.0.2.2:4003/addprogression",
  ios: "http://192.168.1.155:4003/addprogression",
});
const EDIT_PROGRESSION_URL = Platform.select({
  android: "http://10.0.2.2:4003/editprogression",
  ios: "http://192.168.1.155:4003/editprogression",
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

  const submitProgression = async () => {
    const skill = skillData.skill.trim();
    const addProgressionTrimmed = addProgression.trim();
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));

    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken")
      console.log("progression trimmed:", addProgressionTrimmed)
      const response = await axios.post(SERVER_URL, {
        skill,
        addProgressionTrimmed,
        addCurrent,
        addGoal,
        user_id: userData.user_id
      },
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

      if (response.status === 200) {
        console.log("Sent add progression data");
        loadUserData();
      }
    } catch (err) {
      console.error("Error sending add progression data:", err.message || err.response);
    }
    setProgressionModalVisible(false);
    setAddProgression("");
    setAddCurrent();
    setAddGoal();
    setEditIndex();
  };

  const editSkill = ()  => {
    setEditModalVisible(true);
  }

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
  }

  const openProgressionModal = () => {
    setProgressionModalVisible(true);
  };

  const submitEditProgression = async () => {
    if (!editCurrent) {
      setEditCurrent(skillData.current[editIndex])
    } 
    if (!editGoal) {
      setEditGoal(skillData.goal[editIndex])
    }
    if (editCurrent === skillData.current[editIndex] && editGoal === skillData.goal[editIndex] && editProgressionName === skillData.progressions[editIndex]) {
      Alert.alert("You didn't change anything")
      return
    }
    const skill = skillData.skill
    const editProgressionNameTrimmed = editProgressionName.trim();
    const oldCurrent = skillData.current[editIndex]
    const oldGoal = skillData.goal[editIndex]
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken")
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      const response = await axios.post(EDIT_PROGRESSION_URL, {
        skill,
        editProgression,
        editCurrent,
        oldCurrent,
        editGoal,
        oldGoal,
        editProgressionNameTrimmed,
        editIndex,
        
        user_id: userData.user_id
      },
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

      if (response.status === 200) {
        console.log("Sent edit progression data");
      }
    } catch (err) {
      console.error("Error sending edit progression data:", err.message || err.response);
    }
    setEditModalVisible(false);
    setEditProgression("");
    setEditCurrent();
    setEditGoal();
    setEditProgressionName("");
    loadUserData();

    
  
    


    
    /*console.log("Progression Name:", editProgression)
    console.log("Current:", editCurrent) 
    console.log("Goal:", editGoal)
    console.log("New progression name:", editProgressionName)
    console.log("Index:", editIndex)  */ 

  }
  const formattedSkillData = skillData.progressions.map((item, index) => ({
    label: item,
    value: item,
  }))

  const handleEditModalChange = (item) => {
    const index = skillData.progressions.findIndex(progression => progression === item.value)
    setEditIndex(index);
    setEditProgression(item.value)
    setEditProgressionName(item.value)
  }
  return (
    <View
      style={[
        tw`flex-1 self-center border ${isDarkMode ? "border-gray-700" : "border-gray-300"} rounded-xl mb-5`,
        { width: width * 0.95 },
      ]}
    >
      <StatusBar barStyle={`${isDarkMode ? "light-content" : "dark-content"}`} />
      <View style={tw`flex-row justify-between`}>
        <Text style={tw`m-5 font-bold ${isDarkMode ? "text-white" : "text-black"} text-xl`}>{skillData.skill}</Text>
        <View style={tw`flex-row`}>
          <TouchableOpacity
            onPress={openProgressionModal}
            style={[
              tw`mt-6 rounded-xl ${isDarkMode ? "bg-orange-300" : "bg-blue-300"} justify-center items-center`,
              { width: width * 0.3, height: height * 0.03 },
            ]}
          >
            <Text style={tw`${isDarkMode ? "text-black" : "text-black"}`}>Add progression</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={editSkill}
            style={[
              tw`mt-6 rounded-xl ml-2 mr-4 ${isDarkMode ? "bg-orange-300" : "bg-blue-300"} justify-center items-center`,
              { width: width * 0.15, height: height * 0.03 },
            ]}
          >
            <Text style={tw`${isDarkMode ? "text-black" : "text-black"}`}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      {skillData.progressions.map((item, index) => {
        const progress = skillData.current[index] / skillData.goal[index];
        return (
          <View key={index} style={tw`mb-4`}>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`ml-5 ${isDarkMode ? "text-white" : "text-black"}`}>{item}</Text>
              <Text style={tw`text-gray-400 mr-5`}>
                {skillData.current[index]} / {skillData.goal[index]} seconds
              </Text>
            </View>
            <View
              style={[
                tw`mt-3 self-center w-full h-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"} rounded-full`,
                { width: width * 0.85 },
              ]}
            >
              <View
                style={[
                  tw`h-full rounded-full ${isDarkMode ? "bg-white" : "bg-black"}`,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
      <Modal transparent={true} visible={progressionModalVisible} animationType="fade">
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
                style={[tw``, { width: width * 0.1, height: height * 0.05 }]}
              >
                <TouchableOpacity onPress={handleProgressionModalClose}>
                  <Ionicons name="close-circle-outline" size={40} color="black" />
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
                            Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
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
                            Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
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
                    <Text style={[tw`text-white font-bold`, { fontSize: 15 }]}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </Modal>
      <Modal transparent={true} visible={editModalVisible} animationType="fade">
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
                style={[tw``, { width: width * 0.1, height: height * 0.05 }]}
              >
                <TouchableOpacity onPress={handleEditModalClose}>
                  <Ionicons name="close-circle-outline" size={40} color="black" />
                </TouchableOpacity>
              </View>
              <View>
                <View style={tw`text-center`}>
                  <Dropdown 
                  style={[tw`self-center`, {width: width * 0.5}]}
                  onChange={handleEditModalChange}
                  data={formattedSkillData}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Progression"
                  selectedTextStyle={[tw`text-xl text-center`, {}]}
                  placeholderStyle={tw`text-xl text-center`}
                  value={editProgression}
                  renderRightIcon={() => (
                    <MaterialIcons name="arrow-drop-down" size={30} color="black" />
                  )} />

                 {/* <Text style={tw`self-center font-bold text-2xl`}>
                    {skillData.progressions}
                  </Text> */}
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
                            Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
                        },
                      ]}
                      value={skillData.current[editIndex]}
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
                            Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
                        },
                      ]}
                      value={skillData.goal[editIndex]}
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
                    <Text style={[tw`text-white font-bold`, { fontSize: 15 }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default Skill;
