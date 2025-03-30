import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart3, ChevronDown } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const ProfileBarGraph = ({ workoutDates = [], workoutTimes = [] }) => {
  const [timeFilter, setTimeFilter] = useState("week"); 
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);


  const getFilterLabel = () => {
    return timeFilter === "week" ? "Past 7 Days" : "Past 30 Days";
  };

 
  const processedData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); 
    
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;
    let periodLabel;

    if (timeFilter === "week") {
   
      currentPeriodStart = new Date(today);
      currentPeriodStart.setDate(today.getDate() - 6); 
      currentPeriodStart.setHours(0, 0, 0, 0);

     
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 6);

      periodLabel = "Past 7 Days";
    } else {
   
      currentPeriodStart = new Date(today);
      currentPeriodStart.setDate(today.getDate() - 29); 
      currentPeriodStart.setHours(0, 0, 0, 0);

     
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 29);

      periodLabel = "Past 30 Days";
    }

  
    const getWorkoutMinutes = (timeStr) => {
      const [hh, mm, ss] = timeStr.split(":").map(Number);
      return hh * 60 + mm + ss / 60;
    };

 
    const currentPeriodWorkouts = [];
    const previousPeriodWorkouts = [];

    for (let i = 0; i < workoutDates.length; i++) {
      const dateObj = new Date(workoutDates[i].date);
      const minutes = getWorkoutMinutes(workoutTimes[i].workout_time);

  
      if (dateObj >= currentPeriodStart && dateObj <= today) {
        currentPeriodWorkouts.push({
          date: dateObj,
          minutes: minutes,
        });
      }

      
      if (dateObj >= previousPeriodStart && dateObj <= previousPeriodEnd) {
        previousPeriodWorkouts.push({
          date: dateObj,
          minutes: minutes,
        });
      }
    }

 
    const currentTotalMinutes = currentPeriodWorkouts.reduce(
      (sum, workout) => sum + workout.minutes,
      0
    );
    const previousTotalMinutes = previousPeriodWorkouts.reduce(
      (sum, workout) => sum + workout.minutes,
      0
    );

  
    let percentageChange = 0;
    let isPositive = false;

    if (previousTotalMinutes > 0) {
      percentageChange =
        ((currentTotalMinutes - previousTotalMinutes) / previousTotalMinutes) *
        100;
      isPositive = percentageChange > 0;
    } else if (currentTotalMinutes > 0) {
      percentageChange = 100;
      isPositive = true;
    }


    let displayData = [];

    if (timeFilter === "week") {
    
      const weekDates = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      

      let current = new Date(currentPeriodStart);
      
      for (let i = 0; i < 7; i++) {
        weekDates.push({
          date: current.toISOString().split("T")[0],
          dayName: dayNames[current.getDay()],
          displayDate: current.getDate(),
        });
        
    
        current.setDate(current.getDate() + 1);
      }

      const groupedData = {};
      currentPeriodWorkouts.forEach((workout) => {
        const dateKey = workout.date.toISOString().split("T")[0];
        groupedData[dateKey] = (groupedData[dateKey] || 0) + workout.minutes;
      });

      displayData = weekDates.map((dateInfo) => {
        return {
          label: dateInfo.dayName,
          subLabel: dateInfo.displayDate.toString(),
          value: Math.round(groupedData[dateInfo.date] || 0),
          date: dateInfo.date,
        };
      });
    } else {
 
      const periodCount = 6;
      const daysPerPeriod = 5;
      

      const dateRanges = [];
      let rangeStart = new Date(currentPeriodStart);
      
      for (let i = 0; i < periodCount; i++) {
        const rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeStart.getDate() + daysPerPeriod - 1);
        
   
        if (rangeEnd > today) {
          rangeEnd.setTime(today.getTime());
        }
        
        const startFormat = rangeStart.getDate();
        const endFormat = rangeEnd.getDate();
        const monthFormat = rangeStart.toLocaleString('default', { month: 'short' });
        
        dateRanges.push({
          label: `${startFormat}-${endFormat}`,
          subLabel: monthFormat,
          startDate: new Date(rangeStart),
          endDate: new Date(rangeEnd),
          value: 0
        });
        

        rangeStart = new Date(rangeEnd);
        rangeStart.setDate(rangeEnd.getDate() + 1);
        
       
        if (rangeStart > today) break;
      }
      
 
      currentPeriodWorkouts.forEach((workout) => {
        for (const range of dateRanges) {
          if (workout.date >= range.startDate && workout.date <= range.endDate) {
            range.value += workout.minutes;
            break;
          }
        }
      });

      displayData = dateRanges.map(range => ({
        ...range,
        value: Math.round(range.value)
      }));
    }


    const hours = Math.floor(currentTotalMinutes / 60);
    const minutes = Math.round(currentTotalMinutes % 60);


    const maxValue = Math.max(...displayData.map((d) => d.value), 60);

    return {
      displayData,
      maxValue,
      hours,
      minutes,
      percentageChange,
      isPositive,
      periodLabel,
      currentTotalMinutes,
      previousTotalMinutes,
    };
  }, [timeFilter, workoutDates, workoutTimes]);

  return (
    <View style={tw`mx-2 mb-6`}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]}
        style={tw`rounded-2xl mt-5 p-5 border border-zinc-800/50`}
      >
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`font-bold text-lg text-white`}>
            {timeFilter === "week" ? "Weekly Progress" : "Monthly Progress"}
          </Text>


          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              style={tw`flex-row items-center bg-zinc-800/70 px-3 py-1.5 rounded-full mr-2`}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={tw`text-zinc-300 text-sm mr-1.5`}>
                {getFilterLabel()}
              </Text>
              <ChevronDown size={16} color="#d4d4d4" />
            </TouchableOpacity>

            <View style={tw`bg-orange-500/20 p-1 rounded-full`}>
              <BarChart3 size={18} color="#f97316" />
            </View>
          </View>


          <Modal
            transparent={true}
            visible={dropdownVisible}
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={tw`flex-1 bg-black/60`}
              activeOpacity={1}
              onPress={() => setDropdownVisible(false)}
            >
              <View
                style={tw`absolute top-20 right-6 bg-zinc-800 rounded-lg shadow-xl overflow-hidden`}
              >
                <TouchableOpacity
                  style={tw`px-5 py-3 border-b border-zinc-700 flex-row items-center ${
                    timeFilter === "week" ? "bg-orange-500/10" : ""
                  }`}
                  onPress={() => {
                    setTimeFilter("week");
                    setDropdownVisible(false);
                  }}
                >
                  {timeFilter === "week" && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#f97316"
                      style={tw`mr-2`}
                    />
                  )}
                  <Text
                    style={tw`text-white text-base ${
                      timeFilter === "week" ? "font-bold text-orange-400" : ""
                    }`}
                  >
                    Past 7 Days
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`px-6 py-3 flex-row items-center ${
                    timeFilter === "month" ? "bg-orange-500/10" : ""
                  }`}
                  onPress={() => {
                    setTimeFilter("month");
                    setDropdownVisible(false);
                  }}
                >
                  {timeFilter === "month" && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#f97316"
                      style={tw`mr-2`}
                    />
                  )}
                  <Text
                    style={tw`text-white text-base ${
                      timeFilter === "month" ? "font-bold text-orange-400" : ""
                    }`}
                  >
                    Past 30 Days
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

  
        <ScrollView
          horizontal={timeFilter === "month"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            tw`pb-3`,
            timeFilter === "month" ? { paddingRight: 20 } : { width: "100%" },
          ]}
        >
          <View style={tw`flex-row justify-between items-end h-32 mb-4`}>
            {processedData.displayData.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedBar(selectedBar === index ? null : index);
                }}
                style={tw`flex-col items-center ${
                  timeFilter === "month" ? "mx-2.5 w-20" : ""
                }`}
              >
             
                <View style={tw`h-6 justify-end`}>
                  {item.value > 0 && (
                    <Text style={tw`text-xs text-orange-400 font-medium`}>
                      {Math.round(item.value)}m
                    </Text>
                  )}
                </View>

                <View style={tw`flex-grow flex items-end h-full justify-end`}>
                  <View
                    style={[
                      tw`w-10 rounded-t-sm`,
                      item.value > 0 ? tw`bg-orange-500` : tw`bg-zinc-700`,
                      {
                        height: `${(item.value / processedData.maxValue) * 100}%`,
                        minHeight: item.value > 0 ? 4 : 2,
                      },
                    ]}
                  />
                </View>

              
                <View style={tw`mt-2 items-center`}>
                  <Text style={tw`text-xs text-zinc-400 text-center`}>
                    {item.label}
                  </Text>
                  {item.subLabel && (
                    <Text style={tw`text-xs text-zinc-500 text-center`}>
                      {item.subLabel}
                    </Text>
                  )}
                </View>
                {selectedBar === index && item.value > 0 && (
                <View
                  style={[tw`absolute bottom-20 w-10 bg-zinc-900 rounded-lg border border-zinc-700`, {}]}
                >
                  <Text style={tw`text-xs text-orange-400 text-center font-medium`}>
                  {Math.round(item.value)}m
                  </Text>
                </View>
              )}
              </TouchableOpacity>
            
                
            ))}
            
          </View>
        </ScrollView>

        <View style={tw`flex-row justify-between mt-6 border-t border-zinc-700 pt-4`}>
          <View>
            <Text style={tw`text-xs text-zinc-400`}>{processedData.periodLabel}</Text>
            <Text style={tw`text-xl font-bold text-white`}>{`${processedData.hours}h ${processedData.minutes}m`}</Text>

            {processedData.previousTotalMinutes > 0 && (
              <Text style={tw`text-xs text-zinc-500 mt-1`}>
                {processedData.isPositive ? "Up" : "Down"} from{" "}
                {Math.floor(processedData.previousTotalMinutes / 60)}h{" "}
                {Math.round(processedData.previousTotalMinutes % 60)}m{" "}
                {timeFilter === "week" ? "previous 7 days" : "previous 30 days"}
              </Text>
            )}
          </View>

          <View style={tw`flex-row items-center`}>
            <View style={tw`flex-row items-center mt-2`}>
              {processedData.previousTotalMinutes > 0 && (
                <>
                  <Ionicons
                    name={processedData.isPositive ? "trending-up" : "trending-down"}
                    size={20}
                    color={processedData.isPositive ? "#22c55e" : "#ef4444"}
                  />
                  <Text
                    style={[
                      tw`text-sm font-bold ml-2`,
                      processedData.isPositive ? tw`text-green-500` : tw`text-red-500`,
                    ]}
                  >
                    {Math.abs(processedData.percentageChange).toFixed(1)}%
                  </Text>
                </>
              )}
              {processedData.previousTotalMinutes === 0 &&
                processedData.currentTotalMinutes > 0 && (
                  <Text style={tw`text-green-500 text-sm font-bold`}>New</Text>
                )}
              {processedData.previousTotalMinutes === 0 &&
                processedData.currentTotalMinutes === 0 && (
                  <Text style={tw`text-zinc-400 text-sm`}>No data</Text>
                )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ProfileBarGraph;