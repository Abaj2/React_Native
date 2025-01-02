import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, useRouter } from "expo-router";

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const submit = () => {};

  return (
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
            Sign up to Aora
          </Text>
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles={{
              marginTop: 10,
            }}
          />

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
              Already have an account?
            </Text>
            <Link href="/sign-in" style={{
              fontFamily: 'Poppins-SemiBold',
              color: "rgb(255, 142, 1)",

            }}>Sign in</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
