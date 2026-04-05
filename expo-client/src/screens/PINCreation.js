import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { API_BASE_URL } from '../config';
import { GlobalStore } from '../GlobalStore';

export default function PINCreation({ navigation, route }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter PIN, 2 = Confirm PIN
  const { mobileNumber, name, email, dob } = route.params || {};

  const handleKeyPress = (num) => {
    if (step === 1) {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          setTimeout(() => setStep(2), 200);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        if (newConfirmPin.length === 4) {
          verifyAndRegister(newConfirmPin);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const verifyAndRegister = async (finalConfirmPin) => {
    if (pin === finalConfirmPin) {
      // Mock registration API call or proceed to Bank Link
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: mobileNumber,
            name,
            email,
            dob,
            pin: finalConfirmPin
          })
        });
        
        const data = await response.json();
        if (data.success) {
          GlobalStore.userId = data.userId;
          GlobalStore.name = name;
          GlobalStore.mobileNumber = mobileNumber;
          navigation.navigate('BankLink', { userId: data.userId, isRegistration: true });
        } else {
          Alert.alert('Error', data.error || 'Registration failed');
          reset();
        }
      } catch (error) {
         console.warn("Backend not reachable, continuing with mock bank link");
         const mockId = 'user_' + Date.now();
         GlobalStore.userId = mockId;
         GlobalStore.name = name;
         GlobalStore.mobileNumber = mobileNumber;
         navigation.navigate('BankLink', { userId: mockId, isRegistration: true });
      }
    } else {
      Alert.alert('Error', 'PINs do not match. Please try again.');
      reset();
    }
  };

  const reset = () => {
    setPin('');
    setConfirmPin('');
    setStep(1);
  };

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === 1 ? 'Create PIN' : 'Confirm PIN'}</Text>
      <Text style={styles.subtitle}>
        {step === 1 ? 'Set a 4-digit PIN for secure access' : 'Re-enter your 4-digit PIN'}
      </Text>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, currentPin.length > i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity key={num} style={styles.key} onPress={() => handleKeyPress(num)}>
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.key} />
        <TouchableOpacity style={styles.key} onPress={() => handleKeyPress(0)}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleBackspace}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 40, textAlign: 'center' },
  dotsContainer: { flexDirection: 'row', gap: 20, marginBottom: 50 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#00FFA3' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'space-between' },
  key: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 40, backgroundColor: '#1C1F26' },
  keyText: { color: 'white', fontSize: 28, fontWeight: '600' }
});
