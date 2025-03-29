import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  ImageBackground,
} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/Feather";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const Progress = ({ isDarkMode, skillsData, progressId }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const skillsDataFormatted = skillsData
    .map((skill) => ({
      ...skill,
      creationDate: Math.min(
        ...skill.date.map((progressionDates) =>
          progressionDates.length > 0 ? Math.min(...progressionDates) : 0
        )
      ),
    }))
    .sort((a, b) => a.creationDate - b.creationDate);

  console.log("Skills formatted", skillsDataFormatted);

  const formatDate = (dateStr) => dateStr.split(" ")[0];

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
          data: values,
          color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    const chartConfig = {
      backgroundColor: "transaparent",
      backgroundGradientFrom: "",
      backgroundGradientTo: "",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "darkorange",
        fill: "#000000",
      },
      propsForLabels: {
        fontSize: 11,
        fontFamily: "System",
      },
      strokeWidth: 3,
      max: goal * 1.1,
      min: Math.max(0, Math.min(...values) * 0.9),
      formatYLabel: (value) => Math.round(value).toString(),
      fillShadowGradient: "#ffa500",
      fillShadowGradientOpacity: 0.1,
    };

    const decorator = () => {
      if (selectedDataPoint?.progressionId !== progressionId) return null;

      return (
        <View
          style={[
            tw`absolute items-center justify-center bg-black rounded-lg border-2 border-orange-400 px-4 py-3`,
            {
              transform: [{ translateX: 20 }, { translateY: 40 }],
              shadowColor: "#ffa500",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
          ]}
          key="tooltip"
        >
          <Text style={tw`text-orange-400 text-sm mr-1`}>
            {selectedDataPoint.value}
          
          </Text>
          <Text style={tw`text-orange-400 text-xs text-center mt-1`}>
            {formatDate(dates[selectedDataPoint.index])}
          </Text>
        </View>
      );
    };

    return (
      <View
        style={tw`mt-6 mr-10 rounded-2xl self-center items-center overflow-hidden`}
      >
        {/* <LinearGradient
          colors={["#1a1a1a", "#000000"]}
          style={tw`w-full rounded-2xl`}
        > */}
        <LineChart
          data={chartData}
          width={width - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={tw`rounded-2xl`}
          withDots={true}
          withShadow={false}
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
        {/* </LinearGradient> */}
      </View>
    );
  };

  const handleToggleDropdown = (id) => {
    console.log(id);
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
    setSelectedDataPoint(null);
  };

  useEffect(() => {
    console.log(progressId);
    if (progressId) {
      handleToggleDropdown(progressId);
    }
  }, [progressId]);

  const getProgressColor = (progress) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 65) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getTrendingData = (currentValues) => {
    const change = currentValues[currentValues.length - 1] - currentValues[0];
    let icon = "minus";
    let color = "text-orange-500";
    let bgColor = "bg-orange-500/20";

    if (change > 0) {
      icon = "trending-up";
      color = "text-emerald-500";
      bgColor = "bg-emerald-500/20";
    } else if (change < 0) {
      icon = "trending-down";
      color = "text-red-500";
      bgColor = "bg-red-500/20";
    }

    return { icon, color, bgColor, change };
  };

  return (
    <SafeAreaView style={[tw`flex-1 self-center`, { width: width }]}>
      <ScrollView
        contentContainerStyle={tw`py-6`}
        showsVerticalScrollIndicator={false}
      >
        {skillsData.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center mt-20`}>
            <Icon
              name="package"
              size={60}
              color="#ffa500"
              style={tw`opacity-50 mb-4`}
            />
            <Text style={tw`text-orange-500 text-xl font-bold mb-2`}>
              No Skills Added Yet
            </Text>
            <Text style={tw`text-zinc-500 text-center px-10 mb-4`}>
              Start creating skills to see detailed progress reports and
              analytics.
            </Text>
          </View>
        ) : (
          skillsDataFormatted.map((item) => {
            const hasValidProgressions = item.progressions.some(
              (_, index) => item.current[index]?.length > 1
            );

            /*  if (!hasValidProgressions)
              return (
                <View
                  key={item.id}
                  style={[
                    tw`mb-4 border border-zinc-700 self-center mx-5 rounded-2xl overflow-hidden`,
                    {
                      width: width * 0.95,
                      shadowColor: "#ffa500",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#1a1a1a", "#000000"]}
                    style={tw`p-1`}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleToggleDropdown(item.id)}
                      style={tw`p-5`}
                    >
                      <View style={tw`flex-row justify-between items-center`}>
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-white text-xl font-extrabold mb-1`}
                          >
                            {item.skill}
                          </Text>
                          <View style={tw`flex-row items-center`}>
                            <Icon name="activity" size={16} color="#ffa500" />
                            <Text style={tw`text-orange-400 text-sm ml-2`}>
                              {`${item.progressions.length} Progression${
                                item.progressions.length > 1 ? "s" : ""
                              }`}
                            </Text>
                          </View>
                        </View>

                        <View style={tw`items-center`}>
                          <AnimatedIcon
                            name="chevron-down"
                            size={24}
                            color="#f97316"
                          />
                        </View>
                      </View>

                      <View
                        style={tw`mt-4 flex-row justify-between items-center`}
                      >
                        <View style={tw`bg-orange-500/10 px-3 py-2 rounded-lg`}>
                          <Text style={tw`text-orange-400 text-sm`}>
                            No progress yet
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ); */
            if (!hasValidProgressions) return null;

            // Calculate overall progress across all progressions
            const progressions = item.progressions.filter(
              (_, index) => item.current[index]?.length > 1
            );
            const overallProgress =
              progressions.length > 0
                ? Math.round(
                    progressions.reduce((sum, _, index) => {
                      const currentValue =
                        item.current[index][item.current[index].length - 1];
                      const currentGoal =
                        item.goal[index][item.goal[index].length - 1];
                      return sum + (currentValue / currentGoal) * 100;
                    }, 0) / progressions.length
                  )
                : 0;

            return (
              <View
                key={item.id}
                style={[
                  tw`mb-4 border border-zinc-800/50 self-center mx-5 rounded-2xl overflow-hidden`,
                  {
                    width: width * 0.95,
  
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    openDropdownId === item.id
                      ? ["#000", "#1a1a1a"]
                      : ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]
                  }
                  style={tw`p-1`}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleToggleDropdown(item.id)}
                    style={tw`p-5`}
                  >
                    <View>
                      {/* Header section with skill name */}
                      <View
                        style={tw`flex-row justify-between items-center mb-5`}
                      >
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-white text-xl font-extrabold mb-1`}
                          >
                            {item.skill}
                          </Text>
                          <View style={tw`flex-row items-center`}>
                            <Icon name="zap" size={14} color="#ffa500" />
                            <Text
                              style={tw`text-orange-400 text-xs ml-1 font-medium`}
                            >
                              {`${progressions.length} Active Progression${
                                progressions.length > 1 ? "s" : ""
                              }`}
                            </Text>
                          </View>
                        </View>

                        {/* Simple percentage display */}
                        <Text style={tw`text-orange-500 font-bold text-lg`}>
                          {Math.round(overallProgress)}%
                        </Text>
                      </View>

                      {/* Progress section */}
                      {openDropdownId !== item.id && (
                        <View style={tw`mt-2`}>
                          {/* Overall progress bar with dropdown arrow */}
                          <View
                            style={tw`ml-1 flex-row justify-between items-center mb-4`}
                          >
                            <View style={tw`flex-1 mr-3`}>
                              <View
                                style={tw`w-full h-3 bg-zinc-800 rounded-full overflow-hidden`}
                              >
                                <LinearGradient
                                  colors={["#ff6b00", "#ffa500"]}
                                  style={[
                                    tw`h-full rounded-full`,
                                    { width: `${overallProgress}%` },
                                  ]}
                                  start={{ x: 0, y: 0.5 }}
                                  end={{ x: 1, y: 0.5 }}
                                />
                              </View>
                            </View>
                            <AnimatedIcon
                              name="chevron-down"
                              size={24}
                              color="#f97316"
                            />
                          </View>

                          {/* Each progression shown with simplified styling */}
                          {progressions.slice(0, 2).map((progression, idx) => {
                            const index =
                              item.progressions.indexOf(progression);
                            const currentGoal =
                              item.goal[index][item.goal[index].length - 1];
                            const currentValue =
                              item.current[index][
                                item.current[index].length - 1
                              ];
                            const progressPercent =
                              (currentValue / currentGoal) * 100;

                            return (
                              <View
                                key={idx}
                                style={tw`mb-4 bg-zinc-900/50 rounded-lg p-3`}
                              >
                                <View
                                  style={tw`flex-row justify-between items-center mb-2`}
                                >
                                  <Text
                                    style={tw`text-zinc-100 font-medium text-sm`}
                                    numberOfLines={1}
                                  >
                                    {progression}
                                  </Text>
                                  <Text
                                    style={tw`text-orange-400 text-xs font-bold`}
                                  >
                                    {currentValue}/{currentGoal}
                                  </Text>
                                </View>

                                <View
                                  style={tw`w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden`}
                                >
                                  <LinearGradient
                                    colors={["#ff6b00", "#ffa500"]}
                                    style={[
                                      tw`h-full rounded-full`,
                                      { width: `${progressPercent}%` },
                                    ]}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                  />
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>

                    {openDropdownId === item.id && (
                      <View style={tw`mt-4`}>
                        <View
                          style={tw`flex-row ml-1 justify-between items-center mb-6`}
                        >
                          <View style={tw`flex-1 mr-1`}>
                            <View
                              style={tw`w-full h-3 bg-zinc-900 rounded-full overflow-hidden`}
                            >
                              <LinearGradient
                                colors={["#ff6b00", "#ffa500"]}
                                style={[
                                  tw`h-full rounded-full`,
                                  { width: `${overallProgress}%` },
                                ]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                              />
                            </View>
                          </View>
                        </View>

                        {item.progressions.map((progression, index) => {
                          if (
                            !item.current[index] ||
                            item.current[index].length <= 1
                          ) {
                            return null;
                          }

                          const progressionId = `${item.id}-${index}`;
                          const currentGoal =
                            item.goal[index][item.goal[index].length - 1];
                          const currentValue =
                            item.current[index][item.current[index].length - 1];
                          const progress = Math.round(
                            (currentValue / currentGoal) * 100
                          );
                          const trending = getTrendingData(item.current[index]);

                          return (
                            <View key={index} style={tw``}>
                              <View
                                style={tw`flex-row justify-between items-center bg-zinc-900/50 rounded-xl p-3 mb-3`}
                              >
                                <View style={tw`flex-1`}>
                                  <Text
                                    style={tw`text-zinc-200 font-bold text-lg mb-1`}
                                  >
                                    {progression}
                                  </Text>
                                </View>
                                <View style={tw`items-center`}>
                                  <View
                                    style={tw`${trending.bgColor} px-2 py-1 rounded-full flex-row items-center`}
                                  >
                                    <Icon
                                      name={trending.icon}
                                      size={12}
                                      style={tw`${trending.color}`}
                                    />
                                    <Text
                                      style={tw`ml-1 ${trending.color} text-xs font-medium`}
                                    >
                                      {trending.change > 0 ? "+" : ""}
                                      {trending.change}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              <View style={tw`flex-row justify-between mb-3`}>
                                <View
                                  style={tw`bg-zinc-900/50 rounded-lg p-2 flex-1 mr-2`}
                                >
                                  <View style={tw`flex-row items-center`}>
                                    
                                    <Text
                                      style={tw`text-orange-500 text-sm font-medium`}
                                    >
                                      Current
                                    </Text>
                                  </View>
                                  <Text
                                    style={tw`text-white text-xl font-bold mt-1`}
                                  >
                                    {currentValue}
                                  </Text>
                                </View>

                                <View
                                  style={tw`bg-zinc-900/50 rounded-lg p-2 flex-1 ml-2`}
                                >
                                  <View style={tw`flex-row items-center`}>
                                    
                                    <Text
                                      style={tw`text-orange-500 text-sm font-medium`}
                                    >
                                      Goal
                                    </Text>
                                  </View>
                                  <Text
                                    style={tw`text-white text-xl font-bold mt-1`}
                                  >
                                    {currentGoal}
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

                              <View style={tw`mb-5 flex-row items-center mt-6`}>
                                <View
                                  style={tw`${trending.bgColor} p-2 rounded-full mr-2`}
                                >
                                  <Icon
                                    name={trending.icon}
                                    size={18}
                                    style={tw`${trending.color}`}
                                  />
                                </View>
                                <View>
                                  <Text
                                    style={tw`${trending.color} font-medium`}
                                  >
                                    {trending.change > 0 ? "+" : ""}
                                    {trending.change} From start
                                  </Text>
                                </View>
                              </View>
                              <View style={tw`border-b border-gray-800 mb-5`} />
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;
