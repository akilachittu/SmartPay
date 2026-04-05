import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FailureRetry({ navigation, route }) {
  const message = route.params?.message || 'An unexpected error occurred.';

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✕</Text>
      </View>
      <Text style={styles.title}>Transaction Failed</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.buttonRetry} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonRetryText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonOffline} onPress={() => navigation.replace('OfflineMenu')}>
        <Text style={styles.buttonOfflineText}>Try Offline Payment (Bluetooth)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonHome} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonHomeText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 30, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 60, 60, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon: { color: '#FF3C3C', fontSize: 40, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  message: { fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 40 },
  buttonRetry: { width: '100%', backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  buttonRetryText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  buttonOffline: { width: '100%', backgroundColor: '#1C1F26', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333', marginBottom: 15 },
  buttonOfflineText: { color: '#00FFA3', fontSize: 16, fontWeight: 'bold' },
  buttonHome: { width: '100%', padding: 15, alignItems: 'center' },
  buttonHomeText: { color: '#888', textDecorationLine: 'underline', fontSize: 16 }
});
