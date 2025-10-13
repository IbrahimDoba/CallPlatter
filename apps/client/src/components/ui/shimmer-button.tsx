'use client'

import type * as React from 'react'

import { motion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
  background?: string
}

function ShimmerButton({ children, className, background, ...props }: ShimmerButtonProps) {
  return (
    <motion.button
      className='relative inline-flex overflow-hidden rounded-lg bg-[linear-gradient(120deg,var(--primary)_calc(var(--shimmer-button-x)-25%),var(--primary-foreground)_var(--shimmer-button-x),var(--primary)_calc(var(--shimmer-button-x)+25%))] [--shimmer-button-x:0%]'
      initial={{
        scale: 1,
        '--shimmer-button-x': '-100%'
      }}
      animate={{
        '--shimmer-button-x': '200%'
      }}
      transition={{
        stiffness: 500,
        damping: 20,
        type: 'spring',
        '--shimmer-button-x': {
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.445, 0.05, 0.55, 0.95]
        }
      }}
      whileTap={{
        scale: 0.95
      }}
      whileHover={{
        scale: 1.05
      }}
      {...props}
    >
      <span
        className={cn(
          'm-0.5 rounded-md px-4 py-2 text-sm font-medium text-white backdrop-blur-sm',
          background || 'bg-destructive',
          className
        )}
      >
        {children}
      </span>
    </motion.button>
  )
}

export { ShimmerButton, type ShimmerButtonProps }
