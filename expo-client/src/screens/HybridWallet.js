import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStore } from '../GlobalStore';
import { API_BASE_URL } from '../config';

export default function HybridWallet({ navigation }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({ online: 0, offline: 0 });

  useFocusEffect(
    useCallback(() => {
      fetch(`${API_BASE_URL}/api/user/wallet/${GlobalStore.userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.onlineBalance !== undefined && data.offlineBalance !== undefined) {
            setBalances({ online: data.onlineBalance, offline: data.offlineBalance });
          }
        })
        .catch(() => {});
    }, [])
  );

  const handleTransfer = async (direction) => {
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) {
      return Alert.alert('Invalid', 'Enter a valid amount');
    }

    if (direction === 'ONLINE_TO_OFFLINE' && amountNum > balances.online) {
      return Alert.alert('Insufficient Online Balance', `You only have ₹${balances.online} available.`);
    }
    if (direction === 'OFFLINE_TO_ONLINE' && amountNum > balances.offline) {
      return Alert.alert('Insufficient Offline Balance', `You only have ₹${balances.offline} available.`);
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/wallet/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: GlobalStore.userId, direction, amount: amountNum })
      });
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Transfer Successful', data.message);
        setAmount('');
        navigation.goBack();
      } else {
        Alert.alert('Failed', data.error || 'Failed to transfer.');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not reach the server.');
    }
  };

  const handleTopUp = () => {
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
    if (amountNum > balances.online) {
      return Alert.alert('Insufficient Online Balance', `You only have ₹${balances.online} available.`);
    }
    navigation.navigate('PINVerification', { onSuccess: () => handleTransfer('ONLINE_TO_OFFLINE') });
  };

  const handleWithdraw = () => {
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
    if (amountNum > balances.offline) {
      return Alert.alert('Insufficient Offline Balance', `You only have ₹${balances.offline} available.`);
    }
    navigation.navigate('PINVerification', { onSuccess: () => handleTransfer('OFFLINE_TO_ONLINE') });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Self Transfer</Text>
      <Text style={styles.subtitle}>Move funds between your Online and Offline wallets</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Transfer Amount (₹)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          placeholder="e.g. 500" 
          placeholderTextColor="#666"
          value={amount}
          onChangeText={setAmount}
        />

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btnTopUp, loading && styles.btnDisabled]} onPress={handleTopUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#00FFA3" /> : (
              <>
                <Text style={styles.btnTopUpText}>↓ Top-Up Offline Wallet</Text>
                <Text style={styles.btnSubText}>Moves funds from Online → Offline</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnWithdraw, loading && styles.btnDisabled]} onPress={handleWithdraw} disabled={loading}>
            {loading ? <ActivityIndicator color="#007AFF" /> : (
              <>
                <Text style={styles.btnWithdrawText}>↑ Withdraw to Online</Text>
                <Text style={styles.btnSubText}>Moves funds from Offline → Online</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 30, alignItems: 'center'}}>
           <Text style={{color: '#888', textDecorationLine: 'underline'}}>Cancel</Text>
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
  label: { color: '#AAA', fontSize: 14, marginBottom: 10 },
  input: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 24, marginBottom: 30, borderWidth: 1, borderColor: '#333', textAlign: 'center', fontWeight: 'bold' },
  actions: { gap: 15 },
  btnTopUp: { backgroundColor: 'rgba(0, 255, 163, 0.1)', borderColor: '#00FFA3', borderWidth: 1, padding: 20, borderRadius: 12, alignItems: 'center' },
  btnTopUpText: { color: '#00FFA3', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  btnWithdraw: { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF', borderWidth: 1, padding: 20, borderRadius: 12, alignItems: 'center' },
  btnWithdrawText: { color: '#007AFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  btnSubText: { color: '#888', fontSize: 12 },
  btnDisabled: { opacity: 0.5 }
});
