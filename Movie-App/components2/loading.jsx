import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';
import { styles, theme } from "../theme/index";
import tw from "twrnc";

const {width, height} = Dimensions.get('window');
export default function Loading() {
  return (
    <View style={[{ height, width}, tw`absolute flex-row justify-center items-center`]}>
      <Progress.CircleSnail thickness={12} size={160} color={theme.background} />
    </View>
  )
}