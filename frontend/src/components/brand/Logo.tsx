'use client'
import Link from 'next/link'
import Image from 'next/image'

type LogoVariant = 'icon' | 'lockup'

interface LogoProps {
  /** 'icon' = mascot only (compact navbars). 'lockup' = mascot + "jobboard" wordmark (auth screens, footer). */
  variant?: LogoVariant
  href?: string
  className?: string
  imgClassName?: string
  priority?: boolean
  children?: React.ReactNode
}

const LOGO_SRC: Record<LogoVariant, string> = {
  icon:   '/brand/logo-icon.png',
  lockup: '/brand/logo-notag.png',
}

// Natural pixel dimensions of the source crops — kept in sync with the
// files in /public/brand so next/image can reserve layout space correctly.
const LOGO_DIMENSIONS: Record<LogoVariant, { width: number; height: number }> = {
  icon:   { width: 620, height: 620 },
  lockup: { width: 1380, height: 475 },
}

// The single official JobBoard logo. Always the mascot, always links home,
// always the same alt text — use this everywhere instead of ad-hoc "J" badges.
export function Logo({ variant = 'icon', href = '/', className = '', imgClassName = '', priority, children }: LogoProps) {
  const { width, height } = LOGO_DIMENSIONS[variant]
  return (
    <Link href={href} aria-label="JobBoard Home" className={`inline-flex shrink-0 items-center ${className}`}>
      <Image
        src={LOGO_SRC[variant]}
        alt="JobBoard Home"
        width={width}
        height={height}
        priority={priority}
        className={`${variant === 'icon' ? 'h-9 w-9' : 'h-9 w-auto'} object-contain ${imgClassName}`}
      />
      {children}
    </Link>
  )
}
