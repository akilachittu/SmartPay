import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function KYCUpload({ navigation, route }) {
  const [uploaded, setUploaded] = useState(false);
  const { mobileNumber, name, email, dob } = route.params || {};

  const handleUpload = () => {
    // Mock upload simulation
    setTimeout(() => {
      setUploaded(true);
      Alert.alert('Success', 'Document uploaded and verified successfully.');
    }, 1000);
  };

  const handleProceed = () => {
    if (!uploaded) {
      return Alert.alert('Pending', 'Please upload your KYC document first.');
    }
    navigation.navigate('PINCreation', { mobileNumber, name, email, dob });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Verification</Text>
      <Text style={styles.subtitle}>Upload a valid ID (Aadhar/PAN)</Text>

      <View style={styles.card}>
        {!uploaded ? (
          <TouchableOpacity style={styles.uploadArea} onPress={handleUpload}>
            <Text style={styles.uploadText}>Tap to Upload Document</Text>
            <Text style={styles.uploadSubtext}>(Secure Process)</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.successArea}>
            <Text style={styles.successText}>✅ Document Verified</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, !uploaded && styles.buttonDisabled]} 
          onPress={handleProceed}
          disabled={!uploaded}
        >
          <Text style={styles.buttonText}>Set Login PIN</Text>
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
  uploadArea: { backgroundColor: '#0F1115', padding: 40, borderRadius: 10, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#555', borderStyle: 'dashed' },
  uploadText: { color: '#007AFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  uploadSubtext: { color: '#666', fontSize: 14 },
  successArea: { backgroundColor: '#0F1115', padding: 40, borderRadius: 10, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#00FFA3' },
  successText: { color: '#00FFA3', fontSize: 18, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#333' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
