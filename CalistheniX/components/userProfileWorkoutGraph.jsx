import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, Clock, ChevronDown } from 'lucide-react-native';

const UserProfileWorkoutGraph = ({ workoutDates = [], workoutTimes = [] }) => {
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' or 'month'
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  // Use sample data if none provided
  const sampleWorkoutDates = [
    { "date": "2025-02-09T00:19:08.054Z" },
    { "date": "2025-02-04T00:35:08.848Z" },
    { "date": "2025-02-15T10:22:30.123Z" },
    { "date": "2025-02-18T08:45:12.987Z" },
    { "date": "2025-02-22T15:33:42.456Z" },
    { "date": "2025-02-27T17:12:09.789Z" },
    { "date": "2025-03-02T09:05:38.654Z" },
    { "date": "2025-03-05T14:28:56.321Z" },
    { "date": "2025-03-10T11:40:17.852Z" },
    { "date": "2025-03-15T16:52:33.159Z" },
    // Add previous period data for comparison
    { "date": "2025-01-12T10:25:18.654Z" },
    { "date": "2025-01-18T13:35:22.987Z" },
    { "date": "2025-01-25T09:15:42.321Z" },
    { "date": "2025-01-29T16:40:33.789Z" }
  ];
  
  const sampleWorkoutTimes = [
    { "workout_time": "00:22:12" },
    { "workout_time": "00:23:12" },
    { "workout_time": "00:25:45" },
    { "workout_time": "00:30:10" },
    { "workout_time": "00:20:05" },
    { "workout_time": "00:28:33" },
    { "workout_time": "00:32:22" },
    { "workout_time": "00:24:18" },
    { "workout_time": "00:29:55" },
    { "workout_time": "00:27:40" },
    // Add previous period data for comparison
    { "workout_time": "00:19:45" },
    { "workout_time": "00:22:33" },
    { "workout_time": "00:24:12" },
    { "workout_time": "00:18:50" }
  ];

  const dates = workoutDates.length ? workoutDates : sampleWorkoutDates;
  const times = workoutTimes.length ? workoutTimes : sampleWorkoutTimes;

  // Function to get filter display name
  const getFilterLabel = () => {
    return timeFilter === 'week' ? 'Past Week' : 'Past Month';
  };

  // Function to process data based on time filter
  const processedData = useMemo(() => {
    const today = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;
    let periodLabel;
    let groupingFormat;
    
    if (timeFilter === 'week') {
      // Get start of current week (Sunday)
      const dayOfWeek = today.getDay();
      currentPeriodStart = new Date(today);
      currentPeriodStart.setDate(today.getDate() - dayOfWeek);
      currentPeriodStart.setHours(0, 0, 0, 0);
      
      // Previous week period
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 6);
      
      periodLabel = 'This Week';
      groupingFormat = 'day'; // Group by day
    } else {
      // Get start of current 30-day period
      currentPeriodStart = new Date(today);
      currentPeriodStart.setDate(today.getDate() - 30);
      currentPeriodStart.setHours(0, 0, 0, 0);
      
      // Previous 30-day period
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 30);
      
      periodLabel = 'Past 30 Days';
      groupingFormat = 'week'; // Group by week
    }
    
    // Function to extract workout minutes
    const getWorkoutMinutes = (dateStr, timeStr) => {
      const [hh, mm, ss] = timeStr.split(':').map(Number);
      return (hh * 60) + mm + (ss / 60);
    };
    
    // Filter workouts within the current period
    const currentPeriodWorkouts = [];
    for (let i = 0; i < dates.length; i++) {
      const dateObj = new Date(dates[i].date);
      if (dateObj >= currentPeriodStart && dateObj <= today) {
        currentPeriodWorkouts.push({
          date: dateObj,
          minutes: getWorkoutMinutes(dates[i].date, times[i].workout_time)
        });
      }
    }
    
    // Filter workouts within the previous period
    const previousPeriodWorkouts = [];
    for (let i = 0; i < dates.length; i++) {
      const dateObj = new Date(dates[i].date);
      if (dateObj >= previousPeriodStart && dateObj <= previousPeriodEnd) {
        previousPeriodWorkouts.push({
          date: dateObj,
          minutes: getWorkoutMinutes(dates[i].date, times[i].workout_time)
        });
      }
    }
    
    // Calculate total minutes for current and previous periods
    const currentTotalMinutes = currentPeriodWorkouts.reduce((sum, workout) => sum + workout.minutes, 0);
    const previousTotalMinutes = previousPeriodWorkouts.reduce((sum, workout) => sum + workout.minutes, 0);
    
    // Calculate percentage change between periods
    let percentageChange = 0;
    if (previousTotalMinutes > 0) {
      percentageChange = ((currentTotalMinutes - previousTotalMinutes) / previousTotalMinutes) * 100;
    } else if (currentTotalMinutes > 0) {
      percentageChange = 100; // If previous period had 0 minutes, but current has some
    }
    
    let groupedData = [];
    
    if (timeFilter === 'week') {
      // For week view: group by day
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize array for each day of the week
      const weekData = Array(7).fill(0).map((_, index) => {
        const day = new Date(currentPeriodStart);
        day.setDate(currentPeriodStart.getDate() + index);
        return {
          label: dayLabels[index],
          value: 0,
          date: new Date(day)
        };
      });
      
      // Aggregate minutes by day
      currentPeriodWorkouts.forEach(workout => {
        const dayIndex = workout.date.getDay();
        weekData[dayIndex].value += workout.minutes;
      });
      
      groupedData = weekData;
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
      
      groupedData = monthData;
    }
    
    // Calculate totals from the current period
    const hours = Math.floor(currentTotalMinutes / 60);
    const minutes = Math.round(currentTotalMinutes % 60);

    // Find maximum value for scaling (minimum 60 to prevent empty graph)
    const maxValue = Math.max(...groupedData.map(d => d.value), 60);
    
    return {
      groupedData,
      totalHours: hours,
      totalMinutes: minutes,
      maxValue,
      percentageChange,
      periodLabel,
      currentPeriodWorkouts,
      previousPeriodWorkouts,
      currentTotalMinutes,
      previousTotalMinutes
    };
  }, [timeFilter, dates, times]);

  return (
    <View style={tw`mx-2 mt-10 mb-6`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`font-bold text-lg text-white`}>Workout Performance</Text>
            <View style={tw`ml-2 bg-orange-500/10 h-7 w-7 rounded-full items-center justify-center`}>
              <BarChart3 size={16} color="#f97316" />
            </View>
          </View>
          
          {/* Time filter dropdown */}
          <TouchableOpacity 
            style={tw`flex-row items-center ml-1 bg-zinc-800/70 px-3 py-1.5 rounded-full`}
            onPress={() => setDropdownVisible(true)}
          >
            <Text style={tw`text-zinc-300 text-sm mr-1.5`}>{getFilterLabel()}</Text>
            <ChevronDown size={16} color="#d4d4d4" />
          </TouchableOpacity>
          
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
            timeFilter === 'month' ? { paddingRight: 10 } : { width: '100%' }
          ]}
        >
          <View style={tw`flex-row items-end h-36 justify-between`}>
            {processedData.groupedData.map((item, index) => {
              // Calculate bar height percentage
              const heightPercentage = Math.max(
                (item.value / processedData.maxValue) * 100, 
                item.value > 0 ? 5 : 2
              );
              
              return (
                <View 
                  key={index}
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
                  
                  {/* Bar container with gradient */}
                  <View style={[tw`w-12 my-1 items-center justify-end`]}>
                    <View 
                      style={[
                        tw`w-full rounded-lg overflow-hidden`,
                        {
                          height: `${heightPercentage}%`
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={item.value > 0 ? 
                          ['#f97316', '#ea580c'] : 
                          ['#3f3f46', '#27272a']}
                        style={tw`w-full h-full`}
                      />
                    </View>
                  </View>
                  
                  {/* Day/Week label */}
                  <View style={tw`mt-2`}>
                    <Text 
                      style={tw`text-xs ${item.value > 0 ? 'text-zinc-300' : 'text-zinc-500'} text-center`}
                      numberOfLines={timeFilter === 'month' ? 2 : 1}
                    >
                      {item.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        {/* Summary section with elevated card look */}
        <View style={tw`mt-4 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-xs text-zinc-400 mb-1`}>{processedData.periodLabel}</Text>
              <Text style={tw`text-xl font-bold text-white`}>
                {`${processedData.totalHours}h ${processedData.totalMinutes}m`}
              </Text>
            </View>
            <View style={tw`bg-zinc-800/80 py-1.5 px-3 rounded-full flex-row items-center`}>
              {processedData.previousTotalMinutes > 0 && (
                <>
                  <Ionicons
                    name={processedData.percentageChange > 0 ? "trending-up" : "trending-down"}
                    size={16}
                    color={processedData.percentageChange > 0 ? "#22c55e" : "#ef4444"}
                  />
                  <Text
                    style={[
                      tw`text-sm font-bold ml-1.5`,
                      processedData.percentageChange > 0 ? tw`text-green-500` : tw`text-red-500`,
                    ]}
                  >
                    {Math.abs(processedData.percentageChange).toFixed(1)}%
                  </Text>
                </>
              )}
              {processedData.previousTotalMinutes === 0 && processedData.currentTotalMinutes > 0 && (
                <Text style={tw`text-sm font-bold text-green-500`}>New</Text>
              )}
              {processedData.previousTotalMinutes === 0 && processedData.currentTotalMinutes === 0 && (
                <Text style={tw`text-sm text-zinc-500`}>No data</Text>
              )}
            </View>
          </View>
          
          {/* Additional insights */}
          {timeFilter === 'week' && processedData.totalHours > 0 && (
            <Text style={tw`text-xs text-zinc-500 mt-2`}>
              Averaging {((processedData.currentTotalMinutes) / 7).toFixed(1)} min per day
            </Text>
          )}
          {timeFilter === 'month' && processedData.totalHours > 0 && (
            <Text style={tw`text-xs text-zinc-500 mt-2`}>
              Averaging {((processedData.currentTotalMinutes) / 30).toFixed(1)} min per day
            </Text>
          )}
          {processedData.previousTotalMinutes > 0 && (
            <Text style={tw`text-xs text-zinc-500 mt-1`}>
              {processedData.percentageChange > 0 ? 'Up' : 'Down'} from {Math.floor(processedData.previousTotalMinutes / 60)}h {Math.round(processedData.previousTotalMinutes % 60)}m {timeFilter === 'week' ? 'last week' : 'previous 30 days'}
            </Text>
          )}
        </View>
    </View>
  );
};

export default UserProfileWorkoutGraph;