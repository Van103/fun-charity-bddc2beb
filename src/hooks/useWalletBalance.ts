import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletBalance {
  eth: string;
  matic: string;
  ethUsd: string;
  maticUsd: string;
  loading: boolean;
  error: string | null;
}

// Public RPC endpoints
const RPC_ENDPOINTS = {
  ethereum: 'https://cloudflare-eth.com',
  polygon: 'https://polygon-rpc.com',
};

// Approximate prices for display (in production, fetch from an API)
const APPROX_PRICES = {
  ETH: 2300,
  MATIC: 0.85,
};

export function useWalletBalance(walletAddress: string | null) {
  const [balance, setBalance] = useState<WalletBalance>({
    eth: '0',
    matic: '0',
    ethUsd: '0',
    maticUsd: '0',
    loading: false,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return;
    }

    setBalance(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Create providers for different networks
      const ethProvider = new ethers.JsonRpcProvider(RPC_ENDPOINTS.ethereum);
      const polygonProvider = new ethers.JsonRpcProvider(RPC_ENDPOINTS.polygon);

      // Fetch balances in parallel
      const [ethBalance, maticBalance] = await Promise.all([
        ethProvider.getBalance(walletAddress).catch(() => BigInt(0)),
        polygonProvider.getBalance(walletAddress).catch(() => BigInt(0)),
      ]);

      const ethValue = parseFloat(ethers.formatEther(ethBalance));
      const maticValue = parseFloat(ethers.formatEther(maticBalance));

      const ethUsd = (ethValue * APPROX_PRICES.ETH).toFixed(2);
      const maticUsd = (maticValue * APPROX_PRICES.MATIC).toFixed(2);

      setBalance({
        eth: ethValue.toFixed(6),
        matic: maticValue.toFixed(4),
        ethUsd,
        maticUsd,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải số dư',
      }));
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalances();
    }
  }, [walletAddress, fetchBalances]);

  return {
    ...balance,
    refetch: fetchBalances,
  };
}
