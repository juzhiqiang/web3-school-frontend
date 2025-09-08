                          {swapMode === "buy"
                            ? feeRates.buyFee
                            : feeRates.sellFee}%
                        </span>
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
          {((swapType === "yideng" && isContractAvailable) ||
            (swapType === "uniswap" && isUniswapSupported)) && (
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center space-x-1"
              >
                <span>高级设置</span>
                <span>{showAdvanced ? "▲" : "▼"}</span>
              </button>

              {showAdvanced && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    滑点容差:{" "}
                    {swapType === "yideng" ? slippage : uniswapSlippage}%
                  </label>
                  <input
                    type="range"
                    min={
                      swapType === "yideng"
                        ? TOKEN_SWAP_CONFIG.MIN_SLIPPAGE
                        : 0.1
                    }
                    max={
                      swapType === "yideng"
                        ? TOKEN_SWAP_CONFIG.MAX_SLIPPAGE
                        : 5.0
                    }
                    step="0.1"
                    value={swapType === "yideng" ? slippage : uniswapSlippage}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (swapType === "yideng") {
                        setSlippage(value);
                      } else {
                        setUniswapSlippage(value);
                      }
                    }}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {swapType === "yideng"
                        ? TOKEN_SWAP_CONFIG.MIN_SLIPPAGE
                        : 0.1}
                      %
                    </span>
                    <span>
                      {swapType === "yideng"
                        ? TOKEN_SWAP_CONFIG.MAX_SLIPPAGE
                        : 5.0}
                      %
                    </span>
                  </div>
                  {swapType === "uniswap" && (
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
          {((transactionHash && swapType === "yideng") ||
            (uniswapHash && swapType === "uniswap")) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {(swapType === "yideng" && isConfirmed) ||
                  (swapType === "uniswap" && isUniswapConfirmed)
                    ? "交易已确认"
                    : "交易已提交"}
                </span>
              </div>
              <p className="text-xs text-blue-600 break-all">
                交易哈希:{" "}
                {swapType === "yideng" ? transactionHash : uniswapHash}
              </p>
              <p className="text-xs text-blue-500 mt-1">网络: {networkName}</p>
              <p className="text-xs text-blue-500 mt-1">
                交易类型:{" "}
                {swapType === "yideng" ? "一灯币兑换" : "Uniswap ETH-USDT"}
              </p>
              {!((swapType === "yideng" && isConfirmed) ||
                (swapType === "uniswap" && isUniswapConfirmed)) && (
                <p className="text-xs text-blue-500 mt-1">等待区块确认中...</p>
              )}
            </div>
          )}
        </div>

        {/* 合约资金库存状态 */}
        <YdToEthExchangePool />

        {/* 注意事项 */}
        <TokenSwapTip isLocalNetwork={isLocalNetwork} />
      </div>
    </div>
  );
}

export default TokenSwap;
