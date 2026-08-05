'use client'
import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; variant: ToastVariant }

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-green-200 bg-green-50 text-green-800' },
  error:   { icon: XCircle,      className: 'border-red-200 bg-red-50 text-red-800' },
  info:    { icon: Info,         className: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto"
        style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
        aria-live="polite"
        role="status"
      >
        {toasts.map(t => {
          const { icon: Icon, className } = VARIANT_STYLES[t.variant]
          return (
            <div
              key={t.id}
              className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg sm:w-96 ${className}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="ปิดการแจ้งเตือน"
                className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
