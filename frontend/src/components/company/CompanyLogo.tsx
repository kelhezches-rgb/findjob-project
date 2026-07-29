import { API_ORIGIN } from '@/lib/api'

const SIZE_CLASSES = {
  sm: 'h-10 w-10 rounded-lg text-base',
  md: 'h-12 w-12 rounded-xl text-lg',
  lg: 'h-14 w-14 rounded-2xl text-2xl',
} as const

interface CompanyLogoProps {
  name: string
  logoUrl?: string | null
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export function CompanyLogo({ name, logoUrl, size = 'md', className = '' }: CompanyLogoProps) {
  const sizeClasses = SIZE_CLASSES[size]

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${API_ORIGIN}${logoUrl}`}
        alt={name}
        loading="lazy"
        decoding="async"
        className={`shrink-0 border border-gray-100 bg-white object-contain ${sizeClasses} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-indigo-50 font-bold text-indigo-600 ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      {name[0]}
    </div>
  )
}
