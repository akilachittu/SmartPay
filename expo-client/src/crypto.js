import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import 'react-native-get-random-values';

/**
 * Generates an ed25519 key pair for a newly registered user device.
 * @returns {object} Base64 encoded public and secret keys.
 */
export const generateKeyPair = () => {
  const keyPair = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(keyPair.publicKey),
    secretKey: util.encodeBase64(keyPair.secretKey),
  };
};

/**
 * Signs a transaction explicitly meant to be executed offline and settled later.
 * Generates a nonce to prevent double spending.
 * 
 * @param {string} payerId 
 * @param {string} payeeId 
 * @param {number} amount 
 * @param {string} secretKeyBase64 
 * @returns {object} Signed transaction payload to be transferred over Physical Signals (BLE)
 */
export const signOfflineTransaction = (payerId, payeeId, amount, secretKeyBase64) => {
  // A robust Nonce (Number used ONCE) to prevent double spending replay attacks
  const nonce = Date.now().toString() + Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();
  
  // The exact template expected by the settlement server
  const message = `${payerId}:${payeeId}:${amount}:${nonce}:${timestamp}`;
  const messageUint8 = util.decodeUTF8(message);
  
  const secretKeyUint8 = util.decodeBase64(secretKeyBase64);
  const signatureUint8 = nacl.sign.detached(messageUint8, secretKeyUint8);
  
  return {
    payerId,
    payeeId,
    amount,
    nonce,
    timestamp,
    signature: util.encodeBase64(signatureUint8),
  };
};

/**
 * Helper strictly for Payee's device to optionally verify the signature locally 
 * before trusting the UI, before connecting to the settlement backend.
 */
export const verifyTransactionLocally = (signedTx, payerPublicKeyBase64) => {
  try {
    const message = `${signedTx.payerId}:${signedTx.payeeId}:${signedTx.amount}:${signedTx.nonce}:${signedTx.timestamp}`;
    const messageUint8 = util.decodeUTF8(message);
    const signatureUint8 = util.decodeBase64(signedTx.signature);
    const publicKeyUint8 = util.decodeBase64(payerPublicKeyBase64);

    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch (error) {
    return false;
  }
};
