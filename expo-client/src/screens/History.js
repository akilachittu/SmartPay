import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStore } from '../GlobalStore';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../config';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        // 1. Load from cache first
        const cached = await Storage.loadHistory();
        if (cached) setHistory(cached);

        // 2. Fetch fresh
        try {
          const response = await fetch(`${API_BASE_URL}/api/history/${GlobalStore.userId}`);
          const data = await response.json();
          if (data.history) {
            setHistory(data.history);
            Storage.saveHistory(data.history);
          }
        } catch (error) {
          console.log('Offline: using cached history');
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }, [])
  );

  const getTypeLabel = (type) => {
    switch(type) {
      case 'ONLINE': return '🌐 Online';
      case 'OFFLINE_BLE_SYNC': return '📡 Bluetooth';
      case 'SMS_FALLBACK': return '📱 SMS';
      default: return type;
    }
  };

  const isSent = (item) => {
    return item.payerId === GlobalStore.userId || item.payerId === 'user_1';
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts; // Return original if invalid but string
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return ts;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: '#888', marginTop: 15 }}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <Text style={styles.subtitle}>{history.length} transaction{history.length !== 1 ? 's' : ''}</Text>
      
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList 
          data={history}
          keyExtractor={item => item.id}
          renderItem={({item}) => {
            const sent = isSent(item);
            const displayName = sent 
              ? (item.payeeName || item.payeeId || 'Unknown') 
              : (item.payerName || item.payerId || 'Unknown');
              
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardIcon}>{sent ? '⬆️' : '⬇️'}</Text>
                </View>
                <View style={styles.cardCenter}>
                  <Text style={styles.cardTitle}>
                    {sent ? `To: ${displayName}` : `From: ${displayName}`}
                  </Text>
                  <Text style={styles.cardSubtitle}>{getTypeLabel(item.type)} • {formatDate(item.timestamp)}</Text>
                </View>
                <Text style={[styles.amount, { color: sent ? '#FF3C3C' : '#00FFA3' }]}>
                  {sent ? '-' : '+'}₹{item.amount}
                </Text>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, paddingTop: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  card: { backgroundColor: '#1C1F26', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  cardLeft: { marginRight: 12 },
  cardIcon: { fontSize: 24 },
  cardCenter: { flex: 1 },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#888', fontSize: 12, marginTop: 4 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { color: '#888', fontSize: 16 },
  backButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  backButtonText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
});
