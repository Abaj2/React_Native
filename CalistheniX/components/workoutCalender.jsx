import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import tw from 'twrnc'
const WorkoutCalender = ({ calculateDailyStreak, workoutDates }) => {
  return (
    <View style={tw`mb-6`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <Text style={tw`text-white text-xl font-bold`}>Workout Calendar</Text>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="flame" size={16} color="#f97316" />
                <Text style={tw`text-orange-500 text-xs font-bold ml-1`}>{calculateDailyStreak(workoutDates)} Day Streak</Text>
              </View>
            </View>
            
            <View style={tw`bg-zinc-900 p-4 rounded-3xl border border-zinc-800/50`}>
              <View style={tw`flex-row justify-between mb-3`}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Text key={index} style={tw`text-gray-400 text-center text-xs`}>{day}</Text>
                ))}
              </View>
              
              <View style={tw`flex-row justify-between mb-3`}>
                {[null, null, 1, 2, 3, 4, 5].map((day, index) => (
                  <View key={index} style={tw`items-center`}>
                    {day ? (
                      <View style={tw`h-8 w-8 rounded-full bg-zinc-800 items-center justify-center ${index >= 4 ? 'bg-orange-500/20 border border-orange-500/50' : ''}`}>
                        <Text style={tw`text-white text-xs`}>{day}</Text>
                      </View>
                    ) : (
                      <View style={tw`h-8 w-8`} />
                    )}
                  </View>
                ))}
              </View>
              
              <View style={tw`flex-row justify-between`}>
                {[6, 7, 8, 9, 10, 11, 12].map((day, index) => (
                  <View key={index} style={tw`items-center`}>
                    <View style={tw`h-8 w-8 rounded-full bg-zinc-800 items-center justify-center ${day === 9 ? 'bg-orange-500' : day === 6 || day === 7 ? 'bg-orange-500/20 border border-orange-500/50' : ''}`}>
                      <Text style={tw`text-white text-xs`}>{day}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={tw`flex-row justify-center mt-4`}>
                <View style={tw`flex-row items-center mr-4`}>
                  <View style={tw`w-3 h-3 rounded-full bg-orange-500 mr-2`} />
                  <Text style={tw`text-gray-400 text-xs`}>Today</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/50 mr-2`} />
                  <Text style={tw`text-gray-400 text-xs`}>Workout Day</Text>
                </View>
              </View>
            </View>
          </View>
  )
}

export default WorkoutCalender