import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function RegistrationDetails({ navigation, route }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const mobileNumber = route.params?.mobileNumber || '';

  const handleProceed = () => {
    if (!name || !email || !dob) {
      return Alert.alert('Error', 'Please fill all details.');
    }
    navigation.navigate('KYCUpload', { mobileNumber, name, email, dob });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Let's set up your profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. John Doe" 
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="email-address"
          placeholder="e.g. john@example.com" 
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Date of Birth (DD/MM/YYYY)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 01/01/1990" 
          placeholderTextColor="#666"
          value={dob}
          onChangeText={setDob}
        />

        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText}>Proceed to KYC</Text>
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
  input: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
