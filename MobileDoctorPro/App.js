import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/AppContext';
import SplashScreen        from './src/screens/SplashScreen';
import LoginScreen         from './src/screens/LoginScreen';
import HomeScreen          from './src/screens/HomeScreen';
import PatientDetailScreen from './src/screens/PatientDetailScreen';
import ConsultationScreen  from './src/screens/ConsultationScreen';
import MedicalReportScreen from './src/screens/MedicalReportScreen';
import UploadRxScreen      from './src/screens/UploadRxScreen';
import PaymentConfirmScreen from './src/screens/PaymentConfirmScreen';
import EarningsScreen      from './src/screens/EarningsScreen';
import HistoryScreen       from './src/screens/HistoryScreen';
import ProfileScreen       from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            <Stack.Screen name="Splash"        component={SplashScreen} />
            <Stack.Screen name="Login"         component={LoginScreen} />
            <Stack.Screen name="Home"          component={HomeScreen} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
            <Stack.Screen name="Consultation"  component={ConsultationScreen} />
            <Stack.Screen name="MedicalReport" component={MedicalReportScreen} />
            <Stack.Screen name="UploadRx"      component={UploadRxScreen} />
            <Stack.Screen name="PaymentConfirm" component={PaymentConfirmScreen} />
            <Stack.Screen name="Earnings"      component={EarningsScreen} />
            <Stack.Screen name="History"       component={HistoryScreen} />
            <Stack.Screen name="Profile"       component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
