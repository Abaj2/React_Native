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
const { width } = Dimensions.get("window");

const Progress = ({ isDarkMode, skillsData }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const formatDate = (dateStr) => dateStr.split(" ")[0];

  const ChartComponent = ({ progression, dates, values, goal, progressionId }) => {
    const displayDates = dates.map((date, index) => {
      if (dates.length > 4) {
        if (index === 0 || index === dates.length - 1 || index === Math.floor(dates.length / 2)) {
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
          data: values,
          color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    const chartConfig = {
      backgroundColor: "#18181b",
      backgroundGradientFrom: "#18181b",
      backgroundGradientTo: "#18181b",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: "#f97316",
        fill: "#18181b",
      },
      propsForLabels: {
        fontSize: 11,
        fontFamily: "System",
      },
      strokeWidth: 2,
      max: goal * 1.1,
      min: Math.max(0, Math.min(...values) * 0.9),
      formatYLabel: (value) => Math.round(value).toString(),
    };

    const decorator = () => {
      if (selectedDataPoint?.progressionId !== progressionId) return null;

      const tooltipWidth = 90;
      const tooltipHeight = 45;
      const offset = 12;

      const tooltipX = selectedDataPoint.x - tooltipWidth / 2;
      const tooltipY = selectedDataPoint.y - tooltipHeight - offset;

      return (
        <View
          style={[
            tw`absolute items-center justify-center bg-zinc-800/95 rounded-lg border border-orange-500/50 shadow-lg`,
            {
              width: tooltipWidth,
              height: tooltipHeight,
              left: tooltipX,
              top: tooltipY,
            },
          ]}
          key="tooltip"
        >
          <Text style={tw`text-white font-medium text-center`}>
            {selectedDataPoint.value}
          </Text>
          <Text style={tw`text-zinc-300 text-xs text-center`}>
            {formatDate(dates[selectedDataPoint.index])}
          </Text>
        </View>
      );
    };

    return (
      <View style={tw`mt-4 w-full items-center justify-center`}>
        <View style={tw`bg-zinc-900 rounded-xl p-4 shadow-lg w-full items-center justify-center`}>
          <LineChart
            data={chartData}
            width={width - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={tw`rounded-xl`}
            withDots={true}
            withShadow={false}
            withVerticalLines={true}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            yAxisSuffix=""
            yAxisInterval={1}
            segments={5}
            fromZero={false}
            decorator={decorator}
            onDataPointClick={({ value, x, y, index }) => {
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
      </View>
    );
  };

  const handleToggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
    setSelectedDataPoint(null);
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return ["bg-red-900/50", "text-red-500"];
    if (progress < 65) return ["bg-amber-900/50", "text-amber-500"];
    return ["bg-emerald-900/50", "text-emerald-500"];
  };

  const getTrendingData = (currentValues) => {
    const change = currentValues[currentValues.length - 1] - currentValues[0];
    let icon = "minus";
    let color = "text-orange-500";

    if (change > 0) {
      icon = "trending-up";
      color = "text-emerald-500";
    } else if (change < 0) {
      icon = "trending-down";
      color = "text-red-500";
    }

    return { icon, color, change };
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ScrollView
        contentContainerStyle={tw`px-4 py-6`}
        showsVerticalScrollIndicator={false}
      >
        {skillsData.map((item) => {
          const hasValidProgressions = item.progressions.some(
            (_, index) => item.current[index]?.length > 1
          );

          if (!hasValidProgressions) return null;

          return (
            <View key={item.id} style={tw`border border-orange-500 rounded-2xl mb-4`}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggleDropdown(item.id)}
                style={tw`bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800`}
              >
                <View style={tw`p-4`}>
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw`font-bold text-white text-lg`}>
                      {item.skill}
                    </Text>
                    <Icon
                      name={openDropdownId === item.id ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#a1a1aa"
                    />
                  </View>

                  {openDropdownId === item.id &&
                    item.progressions.map((progression, index) => {
                      if (!item.current[index] || item.current[index].length <= 1) {
                        return null;
                      }

                      const progressionId = `${item.id}-${index}`;
                      const currentGoal = item.goal[index][item.goal[index].length - 1];
                      const currentValue = item.current[index][item.current[index].length - 1];
                      const progress = Math.round((currentValue / currentGoal) * 100);
                      const [bgColor, textColor] = getProgressColor(progress);
                      const trending = getTrendingData(item.current[index]);

                      return (
                        <View key={index}>
                          <View style={tw`mt-6`}>
                            <View style={tw`flex-row justify-between items-center`}>
                              <Text style={tw`text-white font-medium text-base`}>
                                {progression}
                              </Text>
                              <View style={tw`${bgColor} rounded-full px-4 py-1.5`}>
                                <Text style={tw`${textColor} font-medium`}>
                                  {progress}% Complete
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

                            <View style={tw`mt-4 flex-row justify-between items-center`}>
                              <View style={tw`flex-row items-center`}>
                                <Icon
                                  name={trending.icon}
                                  size={16}
                                  style={tw`${trending.color}`}
                                />
                                <Text style={tw`ml-2 text-zinc-300`}>
                                  {trending.change > 0 ? "+" : ""}
                                  {trending.change} Since Start
                                </Text>
                              </View>
                              <Text style={tw`text-zinc-400`}>
                                Goal: {currentGoal}
                              </Text>
                            </View>
                          </View>
                          {index < item.progressions.length - 1 && (
                            <View style={tw`h-px bg-zinc-800 my-6`} />
                          )}
                        </View>
                      );
                    })}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;