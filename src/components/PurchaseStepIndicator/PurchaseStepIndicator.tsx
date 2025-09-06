import React from 'react'
import { Shield, CreditCard, CheckCircle, Loader } from 'lucide-react'

interface PurchaseStepIndicatorProps {
  currentStep: 'idle' | 'checking' | 'approving' | 'purchasing' | 'completed' | 'error'
  price: string
  error?: string
}

export const PurchaseStepIndicator: React.FC<PurchaseStepIndicatorProps> = ({
  currentStep,
  price,
  error
}) => {
  const steps = [
    {
      id: 'checking',
      title: '检查余额和授权',
      icon: Shield,
      status: currentStep === 'checking' ? 'active' : currentStep === 'idle' ? 'pending' : 'completed'
    },
    {
      id: 'approving',
      title: '授权代币',
      icon: Shield,
      status: currentStep === 'approving' ? 'active' : 
             ['checking', 'idle'].includes(currentStep) ? 'pending' : 'completed'
    },
    {
      id: 'purchasing',
      title: '购买课程',
      icon: CreditCard,
      status: currentStep === 'purchasing' ? 'active' :
             ['checking', 'idle', 'approving'].includes(currentStep) ? 'pending' : 'completed'
    },
    {
      id: 'completed',
      title: '购买完成',
      icon: CheckCircle,
      status: currentStep === 'completed' ? 'completed' : 'pending'
    }
  ]

  if (currentStep === 'idle') {
    return null
  }

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-medium text-blue-800 mb-3">购买进度</h4>
      
      <div className="space-y-3">
        {steps.map((step) => {
          const IconComponent = step.icon
          const isActive = step.status === 'active'
          const isCompleted = step.status === 'completed'
          
          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {isActive ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <IconComponent className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-green-700' :
                  isActive ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </p>
                
                {step.id === 'approving' && isActive && (
                  <p className="text-xs text-blue-600">
                    授权 {price} YD 给课程合约...
                  </p>
                )}
                
                {step.id === 'purchasing' && isActive && (
                  <p className="text-xs text-blue-600">
                    支付 {price} YD 购买课程...
                  </p>
                )}
              </div>
              
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          )
        })}
      </div>
      
      {error && currentStep === 'error' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default PurchaseStepIndicator
