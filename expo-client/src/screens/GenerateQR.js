import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { GlobalStore } from '../GlobalStore';

export default function GenerateQR({ navigation }) {
  const paymentPayload = JSON.stringify({ userId: GlobalStore.userId, name: GlobalStore.name || 'User', defaultAmount: 50 });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your QR Code</Text>
      <Text style={styles.subtitle}>Let others scan this to pay you securely</Text>

      <View style={styles.card}>
        <View style={styles.qrContainer}>
          <QRCode
            value={paymentPayload}
            size={250}
            color="white"
            backgroundColor="transparent"
          />
        </View>
        <Text style={styles.userIdText}>ID: {GlobalStore.userId}</Text>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 30, alignItems: 'center'}}>
           <Text style={{color: '#888', textDecorationLine: 'underline'}}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 40, textAlign: 'center' },
  card: { backgroundColor: '#1C1F26', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  qrWrapper: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20 },
  userIdText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }
});
