/**
 * DBStorage Service
 * IndexedDB persistence for FileSystemDirectoryHandle and LocalStorage helpers
 */

(function (window) {
  const DB_NAME = 'GitDailyReport_HandlesDB';
  const STORE_NAME = 'repo_handles';
  const DB_VERSION = 1;

  class DBStorage {
    static _dbPromise = null;

    /**
     * Open or get existing IndexedDB connection
     */
    static openDB() {
      if (this._dbPromise) return this._dbPromise;

      this._dbPromise = new Promise((resolve) => {
        if (!window.indexedDB) {
          console.warn('[DBStorage] IndexedDB 不受当前浏览器支持');
          resolve(null);
          return;
        }

        try {
          const req = window.indexedDB.open(DB_NAME, DB_VERSION);

          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'repoName' });
            }
          };

          req.onsuccess = () => resolve(req.result);
          req.onerror = (e) => {
            console.warn('[DBStorage] 打开数据库失败:', e);
            resolve(null);
          };
        } catch (err) {
          console.warn('[DBStorage] 初始化异常:', err);
          resolve(null);
        }
      });

      return this._dbPromise;
    }

    /**
     * Save Directory Handle to IndexedDB
     */
    static async saveHandle(repoName, handle) {
      if (!repoName || !handle) return false;
      try {
        const db = await this.openDB();
        if (!db) return false;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put({ repoName, handle, updatedAt: Date.now() });

          req.onsuccess = () => resolve(true);
          req.onerror = (e) => {
            console.warn('[DBStorage] 存储目录句柄失败:', e);
            resolve(false);
          };
        });
      } catch (e) {
        console.warn('[DBStorage] 写入异常:', e);
        return false;
      }
    }

    /**
     * Retrieve Directory Handle from IndexedDB
     */
    static async getHandle(repoName) {
      if (!repoName) return null;
      try {
        const db = await this.openDB();
        if (!db) return null;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(repoName);

          req.onsuccess = () => resolve(req.result ? req.result.handle : null);
          req.onerror = () => resolve(null);
        });
      } catch (e) {
        return null;
      }
    }

    /**
     * Delete Directory Handle from IndexedDB
     */
    static async deleteHandle(repoName) {
      if (!repoName) return false;
      try {
        const db = await this.openDB();
        if (!db) return false;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(repoName);

          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        });
      } catch (e) {
        return false;
      }
    }

    /**
     * LocalStorage JSON helper with fallback
     */
    static getItem(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    /**
     * LocalStorage set JSON helper
     */
    static setItem(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch (e) {
        return false;
      }
    }

    /**
     * LocalStorage remove item helper
     */
    static removeItem(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  window.DBStorage = DBStorage;
})(window);
