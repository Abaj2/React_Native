import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home";
import JoinUs from "../screens/JoinUs";
import SignIn from '../screens/auth/SignIn'
import SignUp from '../screens/auth/SignUp'

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Join" options={{headerShown: false}} component={JoinUs}>
            </Stack.Screen>
            <Stack.Screen name="Home" options={{headerShown: false}} component={HomeScreen}>   
            </Stack.Screen>
            <Stack.Screen name="Sign-in" options={{headerShown: false}} component={SignIn}>   
            </Stack.Screen>
            <Stack.Screen name="Sign-up" options={{headerShown: false}} component={SignUp}>   
            </Stack.Screen>
            
     </Stack.Navigator>
    )
}