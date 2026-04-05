import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PaymentResult({ navigation, route }) {
  const isSuccess = route.params?.success ?? true;
  const amount = route.params?.amount || '0';
  const payeeId = route.params?.payeeId || 'Unknown';
  const type = route.params?.type || 'Online';
  const message = route.params?.message || '';

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: isSuccess ? '#00FFA3' : '#FF3B30' }]}>
        
        <Text style={styles.icon}>{isSuccess ? '✅' : '❌'}</Text>
        
        <Text style={[styles.statusTitle, { color: isSuccess ? '#00FFA3' : '#FF3B30' }]}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </Text>

        <Text style={styles.amount}>₹{amount}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To</Text>
            <Text style={styles.detailValue}>{payeeId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mode</Text>
            <Text style={styles.detailValue}>{type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: isSuccess ? '#00FFA3' : '#FF3B30' }]}>
              {isSuccess ? 'Completed' : 'Failed'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleString()}</Text>
          </View>
          {message ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Note</Text>
              <Text style={styles.detailValue}>{message}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isSuccess ? '#00FFA3' : '#FF3B30' }]} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>
            {isSuccess ? 'Back to Dashboard' : 'Try Again'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#1C1F26', padding: 35, borderRadius: 20, borderWidth: 2, width: '100%', maxWidth: 400, alignItems: 'center' },
  icon: { fontSize: 70, marginBottom: 15 },
  statusTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  amount: { fontSize: 48, fontWeight: '800', color: 'white', marginBottom: 25 },
  detailsContainer: { width: '100%', backgroundColor: '#0F1115', borderRadius: 12, padding: 15, marginBottom: 25 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1C1F26' },
  detailLabel: { color: '#888', fontSize: 14 },
  detailValue: { color: 'white', fontSize: 14, fontWeight: '600' },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  buttonText: { color: '#0F1115', fontSize: 16, fontWeight: 'bold' },
});
