  // 修复：改进的授权处理函数
  const handleApprove = async () => {
    if (!inputAmount) {
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }
    
    console.log('🔐 开始授权操作:', {
      tokenAmount: inputAmount,
      contractAddress,
      userTokenBalance,
      currentAllowance: allowance
    })
    
    await approveTokens(inputAmount)
    
    // 授权提交后给用户提示
    toast.success('授权交易已提交，等待确认后即可进行兑换')
  }
  
  // 关键修复：改进按钮状态逻辑
  const getButtonConfig = () => {
    if (!isContractAvailable) {
      return { 
        text: `合约未部署到${networkName}`, 
        disabled: true, 
        className: 'bg-red-400',
        action: undefined
      }
    }
    
    if (isLoading) {
      return { text: '处理中...', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      return { text: '请输入金额', disabled: true, className: 'bg-gray-400' }
    }
    
    if (!isValidInput()) {
      return { text: '余额不足', disabled: true, className: 'bg-red-400' }
    }
    
    // 关键修复：出售模式的授权检查逻辑
    if (swapMode === 'sell') {
      const needsAuth = needsApproval(inputAmount)
      console.log('🔐 出售模式按钮状态检查:', {
        inputAmount,
        needsApproval: needsAuth,
        allowance: allowance?.toString(),
        userTokenBalance: userTokenBalance?.toString()
      })
      
      if (needsAuth) {
        return { 
          text: '授权一灯币 (一次性)', 
          disabled: false, 
          className: 'bg-yellow-600 hover:bg-yellow-700',
          action: handleApprove
        }
      } else {
        // 已授权，显示出售按钮
        return {
          text: '出售一灯币',
          disabled: false,
          className: 'bg-red-600 hover:bg-red-700',
          action: handleSwap
        }
      }
    }
    
    // 购买模式直接显示购买按钮
    return {
      text: '购买一灯币',
      disabled: false,
      className: 'bg-blue-600 hover:bg-blue-700',
      action: handleSwap
    }
  }