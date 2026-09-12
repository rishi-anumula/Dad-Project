/**
 * Web storage wrapper using localStorage with async API for seamless compatibility.
 */
export const secureStorage = {
  async get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage.getItem failed', e);
      return null;
    }
  },

  async getJson(key, defaultValue = null) {
    try {
      const raw = await this.get(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringVal);
    } catch (e) {
      console.warn('localStorage.setItem failed', e);
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage.removeItem failed', e);
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage.clear failed', e);
    }
  }
};
