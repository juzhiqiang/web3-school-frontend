import { AlertCircle } from "lucide-react";

interface TokenSwapTipProps {
  isLocalNetwork: boolean;
}

function TokenSwapTip({ isLocalNetwork }: TokenSwapTipProps) {
  {
    /* 注意事项 */
  }

  return (
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
  );
}

export default TokenSwapTip;
