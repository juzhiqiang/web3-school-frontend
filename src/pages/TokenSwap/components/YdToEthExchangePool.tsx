import { RefreshCw, DollarSign } from "lucide-react";
import { useTokenSwap } from "../../../hooks/useTokenSwap";
import { useWeb3 } from "../../../contexts/Web3Context";

function YdToEthExchangePool() {
  const { address, refetchBalance } = useWeb3();
  const {
    isContractAvailable,
    contractTokenBalance,
    contractETHBalance,
    isLoading,
    mintAndDepositTestTokens,
    depositETHToContract,
  } = useTokenSwap(refetchBalance);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
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
                <div className="text-xs text-gray-500 mt-1">用于购买YD</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {parseFloat(contractTokenBalance).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">合约中YD</div>
                <div className="text-xs text-gray-500 mt-1">可购买数量</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-center text-gray-500">
              💡 显示合约中可用于兑换的资金数量
            </div>

            {/* 测试充值按钮 */}
            <div className="mt-4 text-center space-y-2">
              {/* 充值一灯币按钮 */}
              {contractTokenBalance !== undefined &&
                parseFloat(contractTokenBalance) < 100000 && (
                  <div>
                    <button
                      onClick={() => mintAndDepositTestTokens("2000000")}
                      disabled={isLoading || !address}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                    >
                      <span>🪙</span>
                      <span>
                        {isLoading ? "处理中..." : "充值2000000一灯币到合约"}
                      </span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      给合约充值一灯币用于用户购买
                    </p>
                  </div>
                )}

              {/* 充值ETH按钮 */}
              {contractETHBalance !== undefined &&
                parseFloat(contractETHBalance) < 0.1 && (
                  <div>
                    <button
                      onClick={() => depositETHToContract("1")}
                      disabled={isLoading || !address}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                    >
                      <span>💎</span>
                      <span>{isLoading ? "处理中..." : "充值1ETH到合约"}</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      给合约充值ETH用于用户出售
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default YdToEthExchangePool;
