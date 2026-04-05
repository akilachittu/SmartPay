import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { ALL_BANKS } from '../banks';
import { GlobalStore } from '../GlobalStore';

export default function LoginScreen({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [bankObj, setBankObj] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const filteredBanks = ALL_BANKS.filter(b => 
    b.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.short_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePhoneChange = (text) => {
    // Strip everything except digits
    const digitsOnly = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    const limited = digitsOnly.slice(0, 10);
    setMobileNumber(limited);

    // Show/clear inline error
    if (limited.length > 0 && limited.length < 10) {
      setPhoneError(`Enter 10 digits (${limited.length}/10)`);
    } else {
      setPhoneError('');
    }
  };

  const handleSendOtp = () => {
    if (!bankObj) {
      return Alert.alert('Bank Required', 'Please select your associated Bank.');
    }
    if (mobileNumber.length !== 10) {
      setPhoneError('Mobile number must be exactly 10 digits!');
      return Alert.alert('Invalid Number', 'Please enter exactly 10 digits for your mobile number.');
    }
    setPhoneError('');
    GlobalStore.selectedBankObj = bankObj;
    navigation.navigate('OTP', { mobileNumber, bankObj });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in securely to your offline wallet</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Select Your Bank</Text>
        <TouchableOpacity style={styles.input} onPress={() => { setSearchQuery(''); setModalVisible(true); }}>
          <Text style={{ color: bankObj ? 'white' : '#666', fontSize: 18 }}>
            {bankObj ? bankObj.bank_name : 'Bank Name (e.g. Chase)'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput 
          style={[styles.input, phoneError ? styles.inputError : null]} 
          keyboardType="phone-pad" 
          placeholder="e.g. 9876543210" 
          placeholderTextColor="#666"
          maxLength={10}
          value={mobileNumber}
          onChangeText={handlePhoneChange}
        />
        {phoneError ? (
          <Text style={styles.errorText}>{phoneError}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>Get Secure OTP</Text>
        </TouchableOpacity>
      </View>

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
  card: { backgroundColor: '#1C1F26', padding: 25, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  label: { color: '#AAA', fontSize: 14, marginBottom: 10 },
  input: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center' },
  inputError: { borderColor: '#FF3B30', borderWidth: 2 },
  errorText: { color: '#FF3B30', fontSize: 13, fontWeight: '600', marginTop: -15, marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1F26', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 15, textAlign: 'center' },
  modalSearchInput: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  bankItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankItemText: { color: 'white', fontSize: 16, flex: 1 },
  bankItemShort: { color: '#00FFA3', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  closeButton: { marginTop: 20, padding: 15, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' },
  closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
