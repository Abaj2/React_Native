import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const UserProfileSkill = () => {
  const skills = [
    {
      category: "Strength Training",
      skills: [
        { name: "Deadlift", level: "Advanced", experience: "3 years" },
        { name: "Bench Press", level: "Intermediate", experience: "2 years" },
        { name: "Squats", level: "Expert", experience: "4 years" }
      ]
    },
    {
      category: "Cardio",
      skills: [
        { name: "Running", level: "Intermediate", experience: "2 years" },
        { name: "HIIT", level: "Advanced", experience: "3 years" },
        { name: "Swimming", level: "Beginner", experience: "6 months" }
      ]
    },
    {
      category: "Flexibility",
      skills: [
        { name: "Yoga", level: "Intermediate", experience: "1.5 years" },
        { name: "Dynamic Stretching", level: "Advanced", experience: "2 years" }
      ]
    }
  ];

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-500';
      case 'intermediate':
        return 'bg-green-500';
      case 'advanced':
        return 'bg-purple-500';
      case 'expert':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <View style={tw`px-4`}>
      {skills.map((category, index) => (
        <View key={index} style={tw`mb-6`}>
          <Text style={tw`text-orange-500 text-lg font-bold mb-3`}>
            {category.category}
          </Text>
          
          {category.skills.map((skill, skillIndex) => (
            <View 
              key={skillIndex} 
              style={tw`bg-zinc-800 rounded-lg p-4 mb-3`}
            >
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-white text-base font-semibold`}>
                  {skill.name}
                </Text>
                <View style={tw`${getLevelColor(skill.level)} px-3 py-1 rounded-full`}>
                  <Text style={tw`text-white text-sm`}>
                    {skill.level}
                  </Text>
                </View>
              </View>
              <Text style={tw`text-gray-400 mt-2`}>
                Experience: {skill.experience}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default UserProfileSkill;