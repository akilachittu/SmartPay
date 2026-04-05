// Mocked BLE interface for Expo Go testing since 'react-native-ble-plx' requires a custom native build.
export const OFFLINE_PAYMENT_SERVICE_UUID = '0000ffff-0000-1000-8000-00805f9b34fb';
export const CHARACTERISTIC_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';

let globalPayeeCallback = null;

export const scanAndConnectToPayee = (onDeviceFound) => {
  console.log("MOCK: Scanning for devices...");
  setTimeout(() => {
    onDeviceFound({ name: "MockPayeeDevice", id: "00:11:22:33:44:55" });
  }, 1500);
};

export const transferPayload = async (device, signedTxPayload) => {
  console.log("MOCK: Transferring payload...", signedTxPayload);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (globalPayeeCallback) {
        globalPayeeCallback(JSON.stringify(signedTxPayload));
      }
      // Always resolve true so the UI demo looks successful, even if the payee didn't launch the receiver
      resolve(true); 
    }, 1000);
  });
};

export const startAdvertisingAsPayee = (payeeId, onPayloadReceived) => {
  console.log(`MOCK: Starting BLE Advertising for Payee ID: ${payeeId}`);
  globalPayeeCallback = onPayloadReceived;
};
