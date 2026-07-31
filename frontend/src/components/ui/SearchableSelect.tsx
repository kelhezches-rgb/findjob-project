'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, X, Loader2 } from 'lucide-react'

export interface SelectOption { id: number; label: string; sublabel?: string }

interface SearchableSelectProps {
  placeholder: string
  value: SelectOption | null
  options: SelectOption[]
  onChange: (option: SelectOption | null) => void
  disabled?: boolean
  loading?: boolean
  disabledHint?: string
}

export function SearchableSelect({
  placeholder, value, options, onChange, disabled, loading, disabledHint,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  useEffect(() => { setActiveIndex(0) }, [query, open])

  const selectOption = (opt: SelectOption | null) => {
    onChange(opt)
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); return }
    if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIndex]) selectOption(filtered[activeIndex]); return }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors
          ${disabled ? 'cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-text border-gray-300 bg-white focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-100'}`}
        onClick={() => !disabled && (setOpen(true), inputRef.current?.focus())}
        title={disabled ? disabledHint : undefined}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          value={open ? query : value?.label || ''}
          placeholder={placeholder}
          onFocus={() => !disabled && setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-400 disabled:cursor-not-allowed"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" aria-hidden="true" />}
        {!loading && value && !disabled && (
          <button
            type="button"
            aria-label="ล้างค่า"
            onClick={e => { e.stopPropagation(); selectOption(null) }}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {!loading && !disabled && <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />}
      </div>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-64 w-full min-w-[14rem] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2 text-sm text-gray-400">ไม่พบผลลัพธ์</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.id}
                role="option"
                aria-selected={value?.id === opt.id}
                onMouseDown={e => { e.preventDefault(); selectOption(opt) }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`cursor-pointer px-3.5 py-2 text-sm transition-colors
                  ${i === activeIndex ? 'bg-navy-50 text-navy-800' : 'text-gray-700'}
                  ${value?.id === opt.id ? 'font-semibold' : ''}`}
              >
                {opt.label}
                {opt.sublabel && <span className="ml-1.5 text-xs text-gray-400">{opt.sublabel}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
