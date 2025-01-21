import React, { useState } from "react";
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
const { width, height } = Dimensions.get("window");

const Progress = ({ isDarkMode, userData, skillsData }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

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
    const displayDates = dates.map((date, index) => {
      if (dates.length > 4) {
        if (
          index === 0 ||
          index === dates.length - 1 ||
          index === Math.floor(dates.length / 2)
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
          data: [...values, goal],
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

    const decorator = () => {
      if (selectedDataPoint?.progressionId !== progressionId) return null;

      const tooltipWidth = 80; // Approximate width of the tooltip
      const tooltipHeight = 40; // Approximate height of the tooltip
      const offset = 10; // Space between the tooltip and the data point

      // Calculate tooltip position
      const tooltipX = selectedDataPoint.x + offset;
      const tooltipY = selectedDataPoint.y - tooltipHeight / 2;

      return selectedDataPoint?.progressionId === progressionId ? (
        <View
          style={[
            tw`items-center justify-center absolute bg-gray-800 rounded-lg border border-orange-500`,
            {
              width: width * 0.3,
              height: height * 0.05,
              left: tooltipX,
              top: tooltipY,
              width: tooltipWidth,
            },
          ]}
          key="tooltip"
        >
          <Text style={tw`self-center text-white text-center`}>
            Value: {selectedDataPoint.value}
          </Text>
          <Text style={tw`text-white text-center text-xs`}>
            {formatDate(dates[selectedDataPoint.index])}
          </Text>
        </View>
      ) : null;
    };

    return (
      <View style={tw`mt-4 items-center`}>
        <LineChart
          data={{
            ...chartData,
            datasets: [
              {
                ...chartData.datasets[0],
                data: values,
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
          decorator={decorator}
          onDataPointClick={({ value, dataset, getColor, x, y, index }) => {
            setSelectedDataPoint({
              value,
              x,
              y,
              index,
              progressionId,
            });
          }}
        />
      </View>
    );
  };

  const handleToggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
    setSelectedDataPoint(null);
  };

  const getProgressColour = (progress) => {
    if (progress > 0 && progress < 30) {
      return "red";
    } else if (progress > 30 && progress < 65) {
      return "yellow";
    } else {
      return "green";
    }
  };

  const getTrendingArrowColour = (progress) => {
    if (progress < 0) {
      return "red";
    } else if (progress === 0) {
      return "orange";
    } else {
      return "lightgreen";
    }
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
                            <View
                              style={tw`bg-${getProgressColour(
                                Math.round(
                                  (item.current[index][
                                    item.current[index].length - 1
                                  ] /
                                    currentGoal) *
                                    100
                                )
                              )}-900 rounded-xl`}
                            >
                              <Text
                                style={tw`ml-3 mt-1 mb-1 mr-3 text-${getProgressColour(
                                  Math.round(
                                    (item.current[index][
                                      item.current[index].length - 1
                                    ] /
                                      currentGoal) *
                                      100
                                  )
                                )}-500`}
                              >
                                Progress:
                                <Text
                                  style={tw`text-${getProgressColour(
                                    Math.round(
                                      (item.current[index][
                                        item.current[index].length - 1
                                      ] /
                                        currentGoal) *
                                        100
                                    )
                                  )}-500`}
                                >
                                  {" "}
                                  {Math.round(
                                    (item.current[index][
                                      item.current[index].length - 1
                                    ] /
                                      currentGoal) *
                                      100
                                  )}
                                  %
                                </Text>
                              </Text>
                            </View>
                          </View>

                          <ChartComponent
                            progression={progression}
                            dates={item.date_formatted[index]}
                            values={item.current[index]}
                            goal={currentGoal}
                            progressionId={progressionId}
                          />

                          <View style={tw`mt-2 flex-row justify-between`}>
                            <View style={tw`flex-row`}>
                              <Icon
                                name={
                                  item.current[index][
                                    item.current[index].length - 1
                                  ] -
                                    item.current[index][0] >
                                  0
                                    ? "trending-up"
                                    : item.current[index][
                                        item.current[index].length - 1
                                      ] -
                                        item.current[index][0] <
                                      0
                                    ? "trending-down"
                                    : "minus"
                                }
                                size={16}
                                color={getTrendingArrowColour(
                                  item.current[index][
                                    item.current[index].length - 1
                                  ] - item.current[index][0]
                                )}
                              />
                              <Text style={tw`ml-2 text-white`}>
                                {item.current[index][
                                  item.current[index].length - 1
                                ] -
                                  item.current[index][0] >
                                0
                                  ? "+"
                                  : ""}
                                {item.current[index][
                                  item.current[index].length - 1
                                ] - item.current[index][0]}{" "}
                                Since Start
                              </Text>
                            </View>

                            <View>
                              <Text style={tw`ml-2 text-gray-400`}>
                                Goal: {currentGoal}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={tw`w-full h-0.5 mt-4 bg-gray-700`}
                          ></View>
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
