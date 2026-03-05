'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store/useStore'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
const RECONNECT_DELAYS = [2000, 4000, 8000, 16000]

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const {
    setBackendConnected,
    setLastDataUpdate,
    addToast,
    addAuditEntry,
  } = useStore()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        retryRef.current = 0
        setBackendConnected(true)
        setLastDataUpdate(Date.now())
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastDataUpdate(Date.now())

          // Route incoming events to the store
          switch (data.type) {
            case 'metrics_update':
              // TopBar will pick this up via polling fallback or direct store update
              break
            case 'signal_alert':
              addToast({
                type: data.severity === 'critical' ? 'error' : 'warning',
                title: `Signal: $${data.ticker}`,
                message: data.message,
                autoDismiss: data.severity !== 'critical',
              })
              addAuditEntry({
                user: 'system',
                action: `Signal alert: $${data.ticker} — ${data.message}`,
                category: 'trade',
                severity: data.severity === 'critical' ? 'critical' : 'info',
              })
              break
            case 'trade_executed':
              addToast({
                type: 'success',
                title: `Trade Executed`,
                message: `${data.action} ${data.quantity} $${data.ticker} @ $${data.price}`,
              })
              addAuditEntry({
                user: 'system',
                action: `Auto-executed: ${data.action} ${data.quantity} $${data.ticker} @ $${data.price}`,
                category: 'trade',
                severity: 'info',
              })
              break
            case 'risk_alert':
              addToast({
                type: 'error',
                title: 'Risk Alert',
                message: data.message,
                autoDismiss: false,
              })
              addAuditEntry({
                user: 'system',
                action: `Risk alert: ${data.message}`,
                category: 'risk',
                severity: 'critical',
              })
              break
            case 'agent_status':
              if (data.status === 'error') {
                addToast({
                  type: 'error',
                  title: `Agent Error: ${data.agent}`,
                  message: data.message,
                  autoDismiss: false,
                })
              }
              break
          }
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onclose = () => {
        setBackendConnected(false)
        wsRef.current = null

        // Retry with exponential backoff
        const delay = RECONNECT_DELAYS[Math.min(retryRef.current, RECONNECT_DELAYS.length - 1)]
        retryRef.current++
        setTimeout(connect, delay)
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    } catch {
      // WebSocket construction failed — retry
      const delay = RECONNECT_DELAYS[Math.min(retryRef.current, RECONNECT_DELAYS.length - 1)]
      retryRef.current++
      setTimeout(connect, delay)
    }
  }, [setBackendConnected, setLastDataUpdate, addToast, addAuditEntry])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return { connected: !!wsRef.current && wsRef.current.readyState === WebSocket.OPEN }
}
