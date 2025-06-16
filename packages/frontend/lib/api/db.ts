/* eslint-disable @typescript-eslint/no-explicit-any */
interface DBItem<T = any> {
  key: string;
  value: T;
}

class SimpleDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = "MyDB", version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("store")) {
          db.createObjectStore("store", { keyPath: "key" });
        }
      };
    });
  }

  async set<T>(key: string, value: T): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["store"], "readwrite");
      const store = tx.objectStore("store");
      const request = store.put({ key, value });

      request.onsuccess = () => resolve(key);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["store"], "readonly");
      const store = tx.objectStore("store");
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["store"], "readwrite");
      const store = tx.objectStore("store");
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["store"], "readwrite");
      const store = tx.objectStore("store");
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(): Promise<DBItem<T>[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["store"], "readonly");
      const store = tx.objectStore("store");
      const request = store.getAll();

      request.onsuccess = () =>
        resolve(
          request.result.map((item: any) => ({
            key: item.key,
            value: item.value,
          }))
        );
      request.onerror = () => reject(request.error);
    });
  }
}

// Usage:
// const db = new SimpleDB('MyFiles');
// await db.set<string>('myFile', base64String);
// const file = await db.get<string>('myFile');
// await db.delete('myFile');

export default SimpleDB;
