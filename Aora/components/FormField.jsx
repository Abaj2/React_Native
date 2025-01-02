import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { icons } from '../constants'

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  return (
    <View
      style={{
        marginBottom: 8,
        ...otherStyles,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: "gray",
          fontFamily: "Poppins-Medium",
        }}
      >
        {title}
      </Text>
      <View
        style={{
          borderWidth: 2,
          flexDirection: 'row',
          borderColor: isFocused ? "orange" : "black",
          width: "100%",
          height: 64,
          paddingHorizontal: 16,
          backgroundColor: "#1f1b2e",
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            color: "white",
            fontFamily: "Poppins-SemiBold",
          }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image source={icons.eye} style={{
              width: 24,
              height: 24,
              resizeMode:'contain',
            }} /> 

          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
