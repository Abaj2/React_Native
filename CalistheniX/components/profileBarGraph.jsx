import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart3, ChevronDown } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const ProfileBarGraph = ({ workoutDates = [], workoutTimes = [] }) => {
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' or 'month'
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Function to get filter display name
  const getFilterLabel = () => {
    return timeFilter === 'week' ? 'Past Week' : 'Past Month';
  };

  // Process data based on selected time filter
  const processedData = useMemo(() => {
    const today = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;
    let periodLabel;
    
    if (timeFilter === 'week') {
      // Get start of current week (Sunday)
      const dayOfWeek = today.getDay();
      currentPeriodStart = new Date(today);
      currentPeriodStart.setDate(today.getDate() - dayOfWeek);
      currentPeriodStart.setHours(0, 0, 0, 0);
      
      // Set end of current week (Saturday)
      const currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setDate(currentPeriodStart.getDate() + 6);
      currentPeriodEnd.setHours(23, 59, 59, 999);
      
      // Previous week period
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 6);
      
      periodLabel = 'This Week';
    } else {
      // Get start of current 30-day period
      currentPeriodStart = new Date(today);
      currentPeriodStart.setDate(today.getDate() - 30);
      currentPeriodStart.setHours(0, 0, 0, 0);
      
      // Current period end is today
      const currentPeriodEnd = today;
      
      // Previous 30-day period
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 30);
      
      periodLabel = 'Past 30 Days';
    }
    
    // Function to extract workout minutes
    const getWorkoutMinutes = (timeStr) => {
      const [hh, mm, ss] = timeStr.split(':').map(Number);
      return (hh * 60) + mm + (ss / 60);
    };
    
    // Filter workouts for current and previous periods
    const currentPeriodWorkouts = [];
    const previousPeriodWorkouts = [];
    
    for (let i = 0; i < workoutDates.length; i++) {
      const dateObj = new Date(workoutDates[i].date);
      const minutes = getWorkoutMinutes(workoutTimes[i].workout_time);
      
      // Check if workout belongs to current period
      if (dateObj >= currentPeriodStart && dateObj <= today) {
        currentPeriodWorkouts.push({
          date: dateObj,
          minutes: minutes
        });
      }
      
      // Check if workout belongs to previous period
      if (dateObj >= previousPeriodStart && dateObj <= previousPeriodEnd) {
        previousPeriodWorkouts.push({
          date: dateObj,
          minutes: minutes
        });
      }
    }
    
    // Calculate total minutes for both periods
    const currentTotalMinutes = currentPeriodWorkouts.reduce((sum, workout) => sum + workout.minutes, 0);
    const previousTotalMinutes = previousPeriodWorkouts.reduce((sum, workout) => sum + workout.minutes, 0);
    
    // Calculate percentage change
    let percentageChange = 0;
    let isPositive = false;
    
    if (previousTotalMinutes > 0) {
      percentageChange = ((currentTotalMinutes - previousTotalMinutes) / previousTotalMinutes) * 100;
      isPositive = percentageChange > 0;
    } else if (currentTotalMinutes > 0) {
      percentageChange = 100;
      isPositive = true;
    }
    
    // Create display data based on time filter
    let displayData = [];
    
    if (timeFilter === 'week') {
      // Generate dates for current week
      const weekDates = [];
      let current = new Date(currentPeriodStart);
      while (current <= today) {
        weekDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      
      // Group workout minutes by day
      const groupedData = {};
      currentPeriodWorkouts.forEach(workout => {
        const dateKey = workout.date.toISOString().split('T')[0];
        groupedData[dateKey] = (groupedData[dateKey] || 0) + workout.minutes;
      });
      
      // Create data array for each day of the week
      displayData = weekDates.map(date => {
        const dayObj = new Date(date);
        return {
          label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayObj.getDay()],
          value: Math.round(groupedData[date] || 0),
          date: date
        };
      });
    } else {
      // For month view: group by week
      const numWeeks = 4; // Show last 4 weeks
      const endDate = new Date(today);
      
      // Initialize array for each week
      const monthData = Array(numWeeks).fill(0).map((_, index) => {
        const weekEnd = new Date(endDate);
        weekEnd.setDate(endDate.getDate() - (index * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        
        // Format: "Mar 1-7" or similar
        const startMonth = weekStart.toLocaleString('default', { month: 'short' });
        const endMonth = weekEnd.toLocaleString('default', { month: 'short' });
        const label = startMonth === endMonth 
          ? `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`
          : `${startMonth} ${weekStart.getDate()}-${endMonth} ${weekEnd.getDate()}`;
          
        return {
          label,
          value: 0,
          startDate: new Date(weekStart),
          endDate: new Date(weekEnd)
        };
      }).reverse(); // Reverse to show oldest to newest
      
      // Aggregate minutes by week
      currentPeriodWorkouts.forEach(workout => {
        for (let i = 0; i < monthData.length; i++) {
          const week = monthData[i];
          if (workout.date >= week.startDate && workout.date <= week.endDate) {
            week.value += workout.minutes;
            break;
          }
        }
      });
      
      displayData = monthData.map(week => ({
        ...week,
        value: Math.round(week.value)
      }));
    }
    
    // Calculate hours and minutes from total minutes
    const hours = Math.floor(currentTotalMinutes / 60);
    const minutes = Math.round(currentTotalMinutes % 60);
    
    // Find maximum value for scaling (minimum 60 to prevent empty graph)
    const maxValue = Math.max(...displayData.map(d => d.value), 60);
    
    return {
      displayData,
      maxValue,
      hours,
      minutes,
      percentageChange,
      isPositive,
      periodLabel,
      currentTotalMinutes,
      previousTotalMinutes
    };
  }, [timeFilter, workoutDates, workoutTimes]);

  return (
    <View style={tw`mx-2 mb-6`}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]}
        style={tw`rounded-2xl mt-5 p-5 border border-zinc-800`}
      >
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`font-bold text-lg text-white`}>
            {timeFilter === 'week' ? 'Weekly Progress' : 'Monthly Progress'}
          </Text>
          
          {/* Time filter dropdown button */}
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              style={tw`flex-row items-center bg-zinc-800/70 px-3 py-1.5 rounded-full mr-2`}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={tw`text-zinc-300 text-sm mr-1.5`}>{getFilterLabel()}</Text>
              <ChevronDown size={16} color="#d4d4d4" />
            </TouchableOpacity>
            
            <View style={tw`bg-orange-500/20 p-1 rounded-full`}>
              <BarChart3 size={18} color="#f97316" />
            </View>
          </View>
          
          {/* Dropdown modal */}
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
              <View style={tw`absolute top-20 right-6 bg-zinc-800 rounded-lg shadow-xl overflow-hidden`}>
                <TouchableOpacity 
                  style={tw`px-6 py-3 border-b border-zinc-700 flex-row items-center ${timeFilter === 'week' ? 'bg-orange-500/10' : ''}`}
                  onPress={() => {
                    setTimeFilter('week');
                    setDropdownVisible(false);
                  }}
                >
                  {timeFilter === 'week' && (
                    <Ionicons name="checkmark" size={18} color="#f97316" style={tw`mr-2`} />
                  )}
                  <Text style={tw`text-white text-base ${timeFilter === 'week' ? 'font-bold text-orange-400' : ''}`}>Past Week</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={tw`px-6 py-3 flex-row items-center ${timeFilter === 'month' ? 'bg-orange-500/10' : ''}`}
                  onPress={() => {
                    setTimeFilter('month');
                    setDropdownVisible(false);
                  }}
                >
                  {timeFilter === 'month' && (
                    <Ionicons name="checkmark" size={18} color="#f97316" style={tw`mr-2`} />
                  )}
                  <Text style={tw`text-white text-base ${timeFilter === 'month' ? 'font-bold text-orange-400' : ''}`}>Past Month</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        
        {/* Graph Container */}
        <ScrollView 
          horizontal={timeFilter === 'month'} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            tw`pb-3`,
            timeFilter === 'month' ? { paddingRight: 20 } : { width: '100%' }
          ]}
        >
          <View style={tw`flex-row justify-between items-end h-32 mb-4`}>
            {processedData.displayData.map((item, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  // Show tooltip logic here if needed
                }}
                style={tw`flex-col items-center ${timeFilter === 'month' ? 'mx-2.5 w-20' : ''}`}
              >
                {/* Value label above bar for non-zero values */}
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
                        minHeight: item.value > 0 ? 4 : 2
                      }
                    ]}
                  />
                </View>
                
                {/* Day/Week label */}
                <Text 
                  style={tw`text-xs text-zinc-400 mt-2 text-center`}
                  numberOfLines={timeFilter === 'month' ? 2 : 1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <View style={tw`flex-row justify-between mt-6 border-t border-zinc-700 pt-4`}>
          <View>
            <Text style={tw`text-xs text-zinc-400`}>{processedData.periodLabel}</Text>
            <Text style={tw`text-xl font-bold text-white`}>{`${processedData.hours}h ${processedData.minutes}m`}</Text>
            
            {/* Additional insights */}
            {processedData.previousTotalMinutes > 0 && (
              <Text style={tw`text-xs text-zinc-500 mt-1`}>
                {processedData.isPositive ? 'Up' : 'Down'} from {Math.floor(processedData.previousTotalMinutes / 60)}h {Math.round(processedData.previousTotalMinutes % 60)}m {timeFilter === 'week' ? 'last week' : 'previous month'}
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
              {processedData.previousTotalMinutes === 0 && processedData.currentTotalMinutes > 0 && (
                <Text style={tw`text-green-500 text-sm font-bold`}>New</Text>
              )}
              {processedData.previousTotalMinutes === 0 && processedData.currentTotalMinutes === 0 && (
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