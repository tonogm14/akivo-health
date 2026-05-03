import { useState, useEffect, useRef } from 'react';
import { createLiveStream } from '@/api/client';

export function useLiveStream() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    const close = createLiveStream((event) => {
      setConnected(true);
      setEvents(prev => [event, ...prev].slice(0, 100));
    });
    closeRef.current = close;

    // Heartbeat check
    const hb = setInterval(() => {
      setConnected(prev => prev);
    }, 5000);

    return () => {
      close();
      clearInterval(hb);
    };
  }, []);

  function clear() { setEvents([]); }

  return { events, connected, clear };
}
