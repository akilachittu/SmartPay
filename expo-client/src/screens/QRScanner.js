import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';

export default function QRScannerScreen({ navigation }) {
  const [simulatedAmount, setSimulatedAmount] = useState('15');

  const simulateScan = () => {
    const amountNum = parseFloat(simulatedAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return Alert.alert('Error', 'Invalid amount scanned.');
    }

    if (amountNum > 80000) {
      return Alert.alert(
        'Transaction Limit Exceeded', 
        'The scanned amount exceeds the maximum allowed limit of ₹80,000. Please enter a lower amount or try another barcode.'
      );
    }

    Alert.alert('QR Scanned!', `Target: merchant_98\nAmount requested: ₹${amountNum}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Online', onPress: () => navigation.replace('OnlinePayment') },
      { text: 'Pay Offline', onPress: () => navigation.replace('OfflineMenu') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR</Text>
      
      <View style={styles.scannerBox}>
        <Text style={styles.scannerText}>[ Camera Viewfinder Mock ]</Text>
      </View>

      <Text style={styles.label}>Scanned Amount (₹)</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        value={simulatedAmount}
        onChangeText={setSimulatedAmount}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={simulateScan}>
        <Text style={styles.primaryButtonText}>Validate Scanned Code</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  scannerBox: { width: 250, height: 250, borderWidth: 2, borderColor: '#00FFA3', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  scannerText: { color: '#00FFA3', fontWeight: 'bold' },
  label: { color: '#AAA', fontSize: 14, alignSelf: 'flex-start', marginBottom: 10, marginLeft: 10 },
  input: { backgroundColor: '#1C1F26', color: 'white', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#333', width: '100%' },
  primaryButton: { backgroundColor: '#00FFA3', padding: 18, borderRadius: 12, alignItems: 'center', width: '100%' },
  primaryButtonText: { color: '#0F1115', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { padding: 18, borderRadius: 12, alignItems: 'center', width: '100%', marginTop: 10 },
  secondaryButtonText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
});
