import * as React from 'react'
import { cn } from '../utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  }
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Mustache icon - stylized 'M' with curves */}
      <div className={cn('relative flex items-center justify-center', sizes[size])}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mustache shape */}
          <path
            d="M4 16C4 12 8 8 12 12C14 10 18 10 20 12C24 8 28 12 28 16C28 20 24 16 20 16C18 18 14 18 12 16C8 16 4 20 4 16Z"
            fill="url(#gradient)"
            className="drop-shadow-sm"
          />
          
          {/* Dollar sign overlay */}
          <path
            d="M16 6V26M12 10H18C19.1 10 20 10.9 20 12C20 13.1 19.1 14 18 14H14C12.9 14 12 14.9 12 16C12 17.1 12.9 18 14 18H20M12 22H18C19.1 22 20 21.1 20 20C20 18.9 19.1 18 18 18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent',
          textSizes[size]
        )}>
          Mustache Cashstache
        </span>
      )}
    </div>
  )
}