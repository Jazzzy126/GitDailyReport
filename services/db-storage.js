/**
 * DBStorage Service
 * Powered by idb-keyval for high-performance Promise-based IndexedDB handle storage
 * Provides LocalStorage helpers & graceful legacy database migration.
 */

(function (window) {
  // Custom store for Git repo directory handles using idb-keyval
  const getCustomStore = () => {
    if (window.idbKeyval && typeof window.idbKeyval.createStore === 'function') {
      return window.idbKeyval.createStore('GitDailyReport_Store', 'repo_handles');
    }
    return null;
  };

  class DBStorage {
    static _customStore = null;

    static getStore() {
      if (!this._customStore) {
        this._customStore = getCustomStore();
      }
      return this._customStore;
    }

    /**
     * Save Directory Handle to IndexedDB using idb-keyval
     */
    static async saveHandle(repoName, handle) {
      if (!repoName || !handle) return false;
      try {
        if (window.idbKeyval) {
          const store = this.getStore();
          await window.idbKeyval.set(repoName, handle, store);
          return true;
        }
        return false;
      } catch (err) {
        console.warn('[DBStorage] 存储句柄失败:', err);
        return false;
      }
    }

    /**
     * Retrieve Directory Handle from IndexedDB
     */
    static async getHandle(repoName) {
      if (!repoName) return null;
      try {
        if (window.idbKeyval) {
          const store = this.getStore();
          const handle = await window.idbKeyval.get(repoName, store);
          if (handle) return handle;

          // Legacy fallback migration: Check if exists in old DB
          return await this._checkLegacyHandle(repoName);
        }
        return null;
      } catch (err) {
        console.warn('[DBStorage] 读取句柄失败:', err);
        return null;
      }
    }

    /**
     * Delete Directory Handle from IndexedDB
     */
    static async deleteHandle(repoName) {
      if (!repoName) return false;
      try {
        if (window.idbKeyval) {
          const store = this.getStore();
          await window.idbKeyval.del(repoName, store);
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    }

    /**
     * Legacy database migration check (GitDailyReport_HandlesDB)
     */
    static _checkLegacyHandle(repoName) {
      return new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        try {
          const req = window.indexedDB.open('GitDailyReport_HandlesDB', 1);
          req.onerror = () => resolve(null);
          req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('repo_handles')) {
              db.close();
              return resolve(null);
            }
            const tx = db.transaction('repo_handles', 'readonly');
            const store = tx.objectStore('repo_handles');
            const getReq = store.get(repoName);
            getReq.onsuccess = async () => {
              if (getReq.result && getReq.result.handle) {
                const handle = getReq.result.handle;
                // Auto-migrate to idb-keyval
                try {
                  await DBStorage.saveHandle(repoName, handle);
                } catch (e) {}
                db.close();
                resolve(handle);
              } else {
                db.close();
                resolve(null);
              }
            };
            getReq.onerror = () => {
              db.close();
              resolve(null);
            };
          };
        } catch (e) {
          resolve(null);
        }
      });
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
