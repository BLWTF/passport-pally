import { useRef, useState, useEffect, useCallback } from "react";
import SimpleDB from "../api/db";

export default function useIndexedDB(dbName: string = "MyDB") {
  const dbRef = useRef<SimpleDB | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        dbRef.current = new SimpleDB(dbName);
        await dbRef.current.init();
        setIsReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize DB"
        );
      }
    };

    initDB();
  }, [dbName]);

  const setValue = useCallback(
    async <T>(key: string, value: T) => {
      if (!dbRef.current || !isReady) {
        await dbRef.current?.init();
        setIsReady(true);
      }
      return dbRef.current?.set(key, value);
    },
    [isReady]
  );

  const getValue = useCallback(
    async <T>(key: string): Promise<T | undefined> => {
      if (!dbRef.current || !isReady) {
        await dbRef.current?.init();
        setIsReady(true);
      }
      return dbRef.current?.get<T>(key);
    },
    [isReady]
  );

  const deleteValue = useCallback(
    async (key: string) => {
      if (!dbRef.current || !isReady) {
        await dbRef.current?.init();
        setIsReady(true);
      }
      return dbRef.current?.delete(key);
    },
    [isReady]
  );

  const clearAll = useCallback(async () => {
    if (!dbRef.current || !isReady) {
      await dbRef.current?.init();
      setIsReady(true);
    }
    return dbRef.current?.clear();
  }, [isReady]);

  return {
    isReady,
    error,
    setValue,
    getValue,
    deleteValue,
    clearAll,
  };
}
