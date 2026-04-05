import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GlobalStore } from '../GlobalStore';
import { API_BASE_URL } from '../config';

export default function PINVerification({ navigation, route }) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState(null); // null | 'processing' | 'success' | 'failed'
  const onSuccess = route.params?.onSuccess;

  const handleKeyPress = (num) => {
    if (pin.length < 4 && !status) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Show all 4 dots, then start processing
        setTimeout(() => verify(newPin), 400);
      }
    }
  };

  const handleBackspace = () => {
    if (!status) {
      setPin(pin.slice(0, -1));
    }
  };

  const verify = async (finalPin) => {
    setStatus('processing');

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: GlobalStore.userId, pin: finalPin })
      });
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          navigation.goBack();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setStatus('failed');
        setTimeout(() => {
          setStatus(null);
          setPin('');
        }, 2000);
      }
    } catch (error) {
      console.warn("Backend not reachable for PIN check");
      // Fallback for demo when backend is down
      if (finalPin === '1234') {
        setStatus('success');
        setTimeout(() => {
          navigation.goBack();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setStatus('failed');
        setTimeout(() => {
          setStatus(null);
          setPin('');
        }, 2000);
      }
    }
  };

  // Processing overlay
  if (status === 'processing') {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayCard}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.overlayTitle}>Processing...</Text>
          <Text style={styles.overlaySubtitle}>Verifying your PIN securely</Text>
        </View>
      </View>
    );
  }

  // Success overlay
  if (status === 'success') {
    return (
      <View style={styles.overlayContainer}>
        <View style={[styles.overlayCard, { borderColor: '#00FFA3' }]}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.overlayTitle, { color: '#00FFA3' }]}>PIN Verified!</Text>
          <Text style={styles.overlaySubtitle}>Payment is being processed...</Text>
        </View>
      </View>
    );
  }

  // Failed overlay
  if (status === 'failed') {
    return (
      <View style={styles.overlayContainer}>
        <View style={[styles.overlayCard, { borderColor: '#FF3B30' }]}>
          <Text style={styles.successIcon}>❌</Text>
          <Text style={[styles.overlayTitle, { color: '#FF3B30' }]}>Incorrect PIN</Text>
          <Text style={styles.overlaySubtitle}>Please try again.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>
      <Text style={styles.subtitle}>Enter your secure 4-digit PIN to authorize payment</Text>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotActive]} />
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

      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 30}}>
         <Text style={{color: '#888', textDecorationLine: 'underline'}}>Cancel Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 10, textAlign: 'center' },
  pinHint: { fontSize: 13, color: '#007AFF', marginBottom: 30, fontWeight: '600' },
  dotsContainer: { flexDirection: 'row', marginBottom: 50 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#333', marginHorizontal: 10 },
  dotActive: { backgroundColor: '#00FFA3' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'space-between' },
  key: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 40, backgroundColor: '#1C1F26' },
  keyText: { color: 'white', fontSize: 28, fontWeight: '600' },

  // Overlay styles
  overlayContainer: { flex: 1, backgroundColor: '#0F1115', alignItems: 'center', justifyContent: 'center', padding: 40 },
  overlayCard: { backgroundColor: '#1C1F26', padding: 40, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#007AFF', width: '100%', maxWidth: 350 },
  successIcon: { fontSize: 60, marginBottom: 20 },
  overlayTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  overlaySubtitle: { color: '#888', fontSize: 14, textAlign: 'center' },
});
