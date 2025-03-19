import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { BarChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Line } from "react-native-svg";
import { ArrowUpRight, BarChart3 } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const ProfileBarGraph = ({ workoutDates, styles, workoutTimes, percentageChange, isPositive }) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const groupedData = {};
  const originalValues = {};
  for (let i = 0; i < workoutDates.length; i++) {
    const dateObj = new Date(workoutDates[i].date);
    if (dateObj >= sunday && dateObj <= saturday) {
      const dateKey = dateObj.toISOString().split("T")[0];
      const [hh, mm, ss] = workoutTimes[i].workout_time
        .split(":")
        .map(Number);
      const minutes = (hh * 60) + mm + (ss / 60);
      groupedData[dateKey] = (groupedData[dateKey] || 0) + minutes;
      originalValues[dateKey] = minutes;
    }
  }

  const weekDates = [];
  let current = new Date(sunday);
  while (current <= saturday) {
    weekDates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  const dayData = weekDates.map(date => {
    const dayObj = new Date(date);
    return {
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayObj.getDay()],
      value: Math.round(groupedData[date] || 0),
      date: date
    };
  });

  const maxValue = Math.max(...dayData.map(d => d.value), 60);
  

  const totalMinutes = dayData.reduce((sum, day) => sum + day.value, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  



  return (
    <View style={tw`mx-2 mb-6`}>
      <LinearGradient
        colors={["#18181b", "#09090b"]}
        style={tw`rounded-2xl p-5`}
      >
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`font-bold text-lg text-white`}>Weekly Progress</Text>
          <View style={tw`bg-orange-500/20 p-1 rounded-full`}>
            <BarChart3 size={18} color="#f97316" />
          </View>
        </View>
        
        <View style={tw`flex-row justify-between items-end h-32 mb-4`}>
          {dayData.map((day, index) => (
            <TouchableOpacity 
              key={day.day}
              onPress={() => {
                // Show tooltip logic here
              }}
              style={tw`flex-col items-center`}
            >
              <View style={tw`flex-grow flex items-end h-full justify-end`}>
                <View 
                  style={[
                    tw`w-8 rounded-t-sm`,
                    day.value > 0 ? tw`bg-orange-500` : tw`bg-zinc-700`,
                    {
                      height: `${(day.value / maxValue) * 100}%`,
                      minHeight: day.value > 0 ? 4 : 2
                    }
                  ]}
                />
              </View>
              <Text style={tw`text-xs text-zinc-400 mt-2`}>{day.day}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={tw`flex-row justify-between mt-6 border-t border-zinc-700 pt-4`}>
          <View>
            <Text style={tw`text-xs text-zinc-400`}>This Week</Text>
            <Text style={tw`text-xl font-bold text-white`}>{`${hours}h ${minutes}m`}</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            
            <View style={tw`flex-row items-center mt-2`}>
                    {percentageChange !== 0 && (
                      <>
                        <Ionicons
                          name={isPositive ? "trending-up" : "trending-down"}
                          size={20}
                          color={isPositive ? "#22c55e" : "#ef4444"}
                        />
                        <Text
                          style={[
                            tw`text-sm font-bold ml-2`,
                            isPositive ? tw`text-green-500` : tw`text-red-500`,
                          ]}
                        >
                          {Math.abs(percentageChange).toFixed(1)}%
                        </Text>
                      </>
                    )}
                    {percentageChange === 0 && (
                      <Text style={tw`text-gray-400 text-sm`}>No change</Text>
                    )}
                  </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
export default ProfileBarGraph;