import { TouchableOpacity, View, Text } from 'react-native'

import React from 'react'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={{
      backgroundColor: "rgb(255, 142, 1)",
      borderRadius: 10,
      minHeight: 62,
      justifyContent: 'center',
      alignItems: 'center',
      ...containerStyles,
      opacity: isLoading ? 0.5 : '',
      disabled: isLoading
    }}>
      <Text style={{
        color: '#161622',
        fontFamily: 'Poppins-SemiBold',
        ...textStyles,

      }}>{title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton