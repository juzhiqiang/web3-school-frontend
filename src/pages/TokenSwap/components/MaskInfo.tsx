import { useEffect } from "react";
import { RefreshCw, Wallet } from "lucide-react";
import { useWeb3 } from "../../../contexts/Web3Context";
import { useTokenSwap } from "../../../hooks/useTokenSwap";
import { useUniswapETHUSDT } from "../../../hooks/useUniswapETHUSDT";
import toast from "react-hot-toast";

function MaskInfo() {
  const { address, balance, refetchBalance } = useWeb3();
  const { userTokenBalance, isLoading, isConfirmed, refetchAll } =
    useTokenSwap(refetchBalance);

  // Uniswap hook
  const {
    usdtBalance,
    isConfirmed: isUniswapConfirmed,
    refetchAll: refetchUniswap,
  } = useUniswapETHUSDT();

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed || isUniswapConfirmed) {
      toast.success("🎉 兑换已确认！正在更新所有余额...");

      // 额外延迟刷新以确保用户看到最新余额
      setTimeout(() => {
        toast.success("✅ ETH和代币余额已更新完成！");
      }, 3000);
    }
  }, [isConfirmed, isUniswapConfirmed]);

  return (
    <>
      {/* 标题和刷新按钮 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <h1 className="text-3xl font-bold">一灯币兑换</h1>
          <button
            onClick={() => {
              refetchAll();
              refetchUniswap();
              toast.success("🔄 正在刷新数据...");
            }}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="手动刷新所有数据"
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <p className="text-gray-600 mb-6">安全、快速的代币兑换服务</p>
      </div>

      {/* 用户余额卡片 */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-1">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <span>我的账户余额</span>
              {isLoading && (
                <RefreshCw className={`h-4 w-4 text-blue-500 animate-spin`} />
              )}
            </h3>
            <div className="text-sm text-gray-500">
              {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* ETH 余额 */}
            <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {balance ? parseFloat(balance).toFixed(4) : "0.0000"}
              </div>
              <div className="text-sm font-medium text-gray-600">ETH</div>
              <div className="text-xs text-gray-500 mt-1">以太坊</div>
            </div>

            {/* 一灯币余额 */}
            <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {parseFloat(userTokenBalance).toFixed(2)}
              </div>
              <div className="text-sm font-medium text-gray-600">YD</div>
              <div className="text-xs text-gray-500 mt-1">一灯币</div>
            </div>

            {/* USDT 余额 */}
            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {parseFloat(usdtBalance).toFixed(2)}
              </div>
              <div className="text-sm font-medium text-gray-600">USDT</div>
              <div className="text-xs text-gray-500 mt-1">稳定币</div>
            </div>
          </div>

          {/* 余额总览提示 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span>🔄 支持双向兑换</span>
              <span>⚡ 实时更新</span>
              <span>🔒 安全可靠</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MaskInfo;
