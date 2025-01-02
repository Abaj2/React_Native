import {
  View,
  Image,
  Text,
  Dimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useCallback } from "react";
import tw from "twrnc";
import { ChevronLeftIcon, XMarkIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { styles, theme } from "../../theme/index";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieList from "../../components2/movieList";
import Loading from "../../components2/loading";
import { debounce } from "lodash"; 
import { image185, searchMovies } from "@/api/moviedb";

const { width, height } = Dimensions.get("window");

export default function SearchScreen() {
  const navigation = useNavigation();
  const [results, setResults] = useState([1, 2, 3, 4]);
  const [loading, setLoading] = useState(false);

  const handleSearch = value => {
    if(value && value.length>2) {
      setLoading(true);
      searchMovies({
        query: value,
        include_adult: 'false',
        language: 'en-US', 
        page: '1'
      }).then(data => {
        setLoading(false);
        console.log('got movies: ', data)
        if(data && data.results) setResults(data.results);
      })
    } else {
      setLoading(false);
      setResults([])
    }
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

  return (
    <SafeAreaView style={tw`bg-neutral-800 flex-1`}>
      <View
        style={tw`mx-4 mb-3 flex-row justify-between items-center border border-neutral-500 rounded-full`}
      >
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Search Movie"
          placeholderTextColor={"lightgray"}
          style={tw`pb-1 pl-6 flex-1 text-base font-semibold text-white tracking-wider`}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={tw`rounded-full p-3 m-1 bg-neutral-500`}
        >
          <XMarkIcon size="25" color="white" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <Loading />
      ) : results.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          style={tw`mb-3`}
        >
          <Text style={tw`text-white font-semibold ml-1`}>
            Results ({results.length})
          </Text>
          <View style={tw`flex-row justify-between flex-wrap`}>
            {results.map((item, index) => {
              return (
                <TouchableWithoutFeedback
                  key={index}
                  onPress={() => navigation.push("Movie", { item })}
                >
                  <View style={tw`mb-4`}>
                    <Image
                      style={[
                        tw`rounded-3xl`,
                        { width: width * 0.44, height: height * 0.3 },
                      ]}
                      //source={require("../../assets/images/moviePoster2.png")}
                      source={{uri: image185(item?.poster_path)}}
                    ></Image>
                    <Text style={tw`text-neutral-300 ml-1`}>
                      {item?.title.length > 22
                        ? item?.title.slice(0, 21) + "..."
                        : item?.title}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View style={tw`flex-row justify-center`}>
          <Text style={tw`text-white text-lg font-semibold`}>
            No Results Found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
