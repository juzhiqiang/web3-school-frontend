                    </p>
                  )}
                </div>
              )}
              
              {/* Uniswap USDT换ETH模式授权提示 */}
              {swapType === 'uniswap' && uniswapMode === 'usdt-to-eth' && isUniswapSupported && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">USDT授权状态:</span>
                    <span className={`font-medium ${needsUSDTApproval(inputAmount) ? 'text-yellow-600' : 'text-green-600'}`}>
                      {needsUSDTApproval(inputAmount) ? '需要授权' : '已授权'}
                    </span>
                  </div>
                  {needsUSDTApproval(inputAmount) ? (
                    <p className="text-xs text-yellow-600 mt-1">
                      使用USDT换ETH前需要先授权Uniswap合约使用您的USDT（一次性授权，之后无需重复）
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ USDT已授权，可以直接进行兑换
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* 交易详情 */}
          {inputAmount && parseFloat(inputAmount) > 0 && ((swapType === 'yideng' && isContractAvailable) || (swapType === 'uniswap' && isUniswapSupported)) && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">交易详情</h4>
              <div className="text-xs text-blue-700 space-y-1">
                {swapType === 'yideng' ? (
                  <>
                    <div className="flex justify-between">
                      <span>兑换率</span>
                      <span>1 ETH = {exchangeRate.toLocaleString()} YD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>手续费</span>
                      <span>{swapMode === 'buy' ? feeRates.buyFee : feeRates.sellFee}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>滑点容差</span>
                      <span>{slippage}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>交易对</span>
                      <span>ETH/USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>滑点容差</span>
                      <span>{uniswapSlippage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>交易平台</span>
                      <span>Uniswap V2</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span>网络</span>
                  <span>{networkName}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 高级设置 */}
          {((swapType === 'yideng' && isContractAvailable) || (swapType === 'uniswap' && isUniswapSupported)) && (
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center space-x-1"
              >
                <span>高级设置</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
              </button>
              
              {showAdvanced && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    滑点容差: {swapType === 'yideng' ? slippage : uniswapSlippage}%
                  </label>
                  <input
                    type="range"
                    min={swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MIN_SLIPPAGE : 0.1}
                    max={swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MAX_SLIPPAGE : 5.0}
                    step="0.1"
                    value={swapType === 'yideng' ? slippage : uniswapSlippage}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (swapType === 'yideng') {
                        setSlippage(value)
                      } else {
                        setUniswapSlippage(value)
                      }
                    }}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MIN_SLIPPAGE : 0.1}%</span>
                    <span>{swapType === 'yideng' ? TOKEN_SWAP_CONFIG.MAX_SLIPPAGE : 5.0}%</span>
                  </div>
                  {swapType === 'uniswap' && (
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Uniswap交易具有价格波动风险，建议设置适当的滑点容差
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* 兑换按钮 */}
          <div className="mt-6">
            <button
              onClick={buttonConfig.action}
              disabled={buttonConfig.disabled}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonConfig.className} text-white`}
            >
              {buttonConfig.text}
            </button>
          </div>
          
          {/* 交易状态 */}
          {((transactionHash && swapType === 'yideng') || (uniswapHash && swapType === 'uniswap')) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {(swapType === 'yideng' && isConfirmed) || (swapType === 'uniswap' && isUniswapConfirmed) ? '交易已确认' : '交易已提交'}
                </span>
              </div>
              <p className="text-xs text-blue-600 break-all">
                交易哈希: {swapType === 'yideng' ? transactionHash : uniswapHash}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                网络: {networkName}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                交易类型: {swapType === 'yideng' ? '一灯币兑换' : 'Uniswap ETH-USDT'}
              </p>
              {!((swapType === 'yideng' && isConfirmed) || (swapType === 'uniswap' && isUniswapConfirmed)) && (
                <p className="text-xs text-blue-500 mt-1">等待区块确认中...</p>
              )}
            </div>
          )}
        </div>
        
        {/* 合约资金库存状态 */}
        {isContractAvailable && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <span>合约资金库存</span>
              {isLoading && (
                <RefreshCw className={`h-4 w-4 text-purple-500 animate-spin`} />
              )}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {parseFloat(contractETHBalance).toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">合约中ETH</div>
                <div className="text-xs text-gray-500 mt-1">
                  用于购买YD
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {parseFloat(contractTokenBalance).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">合约中YD</div>
                <div className="text-xs text-gray-500 mt-1">
                  可购买数量
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-center text-gray-500">
              💡 显示合约中可用于兑换的资金数量
            </div>
            
            {/* 测试充值按钮 - 仅在本地网络显示 */}
            {isLocalNetwork && (
              <div className="mt-4 text-center space-y-2">
                {/* 充值一灯币按钮 */}
                {contractTokenBalance !== undefined && parseFloat(contractTokenBalance) < 100000 && (
                  <div>
                    <button
                      onClick={() => mintAndDepositTestTokens("2000000")}
                      disabled={isLoading || !address}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                    >
                      <span>🪙</span>
                      <span>{isLoading ? "处理中..." : "充值2000000一灯币到合约"}</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">给合约充值一灯币用于用户购买</p>
                  </div>
                )}
                
                {/* 充值ETH按钮 */}
                {contractETHBalance !== undefined && parseFloat(contractETHBalance) < 0.1 && (
                  <div>
                    <button
                      onClick={() => depositETHToContract("1")}
                      disabled={isLoading || !address}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                    >
                      <span>💎</span>
                      <span>{isLoading ? "处理中..." : "充值1ETH到合约"}</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">给合约充值ETH用于用户出售</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400">仅测试环境可用</p>
              </div>
            )}
          </div>
        )}
        
        {/* 注意事项 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">重要提示</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 交易确认后余额会自动实时更新，无需手动刷新</li>
                <li>• 交易需要支付网络gas费用</li>
                <li>• 出售代币前需要先授权合约使用您的代币（一次性授权）</li>
                <li>• 兑换按固定汇率执行，设置滑点容差防止价格变动</li>
                <li>• 交易一旦提交无法撤销，请仔细确认金额</li>
                <li>• 请确保合约中有足够的资金进行兑换</li>
                {isLocalNetwork && (
                  <li>• 当前使用Ganache本地测试网络，交易仅用于测试目的</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSwap