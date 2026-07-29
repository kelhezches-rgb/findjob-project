'use client'
import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string; error?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, id, ...props }, ref) => {
  const inputId = id || props.name
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>
      <input ref={ref} id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`min-h-touch w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
        {...props} />
      {error && <p id={errorId} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string; error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, id, ...props }, ref) => {
  const inputId = id || props.name
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>
      <textarea ref={ref} id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
        {...props} />
      {error && <p id={errorId} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string; error?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, id, children, ...props }, ref) => {
  const inputId = id || props.name
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>
      <select ref={ref} id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`min-h-touch w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition-all
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
        {...props}>{children}</select>
      {error && <p id={errorId} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}
export function Button({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex min-h-touch items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-sm' }
  const variants = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger:    'bg-red-50 text-red-600 hover:bg-red-100',
    ghost:     'text-indigo-600 hover:bg-indigo-50',
  }
  return (
    <button disabled={disabled || isLoading} aria-busy={isLoading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
      {children}
    </button>
  )
}

const badgeVariants: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  reviewed:    'bg-blue-50 text-blue-700',
  shortlisted: 'bg-amber-50 text-amber-700',
  rejected:    'bg-red-50 text-red-600',
  hired:       'bg-green-50 text-green-700',
  draft:       'bg-gray-100 text-gray-500',
  active:      'bg-green-50 text-green-700',
  closed:      'bg-amber-50 text-amber-700',
  expired:     'bg-red-50 text-red-500',
  seeker:      'bg-indigo-50 text-indigo-700',
  employer:    'bg-violet-50 text-violet-700',
  admin:       'bg-orange-50 text-orange-700',
}
export function Badge({ label, variant }: { label: string; variant?: string }) {
  const style = badgeVariants[variant || ''] || 'bg-gray-100 text-gray-600'
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>{label}</span>
}

export function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description?: string; action?: ReactNode
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
      <div className="text-gray-300" aria-hidden="true">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function LoadingSpinner({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" aria-hidden="true" />
      {text}
    </div>
  )
}

// Skeleton placeholder for content that's still loading — reduces layout
// shift and reads better than a spinner for list/card-shaped content.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

export function JobCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

import { Pagination as PaginationType } from '@/types'
export function PaginationBar({ pagination, onPageChange }: {
  pagination: PaginationType; onPageChange: (page: number) => void
}) {
  if (pagination.totalPages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button variant="secondary" size="sm" disabled={!pagination.hasPrev}
        onClick={() => onPageChange(pagination.page - 1)}>ก่อนหน้า</Button>
      <span className="text-sm text-gray-500">หน้า {pagination.page} / {pagination.totalPages}</span>
      <Button variant="secondary" size="sm" disabled={!pagination.hasNext}
        onClick={() => onPageChange(pagination.page + 1)}>ถัดไป</Button>
    </div>
  )
}
