import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, Text, SafeAreaView } from "react-native";


export default function Home() {
  const route = useRoute();
  const { username } = route.params;

  return (
    <SafeAreaView>
      <Text>Welcome {username}</Text>
    </SafeAreaView>
  )
}