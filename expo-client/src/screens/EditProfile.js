import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { GlobalStore } from '../GlobalStore';
import { API_BASE_URL } from '../config';

export default function EditProfileScreen({ navigation, route }) {
  const { profile } = route.params || {};

  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [dob, setDob] = useState(profile?.dob || '');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setIsError(true);
      setStatusMsg('Full Name is required.');
      return;
    }

    setLoading(true);
    setStatusMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile/${GlobalStore.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), dob: dob.trim() })
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setIsError(false);
        setStatusMsg('✅ Profile updated successfully!');
        // Navigate back after a short delay so user sees success
        setTimeout(() => navigation.goBack(), 1200);
      } else {
        setIsError(true);
        setStatusMsg(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setLoading(false);
      setIsError(true);
      setStatusMsg('Network Error: Could not reach backend');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>Update your personal information</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. John Doe"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email Address (optional)</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          placeholder="e.g. john@example.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Date of Birth (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#666"
          value={dob}
          onChangeText={setDob}
        />

        {statusMsg ? (
          <View style={[styles.statusBox, { backgroundColor: isError ? 'rgba(255,59,48,0.1)' : 'rgba(0,255,163,0.1)', borderColor: isError ? '#FF3B30' : '#00FFA3' }]}>
            <Text style={{ color: isError ? '#FF3B30' : '#00FFA3', fontSize: 14, fontWeight: '600' }}>{statusMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#0F1115" /> : <Text style={styles.buttonText}>Save Updates</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: '#888', textDecorationLine: 'underline' }}>Cancel</Text>
      </TouchableOpacity>
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
  statusBox: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 15, alignItems: 'center' },
  button: { backgroundColor: '#00FFA3', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#0F1115', fontSize: 16, fontWeight: 'bold' }
});
