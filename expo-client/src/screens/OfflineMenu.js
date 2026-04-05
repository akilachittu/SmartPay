import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { GlobalStore } from '../GlobalStore';
import { API_BASE_URL as API } from '../config';


// Reusable user lookup badge
function UserBadge({ user }) {
  if (!user) return null;
  if (user.notFound) return (
    <View style={styles.noMatchBadge}>
      <Text style={styles.noMatchText}>❌ No user found with this ID/phone</Text>
    </View>
  );
  return (
    <View style={styles.matchBadge}>
      <Text style={styles.matchText}>✅ {user.name} ({user.id}) — Available via Bluetooth</Text>
    </View>
  );
}

export default function OfflineMenu({ navigation }) {
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState('System Ready');
  const [loading, setLoading] = useState(false);

  // --- Sender state ---
  const [payeeInput, setPayeeInput] = useState('');
  const [matchedPayee, setMatchedPayee] = useState(null);
  const [amount, setAmount] = useState('50');

  // --- Receiver state ---
  const [payerInput, setPayerInput] = useState('');
  const [matchedPayer, setMatchedPayer] = useState(null);
  const [receiveAmount, setReceiveAmount] = useState('50');

  // Live lookup helper
  const lookupUser = (text, setMatched) => {
    const clean = text.trim();
    setMatched(null);
    if (clean.length >= 3) {
      fetch(`${API}/api/user/lookup/${clean}`)
        .then(r => r.json())
        .then(data => {
          if (data.found) setMatched(data);
          else setMatched({ notFound: true });
        })
        .catch(() => {});
    }
  };

  const handlePayeeChange = (text) => {
    setPayeeInput(text);
    lookupUser(text, setMatchedPayee);
  };

  const handlePayerChange = (text) => {
    setPayerInput(text);
    lookupUser(text, setMatchedPayer);
  };

  // --- Send payment ---
  const handlePayOffline = () => {
    const amountNum = parseFloat(amount);
    if (!matchedPayee || matchedPayee.notFound) {
      return Alert.alert('Error', 'Please enter a valid payee ID or phone number.');
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      return Alert.alert('Error', 'Enter a valid amount.');
    }
    setLoading(true);
    setStatus(`Connecting to ${matchedPayee.name} via Bluetooth...`);
    setTimeout(() => {
      setStatus(`Connected! Sending ₹${amountNum} to ${matchedPayee.name}...`);
      fetch(`${API}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerId: GlobalStore.userId,
          payeeId: matchedPayee.id,
          amount: amountNum,
          nonce: `nonce_${Date.now()}`,
          signature: 'SIMULATED_BLE_SIG',
          timestamp: new Date().toISOString(),
        }),
      })
        .then(r => r.json())
        .then(data => {
          setLoading(false);
          if (data.success) {
            navigation.replace('PaymentResult', {
              success: true,
              amount: amountNum.toString(),
              payeeId: matchedPayee.name,
              type: 'Offline (Bluetooth)',
            });
          } else {
            setStatus('System Ready');
            Alert.alert('Transfer Failed', data.error || 'Something went wrong.');
          }
        })
        .catch(() => {
          setLoading(false);
          setStatus('System Ready');
          Alert.alert('Network Error', 'Could not reach the server.');
        });
    }, 1500);
  };

  // --- Receive payment ---
  const handleReceiveOffline = () => {
    const amountNum = parseFloat(receiveAmount);
    if (!matchedPayer || matchedPayer.notFound) {
      return Alert.alert('Error', 'Please enter a valid payer ID or phone number.');
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      return Alert.alert('Error', 'Enter a valid amount.');
    }
    setLoading(true);
    setStatus(`Advertising receiver signal...`);
    setTimeout(() => {
      setStatus(`${matchedPayer.name} connected! Receiving ₹${amountNum}...`);
      setTimeout(() => {
        setLoading(false);
        navigation.replace('PaymentResult', {
          success: true,
          amount: amountNum.toString(),
          payeeId: matchedPayer.name,
          type: 'Offline (Bluetooth) — Received',
          message: `₹${amountNum} received from ${matchedPayer.name} via Bluetooth`,
        });
      }, 1000);
    }, 1500);
  };

  // ---- ROLE SELECTION SCREEN ----
  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Offline Mode</Text>
        <Text style={styles.subtitle}>{status}</Text>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={[styles.card, { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.1)' }]} onPress={() => setRole('payer')}>
            <Text style={styles.cardIcon}>📤</Text>
            <Text style={styles.cardTitle}>Send Payment (Bluetooth)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, { borderColor: '#00FFA3', backgroundColor: 'rgba(0,255,163,0.1)' }]} onPress={() => setRole('payee')}>
            <Text style={styles.cardIcon}>📥</Text>
            <Text style={styles.cardTitle}>Receive Payment (Bluetooth)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, { borderColor: '#FF9500', backgroundColor: 'rgba(255,149,0,0.1)' }]} onPress={() => navigation.navigate('SMSSimulation')}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardTitle}>Fallback: SMS Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#888', textDecorationLine: 'underline' }}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- SEND SCREEN ----
  if (role === 'payer') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Send Offline</Text>
        <Text style={styles.subtitle}>{loading ? status : 'Enter payee details below'}</Text>
        <View style={styles.actionContainer}>
          <Text style={styles.label}>Payee ID or Phone Number</Text>
          <TextInput
            style={[styles.input, matchedPayee && !matchedPayee.notFound ? styles.inputMatched : null]}
            value={payeeInput}
            onChangeText={handlePayeeChange}
            placeholder="e.g. user_2 or 9876543210"
            placeholderTextColor="#666"
            editable={!loading}
          />
          <UserBadge user={matchedPayee} />

          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="50"
            placeholderTextColor="#666"
            editable={!loading}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 15 }} />
          ) : (
            <TouchableOpacity
              style={[styles.button, (!matchedPayee || matchedPayee.notFound) ? styles.buttonDisabled : null]}
              onPress={() => navigation.navigate('PINVerification', { onSuccess: handlePayOffline })}
              disabled={!matchedPayee || matchedPayee.notFound}
            >
              <Text style={styles.buttonText}>Send via Bluetooth</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setRole(null)} style={{ marginTop: 15, alignItems: 'center' }} disabled={loading}>
            <Text style={{ color: '#888', textDecorationLine: 'underline' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- RECEIVE SCREEN ----
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive Offline</Text>
      <Text style={styles.subtitle}>{loading ? status : 'Enter payer details below'}</Text>
      <View style={styles.actionContainer}>
        <Text style={styles.label}>Payer ID or Phone Number</Text>
        <TextInput
          style={[styles.input, matchedPayer && !matchedPayer.notFound ? styles.inputMatched : null]}
          value={payerInput}
          onChangeText={handlePayerChange}
          placeholder="e.g. user_1 or 9876543210"
          placeholderTextColor="#666"
          editable={!loading}
        />
        <UserBadge user={matchedPayer} />

        <Text style={styles.label}>Expected Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={receiveAmount}
          onChangeText={setReceiveAmount}
          keyboardType="numeric"
          placeholder="50"
          placeholderTextColor="#666"
          editable={!loading}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#00FFA3" style={{ marginVertical: 15 }} />
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#00FFA3' }, (!matchedPayer || matchedPayer.notFound) ? styles.buttonDisabled : null]}
            onPress={handleReceiveOffline}
            disabled={!matchedPayer || matchedPayer.notFound}
          >
            <Text style={[styles.buttonText, { color: '#0F1115' }]}>Start Signal Receiver</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setRole(null)} style={{ marginTop: 15, alignItems: 'center' }} disabled={loading}>
          <Text style={{ color: '#888', textDecorationLine: 'underline' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#00FFA3', marginBottom: 20 },
  card: { padding: 25, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  cardIcon: { fontSize: 28, marginBottom: 6 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  actionContainer: { backgroundColor: '#1C1F26', padding: 25, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  label: { color: '#AAA', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#0F1115', color: 'white', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 5, borderWidth: 1, borderColor: '#333' },
  inputMatched: { borderColor: '#00FFA3', borderWidth: 2 },
  matchBadge: { backgroundColor: 'rgba(0,255,163,0.1)', padding: 10, borderRadius: 8, marginBottom: 15 },
  matchText: { color: '#00FFA3', fontSize: 13, fontWeight: '600' },
  noMatchBadge: { backgroundColor: 'rgba(255,59,48,0.1)', padding: 10, borderRadius: 8, marginBottom: 15 },
  noMatchText: { color: '#FF3B30', fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
