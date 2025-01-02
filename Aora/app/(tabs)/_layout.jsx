import { View, Text, Image } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import { icons } from '../../constants'

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      marginTop: 25,
    }}>
      <Image source={icon} style={{
        width: 20,
        height: 20,
        tintColor: color,
        resizeMode: 'contain',
      }}/>
      <Text style={{
        color: color,
        fontFamily: `${focused ? 'Poppins-SemiBold' : 'Poppins-Regular'}`,
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
        width: '100%',
        maxWidth: 100,
      }}>{name}</Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFA001',
        tabBarInactiveTintColor: '#CDCDE0',
        tabBarStyle: {
          backgroundColor: '#161622',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 84,

        }
         
      }}>
        <Tabs.Screen name="home" options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.home} color={color} name="Home" focused={focused}/>

          )
        }}/>
         <Tabs.Screen name="bookmark" options={{
          title: 'Bookmark',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.bookmark} color={color} name="Bookmark" focused={focused}/>

          )
        }}/>
         <Tabs.Screen name="create" options={{
          title: 'Create',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.plus} color={color} name="Create" focused={focused}/>

          )
        }}/>
         <Tabs.Screen name="profile" options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.profile} color={color} name="Profile" focused={focused}/>

          )
        }}/>
      </Tabs>
    </>
  )
}

export default TabsLayout