import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({
  children,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button