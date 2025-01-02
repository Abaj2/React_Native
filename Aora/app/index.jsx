import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from '../components/CustomButton'
import { Redirect, router } from "expo-router";

export default function App() {
  return (
    <SafeAreaView
      style={{
        backgroundColor: "#161622",
        height: "100%",
      }}
    >
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            paddingHorizontal: 16,
          }}
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            style={{
              width: 130,
              height: 84,
            }}
          ></Image>
          <Image
            source={images.cards}
            resizeMode="contain"
            style={{
              maxWidth: 380,
              width: "100%",
              height: 300,
            }}
          ></Image>

          <View
            style={{
              position: "relative",
              marginTop: 5,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Discover Endless Possibilities with{" "}
              <Text
                style={{
                  color: "rgb(255, 142, 1)",
                }}
              >
                Aora
              </Text>
            </Text>
            <Image
              source={images.path}
              resizeMode="contain"
              style={{
                width: 136,
                height: 15,
                position: "absolute",
                bottom: -10,
                right: 64,
              }}
            ></Image>
          </View>
          <Text style={{
            fontSize: 14,
            fontFamily: 'Poppins-Regular',
            color: 'rgb(240, 240, 240)',
            marginTop: 7,
            textAlign: 'center',
          }}>
            Where creativity meets innovation: embark on a journey of limitless
            exploration
          </Text>
          <CustomButton title="Continue with Email" containerStyles={{
            width: '100%',
            marginTop: 7,
          }} handlePress={() => router.push('/(auth)/sign-in')}
          />
        </View>
        
      </ScrollView>
      <StatusBar backgroundColor="#161622" style='light'>

      </StatusBar>
      
    </SafeAreaView>
  );
}
