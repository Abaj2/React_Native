import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { LineChart } from "react-native-chart-kit";

const Progress = ({ isDarkMode, userData, skillsData }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [animatedPoints, setAnimatedPoints] = useState({});

  const formatDate = (dateStr) => {
    return dateStr.split(" ")[0];
  };

  const ChartComponent = ({
    progression,
    dates,
    values,
    goal,
    progressionId,
  }) => {
    useEffect(() => {
      if (openDropdownId === progressionId) {
        // Reset animation
        setAnimatedPoints((prev) => ({
          ...prev,
          [progressionId]: [values[0]],
        }));

        let currentIndex = 1;
        const interval = setInterval(() => {
          if (currentIndex <= values.length) {
            setAnimatedPoints((prev) => ({
              ...prev,
              [progressionId]: values.slice(0, currentIndex),
            }));
            currentIndex++;
          } else {
            clearInterval(interval);
          }
        }, 100); // Add a new point every 100ms

        return () => clearInterval(interval);
      }
    }, [openDropdownId, progressionId, values]);

    // Get current animated points or show all points if animation is done
    const currentPoints = animatedPoints[progressionId] || values;
    const currentDates = dates.slice(0, currentPoints.length);

    // Only show some labels if there are many points
    const displayDates = currentDates.map((date, index) => {
      if (currentDates.length > 4) {
        if (
          index === 0 ||
          index === currentDates.length - 1 ||
          index === Math.floor(currentDates.length / 2)
        ) {
          return formatDate(date);
        }
        return "";
      }
      return formatDate(date);
    });

    const chartData = {
      labels: displayDates,
      datasets: [
        {
          data: [...currentPoints, goal], // Add goal to ensure proper scaling
          color: (opacity = 1) => `rgba(255, 126, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const chartConfig = {
      backgroundColor: "#18181b",
      backgroundGradientFrom: "#18181b",
      backgroundGradientTo: "#18181b",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726",
      },
      max: goal,
      min: 0,
    };

    return (
      <View style={tw`mt-4 items-center`}>
        <LineChart
          data={{
            ...chartData,
            datasets: [
              {
                ...chartData.datasets[0],
                data: currentPoints, // Don't include goal in visible points
              },
            ],
          }}
          width={Dimensions.get("window").width - 42}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={tw`rounded-xl`}
          withDots={true}
          withShadow={false}
          withVerticalLines={true}
          withHorizontalLines={true}
          yAxisSuffix=""
          yAxisInterval={1}
          segments={4}
          fromZero={true}
        />
      </View>
    );
  };

  const handleToggleDropdown = (id) => {
    setOpenDropdownId((prevId) => {
      if (prevId === id) {
        setAnimatedPoints({}); // Reset animations when closing
        return null;
      }
      return id;
    });
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`items-center pb-5`}>
        {skillsData.map((item) => {
          const hasValidProgressions = item.progressions.some(
            (_, index) => item.current[index]?.length > 1
          );

          if (!hasValidProgressions) return null;

          return (
            <TouchableOpacity
              activeOpacity={1}
              style={tw`w-full`}
              onPress={() => handleToggleDropdown(item.id)}
              key={item.id}
            >
              <View style={tw`w-full px-5 mb-4`}>
                <View
                  style={tw`w-full bg-[#18181b] border border-orange-500 rounded-2xl p-5`}
                >
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={[tw`font-bold text-white`, { fontSize: 18 }]}>
                      {item.skill}
                    </Text>
                    <Icon
                      name={
                        openDropdownId === item.id
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color="#9ca3af"
                    />
                  </View>

                  {openDropdownId === item.id &&
                    item.progressions.map((progression, index) => {
                      if (
                        !item.current[index] ||
                        item.current[index].length <= 1
                      ) {
                        return null;
                      }

                      const progressionId = `${item.id}-${index}`;
                      const currentGoal =
                        item.goal[index][item.goal[index].length - 1];

                      return (
                        <View key={index} style={tw`mt-4`}>
                          <View
                            style={tw`flex-row justify-between items-center`}
                          >
                            <Text style={tw`text-white font-medium text-lg`}>
                              {progression}
                            </Text>
                            <Text style={tw`text-gray-400`}>
                              Goal: {currentGoal}
                            </Text>
                          </View>

                          <ChartComponent
                            progression={progression}
                            dates={item.date_formatted[index]}
                            values={item.current[index]}
                            goal={currentGoal}
                            progressionId={progressionId}
                          />

                          <View style={tw`mt-2 flex-row justify-between`}>
                            <Text style={tw`text-gray-400`}>
                              Current:{" "}
                              {
                                item.current[index][
                                  item.current[index].length - 1
                                ]
                              }
                            </Text>
                            <View style={tw`flex-row`}>
                              <Icon
                                name="trending-up"
                                size={16}
                                color="orange"
                              />
                              <Text style={tw`ml-3 text-gray-400`}>
                                Progress:{" "}
                                {Math.round(
                                  (item.current[index][
                                    item.current[index].length - 1
                                  ] /
                                    currentGoal) *
                                    100
                                )}
                                %
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;
