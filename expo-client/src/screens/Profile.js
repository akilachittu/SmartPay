import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStore } from '../GlobalStore';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch(`${API_BASE_URL}/api/user/profile/${GlobalStore.userId}`);
      const pData = await pRes.json();
      setProfile(pData);

      const bRes = await fetch(`${API_BASE_URL}/api/user/banks/${GlobalStore.userId}`);
      const bData = await bRes.json();
      if (bData.banks) {
        setBanks(bData.banks);
        GlobalStore.bankAccounts = bData.banks;
        Storage.saveBanks(bData.banks);
      }
    } catch (err) {
      console.log("Offline mode: loading cached banks");
      const cachedBanks = await Storage.loadBanks();
      if (cachedBanks) setBanks(cachedBanks);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const setPrimaryAccount = async (bankId) => {
    setSyncing(true);
    try {
      await fetch(`${API_BASE_URL}/api/user/set-primary-bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: GlobalStore.userId, bankId })
      });
      await fetchProfileData(); // Refresh list
    } catch (e) {
      Alert.alert('Error', 'Could not update primary account while offline.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{profile?.name || 'Not Set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{profile?.email || 'Not Set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile Number</Text>
          <Text style={styles.value}>{profile?.phone || 'Not Set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{profile?.dob || 'Not Set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>KYC Status</Text>
          <Text style={[styles.value, { color: profile?.kycStatus === 'VERIFIED' ? '#00FFA3' : '#FF3B30' }]}>
            {profile?.kycStatus || 'PENDING'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => navigation.navigate('EditProfile', { profile })}
      >
        <Text style={styles.primaryButtonText}>Edit Profile Details</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { fontSize: 24, marginTop: 20 }]}>Linked Bank Accounts</Text>
      <View style={styles.bankList}>
        {banks.length === 0 ? (
          <Text style={{ color: '#888', fontStyle: 'italic', marginBottom: 15 }}>No banks linked yet.</Text>
        ) : (
          banks.map((bank) => (
            <View key={bank.id} style={styles.bankCard}>
              <View>
                <Text style={styles.bankName}>{bank.bankName}</Text>
                <Text style={styles.bankAcc}>•••• {bank.accountNo.slice(-4)}</Text>
              </View>
              {bank.isPrimary ? (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.setPrimaryBtn}
                  onPress={() => setPrimaryAccount(bank.id)}
                  disabled={syncing}
                >
                  <Text style={styles.setPrimaryText}>Set Primary</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => navigation.navigate('BankLink')}
      >
        <Text style={styles.secondaryButtonText}>+ Add New Bank Account</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 30, alignItems: 'center'}}>
        <Text style={{color: '#888', textDecorationLine: 'underline'}}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  center: { flex: 1, backgroundColor: '#0F1115', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  card: { backgroundColor: '#1C1F26', padding: 25, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: '#AAA', fontSize: 16 },
  value: { color: 'white', fontSize: 16, fontWeight: '500' },
  primaryButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#1C1F26', padding: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  secondaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // Bank List Styles
  bankList: { marginBottom: 20 },
  bankCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1C1F26', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  bankName: { color: 'white', fontSize: 16, fontWeight: '600' },
  bankAcc: { color: '#888', fontSize: 13, marginTop: 2 },
  primaryBadge: { backgroundColor: '#00FFA322', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  primaryBadgeText: { color: '#00FFA3', fontSize: 12, fontWeight: 'bold' },
  setPrimaryBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: '#007AFF' },
  setPrimaryText: { color: '#007AFF', fontSize: 12, fontWeight: '600' }
});
