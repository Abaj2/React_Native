import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import tw from "twrnc";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { styles, theme } from "../../theme/index";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Cast from "../../components2/cast";
import MovieList from "@/components2/movieList";
import Loading from "../../components2/loading";
import { fetchMovieCredits, fetchMovieDetails, fetchSimilarMovies, image500 } from "../../api/moviedb";

var { width, height } = Dimensions.get("window");
const ios = Platform.OS === "ios";
const topMargin = ios ? "" : "mt-3";

const MovieScreen = () => {
  let movieName = "Ant-Man and the Wasp: Quantumania";
  const { params: item } = useRoute();
  const [isFavourite, toggleFavourite] = useState(false);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [movie, setMovie] = useState({});
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //console.log('itemid: ', item.item.id);
    setLoading(true);
    getMovieDetails(item.item.id);
    getMovieCredits(item.item.id);
    getSimilarMovies(item.item.id);
  }, [item]);

  const getMovieDetails = async (id) => {
    const data = await fetchMovieDetails(id);
    //console.log('got movie details: ', data);
    if (data) setMovie(data);
    setLoading(false);
  };

  const getMovieCredits = async (id) => {
    const data = await fetchMovieCredits(id);
    //console.log('got credits: ', data)
    if (data && data.cast) setCast(data.cast);
  }
  const getSimilarMovies = async (id) => {
    const data = await fetchSimilarMovies(id);
    console.log('got similar movies: ', data)
    if (data && data.results) setSimilarMovies(data.results);
    console.log(similarMovies)
  }
  return (
    <ScrollView
      contentContainerStyle={[tw`bg-neutral-900`, { paddingBottom: 20 }]}
    >
      {/* back button and movie poster */}
      <View style={tw`w-full`}>
        <SafeAreaView
          style={tw`absolute z-20 w-full flex-row justify-between items-center px-4 ${topMargin}`}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[tw`rounded-xl p-1`, styles.background]}
          >
            <ChevronLeftIcon size="28" strokeWidth={2.5} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavourite(!isFavourite)}>
            <HeartIcon
              size="35"
              color={isFavourite ? theme.background : "white"}
            />
          </TouchableOpacity>
        </SafeAreaView>
        {loading ? (
          <Loading />
        ) : (
          <View>
            <Image
              source={{ uri: image500(movie?.poster_path) }}
              style={{ width, height: height * 0.55 }}
            />
            <LinearGradient
              colors={[
                "transparent",
                "rgba(23,23,23,0.8)",
                "rgba(23,23,23, 1)",
              ]}
              style={[{ width, height: height * 0.4 }, tw`absolute bottom-0`]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            ></LinearGradient>
          </View>
        )}
      </View>
      {/* movie details */}
      <View style={[{ marginTop: -(height * 0.09) }, tw`space-y-3`]}>
        <Text
          style={tw`text-white text-center text-3xl font-bold tracking-wider mb-3`}
        >
          {movie?.title}
        </Text>
        {movie?.id ? (
          <Text
            style={tw`text-neutral-400 font-semibold text-base text-center mb-3`}
          >
            {movie?.status} • {movie?.release_date.split("-")[0]} •{" "}
            {movie?.runtime} min
          </Text>
        ) : null}

        <View style={tw`flex-row justify-center mx-4 space-x-2`}>
          {
            movie?.genres?.map((genre, index) => {
              let showDot = index + 1 != movie.genres.length
              return (
                <Text
                style={tw`text-neutral-400 font-semibold text-base text-center mb-3`}
              >
                {genre?.name} {showDot ? "•": null}
              </Text>
              )
            })            
          }
           {/*<Text
            style={tw`text-neutral-400 font-semibold text-base text-center mb-3`}
          >
            Action •
          </Text>
          <Text
            style={tw`text-neutral-400 font-semibold text-base text-center mb-3`}
          >
            Thrill •
          </Text>
          <Text
            style={tw`text-neutral-400 font-semibold text-base text-center mb-3`}
          >
            Comedy
          </Text> */}
        </View>
        <Text style={tw`text-neutral-400 mx-4 tracking-wide`}>
          {movie?.overview}
        </Text>
      </View>
      <Cast navigation={navigation} cast={cast} />
      <MovieList
        title="Similar Movies"
        hideSeeAll={true}
        data={similarMovies}
      />
    </ScrollView>
  );
};

export default MovieScreen;
