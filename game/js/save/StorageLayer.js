/**
 * 存储层抽象类
 * @module StorageLayer
 */
class StorageLayer {
  /**
   * 保存数据
   * @param {string} key - 存储键
   * @param {*} data - 数据
   * @returns {Promise<boolean>}
   */
  async save(key, data) {
    throw new Error('Not implemented');
  }

  /**
   * 加载数据
   * @param {string} key - 存储键
   * @returns {Promise<*|null>}
   */
  async load(key) {
    throw new Error('Not implemented');
  }

  /**
   * 删除数据
   * @param {string} key - 存储键
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    throw new Error('Not implemented');
  }

  /**
   * 获取所有键
   * @returns {Promise<string[]>}
   */
  async getAllKeys() {
    throw new Error('Not implemented');
  }
}

/**
 * localStorage存储实现
 */
class LocalStorageLayer extends StorageLayer {
  async save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('LocalStorage save failed:', e);
      return false;
    }
  }

  async load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('LocalStorage load failed:', e);
      return null;
    }
  }

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('LocalStorage delete failed:', e);
      return false;
    }
  }

  async getAllKeys() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    } catch (e) {
      console.error('LocalStorage getAllKeys failed:', e);
      return [];
    }
  }
}

/**
 * IndexedDB存储实现
 */
class IndexedDBLayer extends StorageLayer {
  constructor() {
    super();
    this.db = null;
    this.dbName = 'WuxiaGameDB';
    this.storeName = 'gameData';
    this.version = 1;
  }

  async _initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB open failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async save(key, data) {
    try {
      const db = await this._initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({
          key,
          data,
          timestamp: Date.now(),
          version: '1.0.0'
        });
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error('IndexedDB put failed:', request.error);
          resolve(false);
        };
      });
    } catch (e) {
      console.error('IndexedDB save failed:', e);
      return false;
    }
  }

  async load(key) {
    try {
      const db = await this._initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => {
          console.error('IndexedDB get failed:', request.error);
          resolve(null);
        };
      });
    } catch (e) {
      console.error('IndexedDB load failed:', e);
      return null;
    }
  }

  async delete(key) {
    try {
      const db = await this._initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error('IndexedDB delete failed:', request.error);
          resolve(false);
        };
      });
    } catch (e) {
      console.error('IndexedDB delete failed:', e);
      return false;
    }
  }

  async getAllKeys() {
    try {
      const db = await this._initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const keys = [];
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            keys.push(cursor.key);
            cursor.continue();
          } else {
            resolve(keys);
          }
        };
        
        request.onerror = () => {
          console.error('IndexedDB getAllKeys failed:', request.error);
          resolve([]);
        };
      });
    } catch (e) {
      console.error('IndexedDB getAllKeys failed:', e);
      return [];
    }
  }
}

/**
 * 存储工厂
 */
const StorageFactory = {
  /**
   * 获取存储实例
   * @param {'localStorage' | 'indexedDB'} type - 存储类型
   * @returns {StorageLayer}
   */
  getStorage(type = 'localStorage') {
    if (type === 'indexedDB' && window.indexedDB) {
      return new IndexedDBLayer();
    }
    return new LocalStorageLayer();
  },

  /**
   * 获取最佳存储方案
   * @returns {StorageLayer}
   */
  getBestStorage() {
    if (window.indexedDB) {
      return new IndexedDBLayer();
    }
    return new LocalStorageLayer();
  }
};

// 暴露到全局
window.StorageLayer = StorageLayer;
window.LocalStorageLayer = LocalStorageLayer;
window.IndexedDBLayer = IndexedDBLayer;
window.StorageFactory = StorageFactory;