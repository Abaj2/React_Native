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
const FETCH_PROGRESSION_URL = Platform.select({
  android: "http://10.0.2.2:4003/addprogression",
  ios: "http://192.168.1.155:4003/addprogression",
});

const Skill = ({ skillData, loadUserData }) => {
  const [addProgression, setAddProgression] = useState("");
  const [addCurrent, setAddCurrent] = useState();
  const [addGoal, setAddGoal] = useState();
  const [progressionModalVisible, setProgressionModalVisible] = useState(false);

  const submitProgression = async () => {
    const skill = skillData.skill;
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));

    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken")
      const response = await axios.post(SERVER_URL, {
        skill,
        addProgression,
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
  };
  const handleModalClose = () => {
    setProgressionModalVisible(false);
  };

  const openProgressionModal = async () => {
    setProgressionModalVisible(true);
  };

  return (
    <View
      style={[
        tw`flex-1 self-center border border-gray-300 rounded-xl mb-5`,
        { width: width * 0.95 },
      ]}
    >
      <StatusBar barStyle={"dark-content"} />
      <View style={tw`flex-row justify-between`}>
        <Text style={tw`m-5 font-bold text-xl`}>{skillData.skill}</Text>
        <View style={tw`flex-row`}>
          <TouchableOpacity
            onPress={openProgressionModal}
            style={[
              tw`mt-6 rounded-xl bg-black justify-center items-center`,
              { width: width * 0.3, height: height * 0.03 },
            ]}
          >
            <Text style={tw`text-white`}>Add progression</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`mt-6 rounded-xl ml-2 mr-4 bg-black justify-center items-center`,
              { width: width * 0.15, height: height * 0.03 },
            ]}
          >
            <Text style={tw`text-white`}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      {skillData.progressions.map((item, index) => {
        const progress = skillData.current[index] / skillData.goal[index];
        return (
          <View key={index} style={tw`mb-4`}>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`ml-5`}>{item}</Text>
              <Text style={tw`text-gray-400 mr-5`}>
                {skillData.current[index]} / {skillData.goal[index]} seconds
              </Text>
            </View>
            <View
              style={[
                tw`mt-3 self-center w-full h-2 bg-gray-300 rounded-full`,
                { width: width * 0.85 },
              ]}
            >
              <View
                style={[
                  tw`h-full rounded-full bg-black`,
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
                <TouchableOpacity onPress={handleModalClose}>
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
    </View>
  );
};

export default Skill;
