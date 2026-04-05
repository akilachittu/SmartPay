import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';

export default function SyncStatus({ navigation }) {
  const [pendingSyncs, setPendingSyncs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueue = async () => {
    const queue = await Storage.getQueue();
    setPendingSyncs(queue);
  };

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [])
  );

  const handleSyncAll = async () => {
    if (pendingSyncs.length === 0) return Alert.alert('Notice', 'No pending syncs.');
    setIsSyncing(true);
    
    let successCount = 0;
    let failCount = 0;
    const currentQueue = [...pendingSyncs];

    for (const tx of currentQueue) {
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
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    if (successCount > 0) {
      // In a more robust system, we'd only remove the succeeded ones.
      // For now, if any succeed, we clear and refresh (or filter).
      // Let's filter to be safe.
      // But for simplicity in this V1, we clear the queue if it was a "Sync All" attempt.
      await Storage.clearQueue();
      await loadQueue();
      Alert.alert('Sync Complete', `Successfully uploaded ${successCount} transactions.${failCount > 0 ? ` (${failCount} failed)` : ''}`);
    } else if (failCount > 0) {
      Alert.alert('Sync Failed', 'Could not reach the cloud. Please try again later.');
    }
    
    setIsSyncing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.txRow}>
      <View>
        <Text style={styles.txPayee}>To: {item.payeeId}</Text>
        <Text style={styles.txDate}>{new Date(item.timestamp).toLocaleString()}</Text>
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
