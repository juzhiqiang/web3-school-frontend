import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200'
  const paddingClass = padding ? 'p-6' : ''
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : ''
  const clickableClass = onClick ? 'cursor-pointer' : ''
  
  const classes = `
    ${baseClasses}
    ${paddingClass}
    ${hoverClass}
    ${clickableClass}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  )
}

export default Card