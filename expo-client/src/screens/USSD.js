import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GlobalStore } from '../GlobalStore';

export default function USSDScreen({ navigation }) {
  const [sent, setSent] = useState(false);

  const triggerUSSD = () => {
    setSent(true);
    setTimeout(() => {
      Alert.alert('SMS Trigger', 'Payload: TXN:' + (GlobalStore.userId || 'user_1') + ':user_2:50:NONCE_45:SIG_9A\nMessage sent directly to Bank Telecom Gateway!');
      setSent(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Fallback</Text>
      <Text style={styles.subtitle}>If Bluetooth fails, send encrypted transaction payload via GSM USSD (*99#)</Text>
      <View style={styles.dialer}>
         <Text style={styles.dialerText}>*99*user2*50#</Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={triggerUSSD} disabled={sent}>
        <Text style={styles.primaryButtonText}>{sent ? 'Sending...' : 'Dial & Send SMS Payload'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#AAA', marginBottom: 30 },
  dialer: { backgroundColor: '#1C1F26', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#333' },
  dialerText: { fontSize: 36, color: '#00FFA3', fontWeight: 'bold', letterSpacing: 2 },
  primaryButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
});
