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

const { width, height } = Dimensions.get("window");

const ProfileBarGraph = ({ workoutDates, styles }) => {
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
        const minutes = (hh * 3600 + mm * 60 + ss) / 60;
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

    const { dataValues, originalValuesArray } = weekDates.reduce(
      (acc, date) => {
        const value = groupedData[date] || 0;
        acc.dataValues.push(value > 60 ? 60 : Math.round(value));
        acc.originalValuesArray.push(originalValues[date] || 0);
        return acc;
      },
      { dataValues: [], originalValuesArray: [] }
    );

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const labels = weekDates.map((date) => dayNames[new Date(date).getDay()]);

    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 40;
    const [tooltipPos, setTooltipPos] = useState({
      visible: false,
      x: 0,
      y: 0,
      value: 0,
      index: null,
    });

    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
        <Text style={styles.chartTitle}>Daily Workout Duration</Text>

        <View style={[styles.chartContainer, { borderColor: "#f97316" }]}>
          <BarChart
            data={{
              labels: labels,
              datasets: [{ data: dataValues }],
            }}
            width={chartWidth}
            height={250}
            fromZero
            chartConfig={{
              backgroundColor: "#000",
              backgroundGradientFrom: "#0f0f0f",
              backgroundGradientTo: "#000",
              decimalPlaces: 0,
              color: () => `rgba(249, 115, 22, 1)`,
              labelColor: () => `rgba(255, 255, 255, 0.8)`,
              style: { borderRadius: 16 },
              formatYLabel: (value) => `${value}m`,
              propsForVerticalLabels: { fill: "#fff", fontSize: 12 },
              propsForHorizontalLabels: { fill: "#fff", fontSize: 12 },
              maxValue: 60,
              segments: 4,
              propsForBackgroundLines: {
                stroke: "rgba(255, 255, 255, 0.1)",
                strokeWidth: 1,
              },
              fillShadowGradient: "#fb923c",
              fillShadowGradientOpacity: 1,
              barPercentage: 0.5,
              useShadowColorFromDataset: false,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              overflow: "visible",
            }}
            verticalLabelRotation={0}
            showValuesOnTopOfBars={false}
            onDataPointClick={(data) => {
              const isSamePoint =
                tooltipPos.x === data.x && tooltipPos.y === data.y;
              setTooltipPos({
                x: data.x,
                y: data.y - 50,
                value: originalValuesArray[data.index],
                index: data.index,
                visible: !isSamePoint || !tooltipPos.visible,
              });
            }}
          />

          <Svg style={styles.gridLine}>
            <Line
              x1="70"
              y1="0"
              x2="70"
              y2="250"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          </Svg>

          {tooltipPos.visible && (
            <View
              style={[
                styles.tooltip,
                {
                  left:
                    tooltipPos.x > chartWidth - 70
                      ? chartWidth - 70
                      : tooltipPos.x - 25,
                  top: tooltipPos.y < 0 ? 0 : tooltipPos.y,
                },
              ]}
            >
              <Text style={styles.tooltipText}>
                {Math.round(tooltipPos.value)}m
              </Text>
              <View style={styles.tooltipArrow} />
            </View>
          )}
        </View>
      </View>
    );
  };
export default ProfileBarGraph;