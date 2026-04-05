import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GlobalStore } from '../GlobalStore';
import { Storage } from '../utils/storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const initApp = async () => {
      const savedUser = await Storage.loadUser();
      
      if (savedUser && savedUser.userId) {
        GlobalStore.userId = savedUser.userId;
        GlobalStore.mobileNumber = savedUser.mobileNumber;
        GlobalStore.name = savedUser.name;
        
        // Short delay for splash feel
        setTimeout(() => {
          navigation.replace('Home');
        }, 1500);
      } else {
        setTimeout(() => {
          navigation.replace('Login');
        }, 2500);
      }
    };
    initApp();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartPay</Text>
      <Text style={styles.subtitle}>Secure Hybrid Offline Wallet</Text>
      <ActivityIndicator size="large" color="#00FFA3" style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#00FFA3',
    letterSpacing: 2
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    letterSpacing: 1
  }
});
