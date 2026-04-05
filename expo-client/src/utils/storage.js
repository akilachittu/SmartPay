const STORAGE_KEYS = {
  USER_DATA: '@smartpay_user_data',
  TRANSACTION_HISTORY: '@smartpay_history',
  OFFLINE_QUEUE: '@smartpay_offline_queue',
  LAST_BALANCES: '@smartpay_balances'
};

/**
 * A simple storage wrapper that uses localStorage in Web
 * and provides an async interface similar to AsyncStorage.
 */
export const Storage = {
  async save(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (e) {
      console.error('Storage Save Error:', e);
      return false;
    }
  },

  async load(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Storage Load Error:', e);
      return null;
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Convenience methods
  async saveUser(userData) {
    return this.save(STORAGE_KEYS.USER_DATA, userData);
  },

  async loadUser() {
    return this.load(STORAGE_KEYS.USER_DATA);
  },

  async saveBalances(balances) {
    return this.save(STORAGE_KEYS.LAST_BALANCES, balances);
  },

  async loadBalances() {
    return this.load(STORAGE_KEYS.LAST_BALANCES);
  },

  async saveHistory(history) {
    return this.save(STORAGE_KEYS.TRANSACTION_HISTORY, history);
  },

  async loadHistory() {
    return this.load(STORAGE_KEYS.TRANSACTION_HISTORY);
  },

  async saveBanks(banks) {
    return this.save('@smartpay_banks', banks);
  },

  async loadBanks() {
    return this.load('@smartpay_banks');
  },

  async queueTransaction(tx) {
    const queue = (await this.load(STORAGE_KEYS.OFFLINE_QUEUE)) || [];
    queue.push({ ...tx, queuedAt: new Date().toISOString() });
    return this.save(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  },

  async getQueue() {
    return (await this.load(STORAGE_KEYS.OFFLINE_QUEUE)) || [];
  },

  async clearQueue() {
    return this.remove(STORAGE_KEYS.OFFLINE_QUEUE);
  }
};
