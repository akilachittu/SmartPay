import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { GlobalStore } from '../GlobalStore';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';

export default function OTPScreen({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const mobileNumber = route.params?.mobileNumber || 'Unknown';

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber, otp })
      });
      const data = await response.json();

      if (response.ok) {
        if (data.userId) {
          GlobalStore.userId = data.userId;
        }
        if (data.isNewUser) {
          navigation.replace('RegistrationDetails', { mobileNumber });
        } else {
          navigation.replace('Home');
        }
      } else {
        Alert.alert('Error', data.error || 'Invalid OTP. For test accounts, please use 1234.');
      }
    } catch (error) {
      // Backend not reachable — use demo user if OTP is 1234
      if (otp === '1234') {
        // If the number is recognized as a 'new' test number (e.g. starts with 11), go to registration
        if (mobileNumber.startsWith('11') || mobileNumber === '1122334455') {
          navigation.replace('RegistrationDetails', { mobileNumber });
        } else {
          const userId = 'user_1';
          GlobalStore.userId = userId;
          GlobalStore.mobileNumber = mobileNumber;
          await Storage.saveUser({ userId: userId, mobileNumber: mobileNumber, name: `User ${mobileNumber.slice(-4)}` });
          navigation.replace('Home');
        }
      } else {
        Alert.alert('Error', 'Invalid OTP. For test accounts, please use 1234.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>Enter OTP sent to {mobileNumber}</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="Enter 1234 for test accounts"
          placeholderTextColor="#666"
          secureTextEntry
          value={otp}
          onChangeText={setOtp}
        />
        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>Verify & Complete Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 15, alignItems: 'center' }}>
          <Text style={{ color: '#888', textDecorationLine: 'underline' }}>Change Mobile Number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 40 },
  card: { backgroundColor: '#1C1F26', padding: 25, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  input: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
