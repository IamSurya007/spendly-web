'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type CompanionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface OrbitLogMessage {
  id: string;
  timestamp: string;
  type: 'sent' | 'received' | 'system' | 'error';
  text: string;
  payload?: Record<string, unknown>;
}

const DEFAULT_WS_URL = 'ws://localhost:9876';

export function useOrbitCompanion(overrideUrl?: string) {
  const wsUrl = overrideUrl || process.env.NEXT_PUBLIC_ORBIT_WS_URL || DEFAULT_WS_URL;

  const [status, setStatus] = useState<CompanionStatus>('DISCONNECTED');
  const [logs, setLogs] = useState<OrbitLogMessage[]>([]);
  const [lastEventSent, setLastEventSent] = useState<Record<string, unknown> | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backoffDelayRef = useRef<number>(1000); // Initial backoff 1s
  const isManuallyClosedRef = useRef<boolean>(false);

  const addLog = useCallback((type: OrbitLogMessage['type'], text: string, payload?: Record<string, unknown>) => {
    const newLog: OrbitLogMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type,
      text,
      payload,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    isManuallyClosedRef.current = false;
    setStatus('CONNECTING');
    addLog('system', `Connecting to local companion at ${wsUrl}...`);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus('CONNECTED');
        backoffDelayRef.current = 1000; // Reset backoff delay on successful connection
        addLog('system', `Successfully connected to local companion on ${wsUrl}`);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          addLog('received', `Received message from companion`, parsed);
        } catch {
          addLog('received', `Received raw text message: ${event.data}`);
        }
      };

      ws.onerror = () => {
        addLog('error', `WebSocket connection error on ${wsUrl}`);
      };

      ws.onclose = () => {
        setStatus('DISCONNECTED');
        wsRef.current = null;

        if (!isManuallyClosedRef.current) {
          // Exponential backoff logic: doubling delay up to max 10 seconds
          const delay = backoffDelayRef.current;
          addLog('system', `Connection lost. Retrying in ${(delay / 1000).toFixed(1)}s...`);
          
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, delay);

          backoffDelayRef.current = Math.min(delay * 1.5, 10000);
        } else {
          addLog('system', `Disconnected from companion.`);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setStatus('DISCONNECTED');
      addLog('error', `Failed to initialize WebSocket connection: ${err instanceof Error ? err.message : String(err)}`);
      
      const delay = backoffDelayRef.current;
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
      backoffDelayRef.current = Math.min(delay * 1.5, 10000);
    }
  }, [wsUrl, addLog]);

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('DISCONNECTED');
  }, []);

  useEffect(() => {
    connect();

    const handleBeforeUnload = () => {
      isManuallyClosedRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      isManuallyClosedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendEvent = useCallback(
    (event: 'game_started' | 'game_ended', gameId?: string) => {
      const targetGameId = gameId || `chess-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        event,
        gameId: targetGameId,
        timestamp: new Date().toISOString(),
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(payload));
          setLastEventSent(payload);
          addLog('sent', `Event sent: ${event} (Game ID: ${targetGameId})`, payload);
          return true;
        } catch (err) {
          addLog('error', `Failed to send event over WebSocket: ${err instanceof Error ? err.message : String(err)}`);
          return false;
        }
      } else {
        addLog('error', `Cannot send event ${event}. WebSocket is not connected.`, payload);
        return false;
      }
    },
    [addLog]
  );

  const startGame = useCallback(
    (gameId?: string) => sendEvent('game_started', gameId),
    [sendEvent]
  );

  const endGame = useCallback(
    (gameId?: string) => sendEvent('game_ended', gameId),
    [sendEvent]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    status,
    wsUrl,
    startGame,
    endGame,
    sendEvent,
    reconnect: connect,
    disconnect,
    logs,
    clearLogs,
    lastEventSent,
    isConnected: status === 'CONNECTED',
  };
}
