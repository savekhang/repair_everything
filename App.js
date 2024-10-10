import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/screens/HomeScreen';
import LoginScreen from './app/screens/LoginScreen';
import RegisterTypeScreen from './app/screens/RegisterTypeScreen';
import UserRegistrationScreen from './app/screens/UserRegistrationScreen';
import TechnicianRegistrationScreen from './app/screens/TechnicianRegistrationScreen';
import InterfaceScreen from './app/screens/InterfaceScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterType" component={RegisterTypeScreen} />
        <Stack.Screen name="UserRegistration" component={UserRegistrationScreen} />
        <Stack.Screen name="TechnicianRegistration" component={TechnicianRegistrationScreen} />
        <Stack.Screen name="Interface" component={InterfaceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
