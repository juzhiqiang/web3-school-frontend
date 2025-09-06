// 重新导出所有类型定义
export * from './course'
export * from './courseTypes'
export * from './transaction'
export * from './web3'
export * from './env'

// 通用类型定义
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface User {
  address: string
  name?: string
  avatar?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

// 组件 Props 类型
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  type?: 'text' | 'number' | 'email' | 'password'
}

// 表单类型
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  validation?: (value: any) => string | undefined
  options?: { label: string; value: any }[]
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
}

// 路由类型
export interface RouteParams {
  id?: string
  courseId?: string
  transactionId?: string
}

// 主题类型
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  breakpoints: {
    mobile: string
    tablet: string
    desktop: string
  }
}

// 设置类型
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh' | 'en'
  notifications: {
    email: boolean
    push: boolean
    transaction: boolean
    course: boolean
  }
  privacy: {
    showBalance: boolean
    showTransactions: boolean
  }
}