import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import MainScreen from './components/MainScreen';
import SignupScreen from './components/SignupScreen';
import RoutineScreen from './components/RoutineScreen';
import StartedRoutineSession from './components/StartedRoutineSession';



export default function App() {
  const Stack = createStackNavigator();
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [loading, setLoading] = useState(true);
  const [GlobalUserId, setGlobalUserId] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        console.log('User ID foufdnd:'+ userId)
        setGlobalUserId(userId);
        setInitialRoute('Main');
      }else{console.log('User ID not  found:'+ userId)}
      setLoading(false); 
    };

    checkUser();
  }, []);

  if (loading) {
    return <View><Text>Loading...</Text></View>;
  }
  return(
    <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options
        ={{ headerShown: false }} 
      />
       <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ headerShown: true }} 
      />
      <Stack.Screen 
        name="Main" 
        component={MainScreen} 
        options={{ headerShown: true }}
        initialParams={{ GlobalUserId }}
      />
      <Stack.Screen 
        name="Routine" 
        component={RoutineScreen} 
        options={{ headerShown: true }}
        initialParams={{ GlobalUserId }}
      />
      <Stack.Screen 
        name="StartedRoutineSession" 
        component={StartedRoutineSession}
        options={({ route }) => ({ 
          title: route.params?.routineName || 'Session'
        })}
      />
    </Stack.Navigator>
  </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
