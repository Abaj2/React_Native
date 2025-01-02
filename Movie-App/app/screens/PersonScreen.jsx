import {
  View,
  Image,
  Text,
  Dimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import tw from "twrnc";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { styles, theme } from "../../theme/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieList from "../../components2/movieList";
import Loading from "../../components2/loading";
import { fetchPersonDetails, fetchPersonMovies, image342 } from "@/api/moviedb";
import fallbackProfilePic from '../../assets/images/fallbackProfilePic.png'

var { width, height } = Dimensions.get("window");
const ios = Platform.OS == "ios";
const verticalMargin = ios ? "" : "my-3";

export default function PersonScreen() {
  const {params: item} = useRoute();
  const navigation = useNavigation();
  const [isFavourite, toggleFavourite] = useState(false);
  const [personMovies, setPersonMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [person, setPerson] = useState({})
  useEffect(() => {
    setLoading(true);
    //console.log('person: ', item)
    getPersonDetails(item.person.id);
    getPersonMovies(item.person.id);

  }, [item])

  const getPersonDetails = async id => {
    const data = await fetchPersonDetails(id);
    //console.log('got person details: ', data)'
    if(data) setPerson(data);
    setLoading(false);
  }

  const getPersonMovies = async id => {
    const data = await fetchPersonMovies(id);
    //console.log('got person movies: ', data)
    if(data && data.cast) setPersonMovies(data);
    setLoading(false);
  }

  return (
    <ScrollView
      style={tw`flex-1 bg-neutral-900`}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* back button */}
      <SafeAreaView
        style={tw`z-20 w-full flex-row justify-between items-center px-4 ${verticalMargin}`}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[tw`rounded-xl p-1`, styles.background]}
        >
          <ChevronLeftIcon size="28" strokeWidth={2.5} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleFavourite(!isFavourite)}>
          <HeartIcon size="35" color={isFavourite ? "red" : "white"} />
        </TouchableOpacity>
      </SafeAreaView>
      {/* person details */}
      {loading ? (
        <Loading />
      ) : (
        <View>
          <View
            style={[
              {
                shadowColor: "gray",
                shadowRadius: 40,
                shadowOffset: { width: 0, height: 5 },
                opacity: 1,
              },
              tw`flex-row justify-center`,
            ]}
          >
            <View
              style={tw`items-center rounded-full overflow-hidden h-72 w-72 border-2 border-neutral-500`}
            >
              <Image
                source={{uri: image342(person?.profile_path || fallbackProfilePic)}}
                style={{ height: height * 0.43, width: width * 0.74 }}
              />
            </View>
          </View>
          <View style={tw`mt-6`}>
            <Text style={tw`text-3xl text-white font-bold text-center`}>
              {
                person?.name
              }
            </Text>
            <Text style={tw`text-base text-neutral-500 text-center`}>
              {
                person?.place_of_birth
              }
            </Text>
            <View
              style={tw`mx-3 p-4 mt-6 flex-row justify-between items-center bg-neutral-700 rounded-full`}
            >
              <View
                style={tw`border-r-2 border-r-neutral-400 px-2 items-center `}
              >
                <Text style={tw`text-white font-semibold`}>Gender</Text>
                <Text style={tw`text-neutral-300 text-sm`}>{person?.gender==1? 'Female' : 'Male'}</Text>
              </View>
              <View
                style={tw`border-r-2 border-r-neutral-400 px-2 items-center `}
              >
                <Text style={tw`text-white font-semibold`}>Birthday</Text>
                <Text style={tw`text-neutral-300 text-sm`}>{person?.birthday}</Text>
              </View>
              <View
                style={tw`border-r-2 border-r-neutral-400 px-2 items-center `}
              >
                <Text style={tw`text-white font-semibold`}>Known for</Text>
                <Text style={tw`text-neutral-300 text-sm`}>{person?.known_for_department}</Text>
              </View>
              <View style={tw`0 px-2 items-center `}>
                <Text style={tw`text-white font-semibold`}>Popularity</Text>f
                <Text style={tw`text-neutral-300 text-sm`}>{person?.popularity?.toFixed(2)} %</Text>
              </View>
            </View>
          </View>
          <View style={tw`my-6 mx-4 mb-2`}>
            <Text style={tw`text-white text-lg`}>Biography</Text>
            <Text style={tw`text-neutral-400 tracking-wide`}>
              {
                person?.biography || 'N/A'
              }
            </Text>
          </View>
          {/* movies */}
        <MovieList title={"Movies"} hideSeeAll={true} data={personMovies} />
        </View>
      )}
    </ScrollView>
  );
}
