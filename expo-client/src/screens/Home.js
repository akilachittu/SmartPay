import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStore } from '../GlobalStore';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';

export default function HomeScreen({ navigation }) {
  const [onlineBalance, setOnlineBalance] = useState(0);
  const [offlineBalance, setOfflineBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const syncOfflineTransactions = async () => {
    const queue = await Storage.getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;
    const newQueue = [];

    for (const tx of queue) {
      try {
        const response = await fetch(`${API_BASE_URL}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx)
        });
        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          newQueue.push(tx); // Keep for next time if server rejected for other reasons
        }
      } catch (e) {
        newQueue.push(tx); // Keep if still offline
      }
    }

    await Storage.save('@smartpay_offline_queue', newQueue);
    setIsSyncing(false);
  };

  useFocusEffect(
    useCallback(() => {
      const currentUserId = GlobalStore.userId;
      setUserId(currentUserId);
      
      // 1. Load from Cache first
      Storage.loadBalances().then(b => {
        if (b) {
          setOnlineBalance(b.online || 0);
          setOfflineBalance(b.offline || 0);
        }
      });
      Storage.loadUser().then(u => {
        if (u) setUserName(u.name || 'User');
      });

      // 2. Fetch fresh from Network
      if (currentUserId) {
        fetch(`${API_BASE_URL}/api/user/wallet/${currentUserId}`)
          .then(res => res.json())
          .then(data => {
            const on = data.onlineBalance || 0;
            const off = data.offlineBalance || 0;
            setOnlineBalance(on);
            setOfflineBalance(off);
            Storage.saveBalances({ online: on, offline: off });
          })
          .catch(() => { /* Keep cached values */ });

        fetch(`${API_BASE_URL}/api/user/profile/${currentUserId}`)
          .then(res => res.json())
          .then(data => {
            setUserName(data.name || 'User');
            Storage.saveUser({ ...GlobalStore, name: data.name });
          })
          .catch(() => { /* Keep cached values */ });
        
        // 3. Sync Offline Queue
        syncOfflineTransactions();
      }
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>SmartPay</Text>
        <TouchableOpacity style={styles.profileBadge} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileBadgeText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.userCard}>
          <Text style={styles.userGreeting}>Hello, {userName || 'User'} 👋</Text>
          <Text style={styles.userIdText}>Account ID: {userId}</Text>
        </View>

        
        <View style={styles.gridRow}>
          <View style={[styles.balanceBox, { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.05)' }]}>
            <Text style={styles.balanceLabel}>Online</Text>
            <Text style={styles.balanceAmount}>₹{onlineBalance}</Text>
          </View>
          <View style={[styles.balanceBox, { borderColor: '#00FFA3', backgroundColor: 'rgba(0,255,163,0.05)' }]}>
            <Text style={styles.balanceLabel}>Offline</Text>
            <Text style={styles.balanceAmount}>₹{offlineBalance}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.transferBtn} onPress={() => navigation.navigate('HybridWallet')}>
          <Text style={styles.transferBtnText}>⇌ Make a Self Transfer</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Main Hub</Text>
        
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.cardOnline} onPress={() => navigation.navigate('OnlinePayment')}>
            <Text style={styles.cardEmoji}>🌐</Text>
            <Text style={styles.cardTitle}>Online Transfer</Text>
            <Text style={styles.cardSub}>Instant Bank-to-Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardOffline} onPress={() => navigation.navigate('OfflineMenu')}>
            <Text style={styles.cardEmoji}>📡</Text>
            <Text style={styles.cardTitle}>Offline Payment</Text>
            <Text style={styles.cardSub}>Bluetooth & SMS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridBlock} onPress={() => navigation.navigate('QRScanner')}>
            <Text style={styles.gridText}>📱 Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBlock} onPress={() => navigation.navigate('GenerateQR')}>
            <Text style={styles.gridText}>🖼️ My QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridBlock} onPress={() => navigation.navigate('History')}>
            <Text style={styles.gridText}>📜 History</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Tools</Text>

        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.toolBlock} onPress={() => navigation.navigate('BankLink')}>
            <Text style={styles.toolText}>🏦 Linked Banks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBlock} onPress={() => navigation.navigate('USSD')}>
            <Text style={styles.toolText}>📶 USSD Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBlock} onPress={() => navigation.navigate('PINVerification')}>
            <Text style={styles.toolText}>🔒 PIN Security</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
           <Text style={styles.logoutText}>Log Out Securely</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  profileBadge: { backgroundColor: '#1C1F26', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  profileBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  userCard: { backgroundColor: '#1C1F26', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  userGreeting: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userIdText: { color: '#00FFA3', fontSize: 14, fontWeight: '600' },
  balanceBox: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  balanceLabel: { color: '#888', fontSize: 14, textTransform: 'uppercase', marginBottom: 5 },
  balanceAmount: { color: 'white', fontSize: 26, fontWeight: '800' },
  transferBtn: { backgroundColor: '#1C1F26', padding: 15, borderRadius: 12, alignItems: 'center', borderColor: '#333', borderWidth: 1, marginBottom: 30 },
  transferBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 15 },
  cardOnline: { flex: 1, backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF', borderWidth: 1, padding: 20, borderRadius: 16 },
  cardOffline: { flex: 1, backgroundColor: 'rgba(0, 255, 163, 0.1)', borderColor: '#00FFA3', borderWidth: 1, padding: 20, borderRadius: 16 },
  cardEmoji: { fontSize: 32, marginBottom: 10 },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardSub: { color: '#888', fontSize: 12 },
  gridBlock: { flex: 1, backgroundColor: '#1C1F26', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  gridText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  toolBlock: { flex: 1, backgroundColor: '#1C1F26', paddingVertical: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  toolText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  logoutBtn: { marginTop: 40, alignItems: 'center' },
  logoutText: { color: '#888', textDecorationLine: 'underline', fontSize: 16 }
});
