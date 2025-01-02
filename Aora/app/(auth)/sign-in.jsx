import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, useRouter } from "expo-router";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { use } from "react";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testColor, setTestColor] = useState("red");

  const submit = () => {
    console.log("submitted")
  };

  const router = useRouter();
  const toSignUpPage = () => {
    console.log("going to sign up page")
    router.push("/sign-up");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView
      style={{
        backgroundColor: "#161622",
        height: "100%",
      }}
    >
      <ScrollView>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            minHeight: "85%",
            paddingHorizontal: 16,
            marginVertical: 24,
          }}
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            style={{
              width: 115,
              height: 35,
            }}
          />
          <Text
            style={{
              fontSize: 20,
              color: "white",
              fontWeight: "semibold",
              marginTop: 30,
              fontFamily: "Poppins-Semibold",
            }}
          >
            Log into Aora
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles={{
              marginTop: 7,
              keyboardType: "email-address",
            }}
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles={{
              marginTop: 7,
            }}
          />
          <CustomButton
            title="Sign in"
            handlePress={submit}
            isLoading={isSubmitting}
            containerStyles={{
              marginTop: 7,
            }}
          ></CustomButton>
          <View
            style={{
              justifyContent: "center",
              paddingTop: 20,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Text
              style={{
                color: "gray",
                fontFamily: "Poppins-Regular",
              }}
            >
              Don't have account?
            </Text>

            <TouchableOpacity onPress={() => toSignUpPage}>
            <Text
              style={{
                zIndex: 999,
                fontFamily: "Poppins-SemiBold",
                color: "rgb(255, 142, 1)",
                backgroundColor: 'red',
              }}
            >
              Sign up
            </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default SignIn;

const styles = StyleSheet.create({});
