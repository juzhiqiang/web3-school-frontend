import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseClasses = 'border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : ''
  const paddingClasses = leftIcon && rightIcon ? 'pl-10 pr-10 py-2' :
                        leftIcon ? 'pl-10 pr-4 py-2' :
                        rightIcon ? 'pl-4 pr-10 py-2' : 'px-4 py-2'
  const widthClass = fullWidth ? 'w-full' : ''
  
  const inputClasses = `
    ${baseClasses}
    ${errorClasses}
    ${paddingClasses}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Input