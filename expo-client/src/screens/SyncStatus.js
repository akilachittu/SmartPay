import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';

export default function SyncStatus({ navigation }) {
  const [pendingSyncs, setPendingSyncs] = useState([
    { id: '1', date: '2026-03-19', amount: 50, payee: 'user_2' },
    { id: '2', date: '2026-03-19', amount: 15, payee: 'merchant_98' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = () => {
    if (pendingSyncs.length === 0) return Alert.alert('Notice', 'No pending syncs.');
    setIsSyncing(true);
    setTimeout(() => {
      setPendingSyncs([]);
      setIsSyncing(false);
      Alert.alert('Success', 'All offline transactions have been synchronized to the cloud.');
    }, 2000); // simulate network delay
  };

  const renderItem = ({ item }) => (
    <View style={styles.txRow}>
      <View>
        <Text style={styles.txPayee}>To: {item.payee}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
      <Text style={styles.txAmount}>₹{item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync Status</Text>
      <Text style={styles.subtitle}>Transactions awaiting cloud upload</Text>

      <View style={styles.card}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Pending Value</Text>
          <Text style={styles.summaryValue}>₹{pendingSyncs.reduce((a, b) => a + b.amount, 0)}</Text>
        </View>

        {pendingSyncs.length > 0 ? (
          <FlatList 
            data={pendingSyncs}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{marginBottom: 20}}
          />
        ) : (
          <Text style={styles.noData}>All transactions are synced.</Text>
        )}

        <TouchableOpacity 
          style={[styles.button, (pendingSyncs.length === 0 || isSyncing) && { opacity: 0.5 }]} 
          onPress={handleSyncAll}
          disabled={pendingSyncs.length === 0 || isSyncing}
        >
           <Text style={styles.buttonText}>{isSyncing ? 'Syncing...' : 'Upload Now'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 15, alignItems: 'center'}}>
           <Text style={{color: '#888', textDecorationLine: 'underline'}}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 30 },
  card: { flex: 1, backgroundColor: '#1C1F26', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  summaryBox: { padding: 20, backgroundColor: 'rgba(0, 255, 163, 0.1)', borderRadius: 12, borderColor: '#00FFA3', borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  summaryLabel: { color: '#00FFA3', fontSize: 14, textTransform: 'uppercase' },
  summaryValue: { color: 'white', fontSize: 40, fontWeight: 'bold' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  txPayee: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  txDate: { color: '#888', fontSize: 12, marginTop: 4 },
  txAmount: { color: '#FF3C3C', fontSize: 18, fontWeight: 'bold' },
  noData: { color: '#888', textAlign: 'center', marginVertical: 40 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
