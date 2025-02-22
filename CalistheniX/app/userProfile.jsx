import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const UserProfile = ({ navigation, route }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('workouts');

  const dummyUser = {
    id: '1',
    username: 'alexFitness',
    name: 'Alex Johnson',
    bio: 'Fitness enthusiast | Calisthenics athlete | Helping people transform their lives through movement',
    workouts: 156,
    followers: 1200,
    following: 843,
    image: null,
  };

  const dummyWorkouts = [
    { id: '1', title: 'Morning Mobility Routine', date: '2023-07-20', duration: '45 min' },
    { id: '2', title: 'Push Day Workout', date: '2023-07-19', duration: '60 min' },
    { id: '3', title: 'Core & Flexibility', date: '2023-07-18', duration: '30 min' },
    { id: '4', title: 'Full Body HIIT', date: '2023-07-17', duration: '40 min' },
  ];

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={["#000", "#1a1a1a"]} style={tw`flex-1`}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-800`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={tw`text-white font-bold text-lg`}>{dummyUser.username}</Text>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={tw`px-4 pt-6`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`h-20 w-20 rounded-full bg-zinc-800 justify-center items-center`}>
                {dummyUser.image ? (
                  <Image source={{ uri: dummyUser.image }} style={tw`h-20 w-20 rounded-full`} />
                ) : (
                  <Text style={tw`text-orange-500 font-bold text-3xl`}>
                    {dummyUser.username.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              
              <View style={tw`flex-row gap-4`}>
                <View style={tw`items-center`}>
                  <Text style={tw`text-white font-bold text-lg`}>{dummyUser.workouts}</Text>
                  <Text style={tw`text-zinc-400 text-sm`}>Workouts</Text>
                </View>
                <View style={tw`items-center`}>
                  <Text style={tw`text-white font-bold text-lg`}>{dummyUser.followers}</Text>
                  <Text style={tw`text-zinc-400 text-sm`}>Followers</Text>
                </View>
                <View style={tw`items-center`}>
                  <Text style={tw`text-white font-bold text-lg`}>{dummyUser.following}</Text>
                  <Text style={tw`text-zinc-400 text-sm`}>Following</Text>
                </View>
              </View>
            </View>

            <View style={tw`mt-4`}>
              <Text style={tw`text-white font-bold text-lg`}>{dummyUser.name}</Text>
              <Text style={tw`text-zinc-400 mt-1`}>{dummyUser.bio}</Text>
            </View>

            <TouchableOpacity
              style={tw`mt-4 ${isFollowing ? 'bg-zinc-800' : 'bg-orange-500'} rounded-full py-2`}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={tw`text-center font-semibold ${isFollowing ? 'text-zinc-400' : 'text-white'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={tw`flex-row mt-6 border-b border-zinc-800`}>
            {['Workouts', 'Posts', 'Media'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={tw`flex-1 items-center pb-3 ${
                  selectedTab === tab.toLowerCase() ? 'border-b-2 border-orange-500' : ''
                }`}
                onPress={() => setSelectedTab(tab.toLowerCase())}
              >
                <Text
                  style={tw`text-sm ${
                    selectedTab === tab.toLowerCase() ? 'text-orange-500' : 'text-zinc-400'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={tw`px-4 py-4`}>
            {dummyWorkouts.map((workout) => (
              <View key={workout.id} style={tw`bg-zinc-900 rounded-lg p-4 mb-3`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-white font-semibold`}>{workout.title}</Text>
                  <Text style={tw`text-zinc-400 text-xs`}>{workout.date}</Text>
                </View>
                <Text style={tw`text-orange-500 text-sm mt-1`}>{workout.duration}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default UserProfile;