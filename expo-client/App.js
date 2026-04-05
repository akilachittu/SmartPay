import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/Splash';
import LoginScreen from './src/screens/Login';
import HomeScreen from './src/screens/Home';
import BankLinkScreen from './src/screens/BankLink';
import HistoryScreen from './src/screens/History';
import QRScannerScreen from './src/screens/QRScanner';
import USSDScreen from './src/screens/USSD';
import OTPScreen from './src/screens/OTPScreen';
import OnlinePayment from './src/screens/OnlinePayment';
import OfflineMenu from './src/screens/OfflineMenu';
import PINVerification from './src/screens/PINVerification';
import SMSSimulation from './src/screens/SMSSimulation';
import SyncStatus from './src/screens/SyncStatus';
import FailureRetry from './src/screens/FailureRetry';
import GenerateQR from './src/screens/GenerateQR';
import HybridWallet from './src/screens/HybridWallet';
import RegistrationDetails from './src/screens/RegistrationDetails';
import KYCUpload from './src/screens/KYCUpload';
import PINCreation from './src/screens/PINCreation';
import ProfileScreen from './src/screens/Profile';
import EditProfileScreen from './src/screens/EditProfile';
import PaymentResult from './src/screens/PaymentResult';
import { registerSW } from './src/register-pwa';

// Register for offline support on Web
registerSW();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BankLink" component={BankLinkScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="USSD" component={USSDScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="OnlinePayment" component={OnlinePayment} />
        <Stack.Screen name="OfflineMenu" component={OfflineMenu} />
        <Stack.Screen name="PINVerification" component={PINVerification} />
        <Stack.Screen name="SMSSimulation" component={SMSSimulation} />
        <Stack.Screen name="SyncStatus" component={SyncStatus} />
        <Stack.Screen name="FailureRetry" component={FailureRetry} />
        <Stack.Screen name="GenerateQR" component={GenerateQR} />
        <Stack.Screen name="HybridWallet" component={HybridWallet} />
        <Stack.Screen name="RegistrationDetails" component={RegistrationDetails} />
        <Stack.Screen name="KYCUpload" component={KYCUpload} />
        <Stack.Screen name="PINCreation" component={PINCreation} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="PaymentResult" component={PaymentResult} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
