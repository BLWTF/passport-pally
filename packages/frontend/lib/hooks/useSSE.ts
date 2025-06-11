/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import useAuth from "./useAuth";

export default function useSSE<T>(url: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Event>();
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const eventSourceRef = useRef<EventSource>(null);
  const { isAuthenticated, refresh } = useAuth();

  useEffect(() => {
    if (!url || !isAuthenticated) return;

    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus("connected");
      setError(undefined);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (err: unknown) {
        setData(event.data);
      }
    };

    eventSource.onerror = (err) => {
      setConnectionStatus("error");
      setError(err);
      refresh();
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, url]);

  const closeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setConnectionStatus("closed");
    }
  };

  return { data, error, connectionStatus, closeConnection };
}
