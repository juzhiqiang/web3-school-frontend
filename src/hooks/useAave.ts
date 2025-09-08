import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import {
  AAVE_CONFIG,
  AAVE_POOL_ABI,
  AAVE_DATA_PROVIDER_ABI,
  ERC20_ABI,
  getAaveConfig,
  isAaveSupported,
  formatNumber,
  formatApy,
} from '../config/aave';
import toast from 'react-hot-toast';

export interface AaveUserData {
  totalCollateral: string;
  totalDebt: string;
  availableBorrows: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

export interface AaveDepositData {
  currentATokenBalance: string;
  liquidityRate: string;
  totalSupplied: string;
  apy: string;
}

export const useAave = () => {
  const { provider, signer, address, chainId } = useWeb3();

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [aUsdtBalance, setAUsdtBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [depositData, setDepositData] = useState<AaveDepositData>({
    currentATokenBalance: '0',
    liquidityRate: '0',
    totalSupplied: '0',
    apy: '0',
  });
  const [userData, setUserData] = useState<AaveUserData>({
    totalCollateral: '0',
    totalDebt: '0',
    availableBorrows: '0',
    currentLiquidationThreshold: '0',
    ltv: '0',
    healthFactor: '0',
  });

  // 获取当前网络配置
  const aaveConfig = chainId ? getAaveConfig(chainId) : null;
  const isNetworkSupported = chainId ? isAaveSupported(chainId) : false;

  // 合约实例
  const getPoolContract = useCallback(() => {
    if (!signer || !aaveConfig) return null;
    return new ethers.Contract(aaveConfig.poolAddress, AAVE_POOL_ABI, signer);
  }, [signer, aaveConfig]);

  const getDataProviderContract = useCallback(() => {
    if (!provider || !aaveConfig) return null;
    return new ethers.Contract(
      aaveConfig.poolDataProvider,
      AAVE_DATA_PROVIDER_ABI,
      provider
    );
  }, [provider, aaveConfig]);

  const getUsdtContract = useCallback(() => {
    if (!provider || !aaveConfig) return null;
    return new ethers.Contract(aaveConfig.usdtAddress, ERC20_ABI, provider);
  }, [provider, aaveConfig]);

  const getUsdtContractWithSigner = useCallback(() => {
    if (!signer || !aaveConfig) return null;
    return new ethers.Contract(aaveConfig.usdtAddress, ERC20_ABI, signer);
  }, [signer, aaveConfig]);

  const getAUsdtContract = useCallback(() => {
    if (!provider || !aaveConfig) return null;
    return new ethers.Contract(aaveConfig.aUsdtAddress, ERC20_ABI, provider);
  }, [provider, aaveConfig]);

  // 获取USDT余额
  const fetchUsdtBalance = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const usdtContract = getUsdtContract();
      if (!usdtContract) return;

      const balance = await usdtContract.balanceOf(address);
      const decimals = await usdtContract.decimals();
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      setUsdtBalance(formattedBalance);
    } catch (error) {
      console.error('获取USDT余额失败:', error);
      setUsdtBalance('0');
    }
  }, [address, aaveConfig, getUsdtContract]);

  // 获取aUSDT余额
  const fetchAUsdtBalance = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const aUsdtContract = getAUsdtContract();
      if (!aUsdtContract) return;

      const balance = await aUsdtContract.balanceOf(address);
      const decimals = await aUsdtContract.decimals();
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      setAUsdtBalance(formattedBalance);
    } catch (error) {
      console.error('获取aUSDT余额失败:', error);
      setAUsdtBalance('0');
    }
  }, [address, aaveConfig, getAUsdtContract]);

  // 获取USDT授权额度
  const fetchAllowance = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const usdtContract = getUsdtContract();
      if (!usdtContract) return;

      const allowanceAmount = await usdtContract.allowance(
        address,
        aaveConfig.poolAddress
      );
      const decimals = await usdtContract.decimals();
      const formattedAllowance = ethers.utils.formatUnits(allowanceAmount, decimals);
      setAllowance(formattedAllowance);
    } catch (error) {
      console.error('获取授权额度失败:', error);
      setAllowance('0');
    }
  }, [address, aaveConfig, getUsdtContract]);

  // 获取用户储备数据
  const fetchUserReserveData = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const dataProvider = getDataProviderContract();
      if (!dataProvider) return;

      const reserveData = await dataProvider.getUserReserveData(
        aaveConfig.usdtAddress,
        address
      );

      const decimals = 6; // USDT的小数位数

      const depositInfo: AaveDepositData = {
        currentATokenBalance: ethers.utils.formatUnits(
          reserveData.currentATokenBalance,
          decimals
        ),
        liquidityRate: reserveData.liquidityRate.toString(),
        totalSupplied: ethers.utils.formatUnits(
          reserveData.currentATokenBalance,
          decimals
        ),
        apy: formatApy(reserveData.liquidityRate.toString()),
      };

      setDepositData(depositInfo);
    } catch (error) {
      console.error('获取用户储备数据失败:', error);
      setDepositData({
        currentATokenBalance: '0',
        liquidityRate: '0',
        totalSupplied: '0',
        apy: '0',
      });
    }
  }, [address, aaveConfig, getDataProviderContract]);

  // 获取用户账户数据
  const fetchUserAccountData = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const poolContract = getPoolContract();
      if (!poolContract) return;

      const accountData = await poolContract.getUserAccountData(address);

      const userInfo: AaveUserData = {
        totalCollateral: ethers.utils.formatUnits(accountData.totalCollateralBase, 8), // 基础单位
        totalDebt: ethers.utils.formatUnits(accountData.totalDebtBase, 8),
        availableBorrows: ethers.utils.formatUnits(accountData.availableBorrowsBase, 8),
        currentLiquidationThreshold: (
          accountData.currentLiquidationThreshold.toNumber() / 100
        ).toString(),
        ltv: (accountData.ltv.toNumber() / 100).toString(),
        healthFactor: ethers.utils.formatUnits(accountData.healthFactor, 18),
      };

      setUserData(userInfo);
    } catch (error) {
      console.error('获取用户账户数据失败:', error);
      setUserData({
        totalCollateral: '0',
        totalDebt: '0',
        availableBorrows: '0',
        currentLiquidationThreshold: '0',
        ltv: '0',
        healthFactor: '0',
      });
    }
  }, [address, aaveConfig, getPoolContract]);

  // 刷新所有数据
  const refetchAll = useCallback(async () => {
    if (!isNetworkSupported || !address) return;

    await Promise.all([
      fetchUsdtBalance(),
      fetchAUsdtBalance(),
      fetchAllowance(),
      fetchUserReserveData(),
      fetchUserAccountData(),
    ]);
  }, [
    isNetworkSupported,
    address,
    fetchUsdtBalance,
    fetchAUsdtBalance,
    fetchAllowance,
    fetchUserReserveData,
    fetchUserAccountData,
  ]);

  // 检查是否需要授权
  const needsApproval = useCallback(
    (amount: string): boolean => {
      if (!amount || parseFloat(amount) <= 0) return false;
      return parseFloat(amount) > parseFloat(allowance);
    },
    [allowance]
  );

  // 检查余额是否足够
  const hasEnoughBalance = useCallback(
    (amount: string): boolean => {
      if (!amount || parseFloat(amount) <= 0) return false;
      return parseFloat(amount) <= parseFloat(usdtBalance);
    },
    [usdtBalance]
  );

  // 检查是否有足够的aUSDT余额用于提取
  const hasEnoughATokenBalance = useCallback(
    (amount: string): boolean => {
      if (!amount || parseFloat(amount) <= 0) return false;
      return parseFloat(amount) <= parseFloat(aUsdtBalance);
    },
    [aUsdtBalance]
  );

  // 授权USDT给AAVE池
  const approveUsdt = async (amount: string) => {
    if (!aaveConfig || !signer) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.NETWORK_NOT_SUPPORTED);
      return;
    }

    if (!hasEnoughBalance(amount)) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      return;
    }

    setIsLoading(true);
    setIsConfirmed(false);
    setTransactionHash('');

    try {
      const usdtContract = getUsdtContractWithSigner();
      if (!usdtContract) throw new Error('无法获取USDT合约');

      const decimals = await usdtContract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);

      console.log('🔐 开始USDT授权:', {
        amount,
        amountInWei: amountInWei.toString(),
        spender: aaveConfig.poolAddress,
        decimals,
      });

      const tx = await usdtContract.approve(aaveConfig.poolAddress, amountInWei);
      setTransactionHash(tx.hash);

      toast.success('授权交易已提交，等待确认...');

      const receipt = await tx.wait();
      console.log('✅ USDT授权成功:', receipt);

      setIsConfirmed(true);
      toast.success('🎉 USDT授权成功！');

      // 刷新授权额度
      await fetchAllowance();
    } catch (error: any) {
      console.error('❌ USDT授权失败:', error);
      toast.error(error.message || AAVE_CONFIG.ERROR_MESSAGES.APPROVAL_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  // 质押USDT到AAVE
  const supplyUsdt = async (amount: string) => {
    if (!aaveConfig || !signer || !address) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.NETWORK_NOT_SUPPORTED);
      return;
    }

    if (!hasEnoughBalance(amount)) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      return;
    }

    if (needsApproval(amount)) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.INSUFFICIENT_ALLOWANCE);
      return;
    }

    setIsLoading(true);
    setIsConfirmed(false);
    setTransactionHash('');

    try {
      const poolContract = getPoolContract();
      if (!poolContract) throw new Error('无法获取Pool合约');

      const usdtContract = getUsdtContract();
      if (!usdtContract) throw new Error('无法获取USDT合约');

      const decimals = await usdtContract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);

      console.log('💰 开始质押USDT:', {
        amount,
        amountInWei: amountInWei.toString(),
        asset: aaveConfig.usdtAddress,
        onBehalfOf: address,
        referralCode: AAVE_CONFIG.DEFAULT_REFERRAL_CODE,
      });

      const tx = await poolContract.supply(
        aaveConfig.usdtAddress,
        amountInWei,
        address,
        AAVE_CONFIG.DEFAULT_REFERRAL_CODE
      );

      setTransactionHash(tx.hash);
      toast.success('质押交易已提交，等待确认...');

      const receipt = await tx.wait();
      console.log('✅ USDT质押成功:', receipt);

      setIsConfirmed(true);
      toast.success('🎉 USDT质押成功！开始赚取利息');

      // 刷新所有相关数据
      await refetchAll();
    } catch (error: any) {
      console.error('❌ USDT质押失败:', error);
      toast.error(error.message || AAVE_CONFIG.ERROR_MESSAGES.SUPPLY_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  // 从AAVE提取USDT
  const withdrawUsdt = async (amount: string) => {
    if (!aaveConfig || !signer || !address) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.NETWORK_NOT_SUPPORTED);
      return;
    }

    // 检查提取金额
    const isMaxWithdraw = amount === 'max';
    const withdrawAmount = isMaxWithdraw ? aUsdtBalance : amount;

    if (!isMaxWithdraw && !hasEnoughATokenBalance(amount)) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.AMOUNT_EXCEEDS_BALANCE);
      return;
    }

    if (parseFloat(aUsdtBalance) <= 0) {
      toast.error(AAVE_CONFIG.ERROR_MESSAGES.NO_DEPOSITS);
      return;
    }

    setIsLoading(true);
    setIsConfirmed(false);
    setTransactionHash('');

    try {
      const poolContract = getPoolContract();
      if (!poolContract) throw new Error('无法获取Pool合约');

      const usdtContract = getUsdtContract();
      if (!usdtContract) throw new Error('无法获取USDT合约');

      const decimals = await usdtContract.decimals();

      // 如果是最大提取，使用特殊值 (uint256最大值)
      const amountInWei = isMaxWithdraw
        ? ethers.constants.MaxUint256
        : ethers.utils.parseUnits(withdrawAmount, decimals);

      console.log('💸 开始提取USDT:', {
        amount: withdrawAmount,
        isMaxWithdraw,
        amountInWei: amountInWei.toString(),
        asset: aaveConfig.usdtAddress,
        to: address,
      });

      const tx = await poolContract.withdraw(
        aaveConfig.usdtAddress,
        amountInWei,
        address
      );

      setTransactionHash(tx.hash);
      toast.success('提取交易已提交，等待确认...');

      const receipt = await tx.wait();
      console.log('✅ USDT提取成功:', receipt);

      setIsConfirmed(true);
      toast.success('🎉 USDT提取成功！');

      // 刷新所有相关数据
      await refetchAll();
    } catch (error: any) {
      console.error('❌ USDT提取失败:', error);
      toast.error(error.message || AAVE_CONFIG.ERROR_MESSAGES.WITHDRAW_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  // 计算预期收益
  const calculateExpectedReturn = useCallback(
    (amount: string, days: number = 365): string => {
      if (!amount || parseFloat(amount) <= 0 || !depositData.apy) return '0';

      const principal = parseFloat(amount);
      const apy = parseFloat(depositData.apy) / 100; // 转换为小数
      const expectedReturn = principal * apy * (days / 365);

      return expectedReturn.toFixed(6);
    },
    [depositData.apy]
  );

  // 初始化和监听变化
  useEffect(() => {
    if (isNetworkSupported && address && provider) {
      refetchAll();
    }
  }, [isNetworkSupported, address, provider, refetchAll]);

  // 监听交易确认后重置状态
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        setIsConfirmed(false);
        setTransactionHash('');
      }, 5000);
    }
  }, [isConfirmed]);

  return {
    // 网络状态
    isNetworkSupported,
    aaveConfig,
    
    // 余额信息
    usdtBalance,
    aUsdtBalance,
    allowance,
    
    // 存款和用户数据
    depositData,
    userData,
    
    // 交易状态
    isLoading,
    isConfirmed,
    transactionHash,
    
    // 检查函数
    needsApproval,
    hasEnoughBalance,
    hasEnoughATokenBalance,
    
    // 操作函数
    approveUsdt,
    supplyUsdt,
    withdrawUsdt,
    refetchAll,
    
    // 计算函数
    calculateExpectedReturn,
    
    // 格式化函数
    formatNumber,
    formatApy,
  };
};
