'use client'

import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-terminal-green/10',
    border: 'border-terminal-green/40',
    icon: 'text-terminal-green',
  },
  error: {
    bg: 'bg-terminal-red/10',
    border: 'border-terminal-red/40',
    icon: 'text-terminal-red',
  },
  warning: {
    bg: 'bg-terminal-amber/10',
    border: 'border-terminal-amber/40',
    icon: 'text-terminal-amber',
  },
  info: {
    bg: 'bg-terminal-surface',
    border: 'border-terminal-border',
    icon: 'text-terminal-text',
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const colors = COLORS[toast.type] || COLORS.info
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto p-3 rounded-lg border backdrop-blur-sm',
              'animate-slide-in flex items-start gap-3 shadow-lg',
              colors.bg,
              colors.border
            )}
          >
            <span className={clsx('text-lg font-bold mt-0.5', colors.icon)}>
              {ICONS[toast.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-terminal-text text-sm font-bold">{toast.title}</p>
              {toast.message && (
                <p className="text-terminal-text-dim text-xs mt-0.5">{toast.message}</p>
              )}
              <p className="text-terminal-text-muted text-[10px] mt-1">
                {new Date(toast.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-terminal-text-muted hover:text-terminal-text text-sm"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
