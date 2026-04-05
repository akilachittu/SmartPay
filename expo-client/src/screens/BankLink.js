import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ALL_BANKS } from '../banks';

import { GlobalStore } from '../GlobalStore';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';

export default function BankLinkScreen({ navigation, route }) {
  const [bankObj, setBankObj] = useState(GlobalStore.selectedBankObj || null);
  const [account, setAccount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isRegistration = route.params?.isRegistration;

  const filteredBanks = ALL_BANKS.filter(b => 
    b.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.short_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useFocusEffect(
    useCallback(() => {
      if (isRegistration) {
        // Aggressive clear after a short delay to override browser autofill
        const timer = setTimeout(() => {
          setAccount(''); 
          setBankObj(null);
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [isRegistration])
  );

  const handleLink = async () => {
    if (!bankObj) {
      return Alert.alert('Error', 'Please select a Bank Name.');
    }
    const cleanAccount = account.replace(/\D/g, ''); // Ensure only digits
    if (cleanAccount.length < 9 || cleanAccount.length > 18) {
      return Alert.alert('Error', 'Bank account number must be between 9 and 18 digits.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/link-bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: GlobalStore.userId,
          bankName: bankObj.bank_name,
          accountNo: cleanAccount
        })
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `${bankObj.bank_name} linked securely!`);
        
        // Refresh local bank list
        const banksRes = await fetch(`${API_BASE_URL}/api/user/banks/${GlobalStore.userId}`);
        const banksData = await banksRes.json();
        if (banksData.banks) {
          GlobalStore.bankAccounts = banksData.banks;
          await Storage.saveBanks(banksData.banks);
        }

        if (isRegistration) {
          // Update persistence with new user info
          await Storage.saveUser({
            userId: GlobalStore.userId,
            mobileNumber: GlobalStore.mobileNumber,
            name: GlobalStore.name
          });
          navigation.replace('Home');
        } else {
          navigation.goBack();
        }
      } else {
        // Show validation error (e.g. "Incorrect Choose Bank")
        Alert.alert('Verification Failed', data.error || 'Could not verify account.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please try again.');
    }
  };

  const handleSkip = () => {
    if (isRegistration) {
      navigation.replace('Home');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link Bank Account</Text>
      <Text style={styles.subtitle}>Securely fetch and link your bank UPI</Text>
      
      <TouchableOpacity style={styles.input} onPress={() => { setSearchQuery(''); setModalVisible(true); }}>
        <Text style={{ color: bankObj ? 'white' : '#666', fontSize: 18 }}>
          {bankObj ? bankObj.bank_name : 'Bank Name (e.g. Chase)'}
        </Text>
      </TouchableOpacity>
      <TextInput 
        style={styles.input} 
        placeholder="Account Number" 
        keyboardType="numeric" 
        maxLength={18} 
        placeholderTextColor="#666" 
        value={account} 
        onChangeText={setAccount}
        autoComplete="off"
        textContentType="none"
        importantForAutofill="no"
        contextMenuHidden={true}
      />
      
      <TouchableOpacity style={styles.primaryButton} onPress={handleLink}>
        <Text style={styles.primaryButtonText}>Verify via SMS & Link</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
        <Text style={styles.secondaryButtonText}>Skip Setup</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Bank</Text>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search by name or code (e.g. SBI)"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            <FlatList
              data={filteredBanks}
              keyExtractor={(item) => item.short_name}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.bankItem} onPress={() => { setBankObj(item); setModalVisible(false); }}>
                  <Text style={styles.bankItemText}>{item.bank_name}</Text>
                  <Text style={styles.bankItemShort}>{item.short_name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 40 },
  input: { backgroundColor: '#1C1F26', color: 'white', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  primaryButton: { backgroundColor: '#00FFA3', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#0F1115', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1F26', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 15, textAlign: 'center' },
  modalSearchInput: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  bankItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankItemText: { color: 'white', fontSize: 16, flex: 1 },
  bankItemShort: { color: '#00FFA3', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  closeButton: { marginTop: 20, padding: 15, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' },
  closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
