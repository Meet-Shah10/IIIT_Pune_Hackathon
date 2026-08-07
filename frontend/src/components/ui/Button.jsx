import React from 'react'
import { cn } from '../../lib/utils'

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          'btn-primary': variant === 'primary',
          'btn-ghost': variant === 'ghost',
          'btn-destructive': variant === 'destructive',
          'h-10 px-4 py-2 text-sm': size === 'default',
          'h-8 rounded-md px-3 text-xs': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"
