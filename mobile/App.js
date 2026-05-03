import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/AppContext';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import SymptomsScreen from './src/screens/SymptomsScreen';
import LocationScreen from './src/screens/LocationScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import PatientScreen from './src/screens/PatientScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import DoctorAssignedScreen from './src/screens/DoctorAssignedScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import NoDoctorsScreen from './src/screens/NoDoctorsScreen';
import CancelScreen from './src/screens/CancelScreen';
import ReorderScreen from './src/screens/ReorderScreen';
import InjectableScreen from './src/screens/InjectableScreen';
import VisitHistoryDetailScreen from './src/screens/VisitHistoryDetailScreen';
import VisitListScreen from './src/screens/VisitListScreen';
import PhoneVerificationScreen from './src/screens/PhoneVerificationScreen';
import ChatScreen from './src/screens/ChatScreen';

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
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Symptoms" component={SymptomsScreen} />
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="Patient" component={PatientScreen} />
            <Stack.Screen name="Matching" component={MatchingScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="DoctorAssigned" component={DoctorAssignedScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="NoDoctors" component={NoDoctorsScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Cancel" component={CancelScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Reorder" component={ReorderScreen} />
            <Stack.Screen name="Injectable" component={InjectableScreen} />
            <Stack.Screen name="VisitDetail" component={VisitHistoryDetailScreen} />
            <Stack.Screen name="VisitList" component={VisitListScreen} />
            <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
