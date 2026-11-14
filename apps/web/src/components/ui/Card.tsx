import type { HTMLAttributes } from 'react'
import './Card.css'

type CardProps = HTMLAttributes<HTMLDivElement>

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card