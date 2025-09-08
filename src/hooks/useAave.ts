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

  // 增强的USDT合约实例创建函数
  const getUsdtContract = useCallback(() => {
    if (!provider || !aaveConfig) {
      console.log('🔍 无法创建USDT合约：缺少provider或配置', {
        hasProvider: !!provider,
        hasConfig: !!aaveConfig
      });
      return null;
    }

    try {
      console.log('🔧 创建USDT合约实例:', {
        address: aaveConfig.usdtAddress,
        chainId: aaveConfig.chainId
      });

      return new ethers.Contract(aaveConfig.usdtAddress, ERC20_ABI, provider);
    } catch (error) {
      console.error('❌ 创建USDT合约失败:', error);
      return null;
    }
  }, [provider, aaveConfig]);

  const getUsdtContractWithSigner = useCallback(() => {
    if (!signer || !aaveConfig) return null;
    return new ethers.Contract(aaveConfig.usdtAddress, ERC20_ABI, signer);
  }, [signer, aaveConfig]);

  const getAUsdtContract = useCallback(() => {
    if (!provider || !aaveConfig) return null;
    return new ethers.Contract(aaveConfig.aUsdtAddress, ERC20_ABI, provider);
  }, [provider, aaveConfig]);

  // 修复的USDT余额获取函数 - 使用 ethers v6 API
  const fetchUsdtBalance = useCallback(async () => {
    if (!address || !aaveConfig) {
      console.log('🔍 无法获取USDT余额：缺少地址或配置', { address, aaveConfig: !!aaveConfig });
      return;
    }

    try {
      console.log('🔍 开始获取USDT余额...', {
        address,
        usdtAddress: aaveConfig.usdtAddress,
        chainId: aaveConfig.chainId
      });

      const usdtContract = getUsdtContract();
      if (!usdtContract) {
        console.error('❌ 无法创建USDT合约实例');
        setUsdtBalance('0');
        return;
      }

      // 添加超时机制
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('获取余额超时')), 10000)
      );

      // 首先验证合约地址是否有效
      try {
        const code = await provider?.getCode(aaveConfig.usdtAddress);
        if (!code || code === '0x') {
          console.error('❌ USDT合约地址无效或不存在', {
            address: aaveConfig.usdtAddress,
            chainId: aaveConfig.chainId
          });
          setUsdtBalance('0');
          return;
        }
      } catch (codeError) {
        console.error('❌ 检查合约代码失败:', codeError);
      }

      // 获取余额和精度
      const [balance, decimals] = await Promise.race([
        Promise.all([
          usdtContract.balanceOf(address),
          usdtContract.decimals()
        ]),
        timeoutPromise
      ]) as [any, any];

      console.log('📊 原始余额数据:', {
        balance: balance.toString(),
        decimals: decimals.toString(),
        address
      });

      // 修复：使用 ethers v6 的 formatUnits
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      console.log('✅ USDT余额获取成功:', {
        formatted: formattedBalance,
        raw: balance.toString()
      });

      setUsdtBalance(formattedBalance);

    } catch (error: any) {
      console.error('❌ 获取USDT余额失败:', {
        error: error.message || error,
        address,
        usdtAddress: aaveConfig.usdtAddress,
        chainId: aaveConfig.chainId,
        stack: error.stack
      });

      // 根据错误类型提供更详细的信息
      if (error.message?.includes('timeout')) {
        toast.error('获取余额超时，请检查网络连接');
      } else if (error.message?.includes('network')) {
        toast.error('网络错误，请切换RPC节点');
      } else if (error.message?.includes('call revert')) {
        toast.error('合约调用失败，请检查网络配置');
      }

      setUsdtBalance('0');
    }
  }, [address, aaveConfig, getUsdtContract, provider]);

  // 重试机制的USDT余额获取函数
  const fetchUsdtBalanceWithRetry = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await fetchUsdtBalance();
        break; // 成功则退出循环
      } catch (error) {
        console.log(`🔄 第${i + 1}次尝试失败，剩余重试次数：${retries - i - 1}`);
        if (i === retries - 1) {
          console.error('❌ 所有重试都失败了');
          toast.error('获取USDT余额失败，请检查网络连接或切换RPC节点');
        } else {
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
  }, [fetchUsdtBalance]);

  // 调试函数 - 修复 ethers v6 兼容性
  const debugUsdtBalance = useCallback(async () => {
    if (!address || !aaveConfig || !provider) {
      console.log('🔍 调试信息 - 缺少必要条件:', {
        address: !!address,
        aaveConfig: !!aaveConfig,
        provider: !!provider
      });
      return;
    }

    console.log('🔍 开始调试USDT余额获取...');
    console.log('📊 当前配置:', {
      chainId: aaveConfig.chainId,
      networkName: aaveConfig.name,
      usdtAddress: aaveConfig.usdtAddress,
      userAddress: address
    });

    try {
      // 检查网络连接
      const network = await provider.getNetwork();
      console.log('🌐 网络信息:', network);

      // 检查合约代码
      const code = await provider.getCode(aaveConfig.usdtAddress);
      console.log('📜 合约代码长度:', code.length);

      // 尝试直接调用合约
      const contract = new ethers.Contract(aaveConfig.usdtAddress, ERC20_ABI, provider);
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol?.() || 'Unknown'
      ]);

      console.log('💰 余额调试结果:', {
        balance: balance.toString(),
        decimals: decimals.toString(),
        symbol,
        formatted: ethers.formatUnits(balance, decimals) // 修复：使用 ethers v6 API
      });

    } catch (error) {
      console.error('❌ 调试过程中出错:', error);
    }
  }, [address, aaveConfig, provider]);

  // 获取aUSDT余额 - 修复 ethers v6 兼容性
  const fetchAUsdtBalance = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const aUsdtContract = getAUsdtContract();
      if (!aUsdtContract) return;

      const balance = await aUsdtContract.balanceOf(address);
      const decimals = await aUsdtContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals); // 修复：使用 ethers v6 API
      setAUsdtBalance(formattedBalance);
    } catch (error) {
      console.error('获取aUSDT余额失败:', error);
      setAUsdtBalance('0');
    }
  }, [address, aaveConfig, getAUsdtContract]);

  // 获取USDT授权额度 - 修复 ethers v6 兼容性
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
      const formattedAllowance = ethers.formatUnits(allowanceAmount, decimals); // 修复：使用 ethers v6 API
      setAllowance(formattedAllowance);
    } catch (error) {
      console.error('获取授权额度失败:', error);
      setAllowance('0');
    }
  }, [address, aaveConfig, getUsdtContract]);

  // 获取用户储备数据 - 修复 ethers v6 兼容性
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
        currentATokenBalance: ethers.formatUnits( // 修复：使用 ethers v6 API
          reserveData.currentATokenBalance,
          decimals
        ),
        liquidityRate: reserveData.liquidityRate.toString(),
        totalSupplied: ethers.formatUnits( // 修复：使用 ethers v6 API
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

  // 获取用户账户数据 - 修复 ethers v6 兼容性
  const fetchUserAccountData = useCallback(async () => {
    if (!address || !aaveConfig) return;

    try {
      const poolContract = getPoolContract();
      if (!poolContract) return;

      const accountData = await poolContract.getUserAccountData(address);

      const userInfo: AaveUserData = {
        totalCollateral: ethers.formatUnits(accountData.totalCollateralBase, 8), // 修复：使用 ethers v6 API
        totalDebt: ethers.formatUnits(accountData.totalDebtBase, 8), // 修复：使用 ethers v6 API
        availableBorrows: ethers.formatUnits(accountData.availableBorrowsBase, 8), // 修复：使用 ethers v6 API
        currentLiquidationThreshold: (
          Number(accountData.currentLiquidationThreshold) / 100 // 修复：使用 Number() 替代 .toNumber()
        ).toString(),
        ltv: (Number(accountData.ltv) / 100).toString(), // 修复：使用 Number() 替代 .toNumber()
        healthFactor: ethers.formatUnits(accountData.healthFactor, 18), // 修复：使用 ethers v6 API
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
      fetchUsdtBalanceWithRetry(),
      fetchAUsdtBalance(),
      fetchAllowance(),
      fetchUserReserveData(),
      fetchUserAccountData(),
    ]);
  }, [
    isNetworkSupported,
    address,
    fetchUsdtBalanceWithRetry,
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

  // 授权USDT给AAVE池 - 修复 ethers v6 兼容性
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
      const amountInWei = ethers.parseUnits(amount, decimals); // 修复：使用 ethers v6 API

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

  // 质押USDT到AAVE - 修复 ethers v6 兼容性
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
      const amountInWei = ethers.parseUnits(amount, decimals); // 修复：使用 ethers v6 API

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

  // 从AAVE提取USDT - 修复 ethers v6 兼容性
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
        ? ethers.MaxUint256 // 修复：使用 ethers v6 API
        : ethers.parseUnits(withdrawAmount, decimals); // 修复：使用 ethers v6 API

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

  // 增强的初始化逻辑
  useEffect(() => {
    if (isNetworkSupported && address && provider) {
      console.log('🚀 初始化AAVE数据获取...', {
        isNetworkSupported,
        address,
        chainId,
        aaveConfig: !!aaveConfig
      });

      // 检查当前网络配置
      if (!aaveConfig) {
        console.error('❌ 当前网络不支持或配置缺失');
        toast.error('当前网络不支持AAVE协议');
        return;
      }

      // 验证USDT地址配置
      if (!aaveConfig.usdtAddress || aaveConfig.usdtAddress === '0x0000000000000000000000000000000000000000') {
        console.error('❌ USDT地址配置无效', {
          usdtAddress: aaveConfig.usdtAddress,
          chainId: aaveConfig.chainId
        });
        toast.error('USDT合约地址配置错误');
        return;
      }

      refetchAll();
    }
  }, [isNetworkSupported, address, provider, chainId, aaveConfig, refetchAll]);

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
    
    // 调试函数
    debugUsdtBalance,
  };
};