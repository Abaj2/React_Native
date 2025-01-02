import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import {
  Bars3CenterLeftIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { styles, theme } from "../../theme/index";
import TrendingMovies from '../../components2/trendingMovies'
import { useState, useEffect } from "react";
import Carousel from "react-native-snap-carousel";
import MovieList from '../../components2/movieList';
import { useNavigation } from "@react-navigation/native";
import Loading from '../../components2/loading'
import { fetchTrendingMovies } from '../../api/moviedb'
import { fetchUpcomingMovies } from '../../api/moviedb'
import { fetchTopRatedMovies } from '../../api/moviedb'

export default function HomeScreen() {
    const [trending, setTrending] = useState([])
    const [upcoming, setUpcoming] = useState([])
    const [topRated, setTopRated] = useState([])
    const [loading, setLoading] = useState(true)
    const navigation = useNavigation();

    useEffect(() => {
      getTrendingMovies();
      getUpcomingMovies();
      getTopRatedMovies();
    }, [])

    const getTrendingMovies = async () => {
      const data = await fetchTrendingMovies()
   //   console.log('got trending movies: ', data)

      if(data && data.results) setTrending(data.results);
      setLoading(false);
    }


    const getUpcomingMovies = async () => {
      const data = await fetchUpcomingMovies()
      //console.log('got upcoming movies: ', data)

      if(data && data.results) setUpcoming(data.results);

    }


    const getTopRatedMovies = async () => {
      const data = await fetchTopRatedMovies()
      console.log('got top rated movies: ', data)

      if(data && data.results) setTopRated(data.results);
      setLoading(false);
    }
  return (
    <View style={tw`flex-1 bg-gray-900`}>
      {/* search bar and logo */}
      <SafeAreaView style={tw`${Platform.OS === "ios" ? `-mb-2` : `mb-3`}`}>
        <StatusBar style="light" />
        <View style={tw`flex-row justify-between items-center mx-4`}>
          <Bars3CenterLeftIcon size="30" strokeWidth={2} color="white" />
          <Text style={tw`text-white text-3xl font-bold`}>
            <Text style={styles.text}>M</Text>ovies
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <MagnifyingGlassIcon size="30" strokeWidth={2} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {
        loading ? (
          <Loading />
        ) : (
          <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {/* Trending movies carousel */}
          { trending.length > 0 && <TrendingMovies data={trending} />}
          {/* upcoming movies row */}
          <MovieList title="Upcoming" data={upcoming} />
          {/* upcoming movies row */}
          <MovieList title="Top Rated" data={topRated} />
          
  
        </ScrollView>

        )
      }
    </View>
  );
}
