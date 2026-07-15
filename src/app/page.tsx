'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Coins, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { getUserAddress, signTx, checkFreighterInstalled } from '../lib/freighter';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'claim';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  txHash: string;
}

interface HistoricalAPY {
  date: string;
  apy: number;
}

export default function Home() {
  // Wallet state
  const [address, setAddress] = useState<string | null>(null);
  const [freighterInstalled, setFreighterInstalled] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);

  // Protocol state
  const [tvl, setTvl] = useState<number>(1245670);
  const [currentApy, setCurrentApy] = useState<number>(14.50);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [claimableYield, setClaimableYield] = useState<number>(0);
  const [lifetimeYield, setLifetimeYield] = useState<number>(0);

  // Form inputs
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // UI status notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Simulated chart data
  const [apyHistory, setApyHistory] = useState<HistoricalAPY[]>([
    { date: '06-15', apy: 12.4 },
    { date: '06-20', apy: 12.9 },
    { date: '06-25', apy: 13.5 },
    { date: '06-30', apy: 13.1 },
    { date: '07-05', apy: 14.0 },
    { date: '07-10', apy: 14.3 },
    { date: '07-14', apy: 14.5 },
  ]);

  // Simulated transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_1',
      type: 'deposit',
      amount: 15000,
      date: '2026-07-10 14:32',
      status: 'completed',
      txHash: '051f...df2b',
    },
    {
      id: 'tx_2',
      type: 'claim',
      amount: 185.50,
      date: '2026-07-12 09:15',
      status: 'completed',
      txHash: '4a1b...88cd',
    },
  ]);

  // Initial checks
  useEffect(() => {
    async function checkWallet() {
      const installed = await checkFreighterInstalled();
      setFreighterInstalled(installed);
      const connectedAddr = await getUserAddress();
      if (connectedAddr) {
        setAddress(connectedAddr);
      }
    }
    checkWallet();
  }, []);

  // Fetch data from API or fallback
  useEffect(() => {
    async function fetchData() {
      if (!address) {
        // Fallback to baseline default mock values when wallet is logged out
        setUserBalance(0);
        setClaimableYield(0);
        setLifetimeYield(0);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/api/user/${address}`);
        const result = await res.json();
        if (result.success) {
          setUserBalance(result.balance);
          setClaimableYield(result.accruedYield);
          setLifetimeYield(result.lifetimeYield);
          setCurrentApy(result.apy);
        } else {
          // Local fallback logic if API is not running
          generateLocalFallbackData();
        }
      } catch (err) {
        // Local fallback logic if API is unreachable
        generateLocalFallbackData();
      }
    }

    function generateLocalFallbackData() {
      const seed = address ? address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
      const bal = (seed % 10) * 12000 + 4000;
      const yieldAmt = parseFloat((bal * 0.043).toFixed(2));
      setUserBalance(bal);
      setClaimableYield(yieldAmt);
      setLifetimeYield(parseFloat((yieldAmt + 245.50).toFixed(2)));
    }

    fetchData();
  }, [address]);

  // Connect wallet action
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const installed = await checkFreighterInstalled();
      if (!installed) {
        showToast('error', 'Freighter extension not found. Please install it to connect.');
        setConnecting(false);
        return;
      }
      const pubKey = await getUserAddress();
      if (pubKey) {
        setAddress(pubKey);
        showToast('success', 'Wallet connected successfully!');
      } else {
        showToast('error', 'Connection rejected by user.');
      }
    } catch (err) {
      showToast('error', 'An error occurred during connection.');
    }
    setConnecting(false);
  };

  // Toast handler
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle deposit/withdraw
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      showToast('error', 'Please connect your Freighter wallet first.');
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }

    if (activeTab === 'withdraw' && val > userBalance) {
      showToast('error', 'Insufficient vault balance.');
      return;
    }

    setActionLoading(true);
    // Simulate transaction submission
    setTimeout(() => {
      if (activeTab === 'deposit') {
        setUserBalance(prev => prev + val);
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: 'deposit',
          amount: val,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'completed',
          txHash: Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        };
        setTransactions(prev => [newTx, ...prev]);
        setTvl(prev => prev + val);
        showToast('success', `Successfully deposited ₦${val.toLocaleString()} NGNC!`);
      } else {
        setUserBalance(prev => prev - val);
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: 'withdraw',
          amount: val,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'completed',
          txHash: Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        };
        setTransactions(prev => [newTx, ...prev]);
        setTvl(prev => prev - val);
        showToast('success', `Successfully withdrew ₦${val.toLocaleString()} NGNC!`);
      }
      setAmount('');
      setActionLoading(false);
    }, 1500);
  };

  // Claim Yield handler
  const handleClaimYield = () => {
    if (!address) {
      showToast('error', 'Connect your wallet to claim yield.');
      return;
    }
    if (claimableYield <= 0) {
      showToast('error', 'No claimable yield accrued.');
      return;
    }

    setActionLoading(true);
    setTimeout(() => {
      const claimedVal = claimableYield;
      setLifetimeYield(prev => prev + claimedVal);
      setClaimableYield(0);
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'claim',
        amount: claimedVal,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'completed',
        txHash: Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
      };
      setTransactions(prev => [newTx, ...prev]);
      showToast('success', `Accrued yield of ₦${claimedVal.toLocaleString()} NGNC claimed!`);
      setActionLoading(false);
    }, 1500);
  };

  // Truncate address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Simulated Monthly Projection
  const monthlyProjection = amount ? (parseFloat(amount) * (currentApy / 100) / 12) : 0;

  return (
    <div className="min-h-screen bg-darkBg text-gray-200 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-nigeria/10 blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* Floating Status Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg glass-panel border-l-4 border-l-nigeria animate-bounce">
          {notification.type === 'success' && <CheckCircle2 className="text-nigeria w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="text-red-500 w-5 h-5" />}
          {notification.type === 'info' && <HelpCircle className="text-gold w-5 h-5" />}
          <span className="text-sm font-medium text-gray-100">{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="w-full border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center z-10 glass-panel">
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="text-nigeria" />
            Naira-Yield
            <span className="text-xs bg-nigeria/20 text-nigeria px-2 py-0.5 rounded-full border border-nigeria/30">Stablecoin Vault</span>
          </span>
          <span className="text-[10px] text-gray-500 tracking-wider uppercase font-semibold">
            Governed by Iseoluwa-Protocol • @AlAfiz
          </span>
        </div>

        <div className="flex items-center gap-4">
          {address ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-nigeria animate-pulse"></div>
              <span className="text-xs font-mono text-gray-300">{formatAddress(address)}</span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 bg-gradient-to-r from-nigeria to-nigeria-dark hover:from-nigeria-light hover:to-nigeria text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide shadow-lg shadow-nigeria/20 transition-all duration-300 transform active:scale-95 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {connecting ? 'Connecting...' : 'Connect Freighter'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        
        {/* Left Side: Stats Cards and Transaction Drawer */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TVL */}
            <div className="glass-panel glass-panel-hover p-6 rounded-xl relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value Locked (TVL)</span>
                <h3 className="text-2xl font-bold text-white mt-1">₦{tvl.toLocaleString()}</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-nigeria-light mt-4">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Steady Yield Inflow</span>
              </div>
            </div>

            {/* Current APY */}
            <div className="glass-panel glass-panel-hover p-6 rounded-xl relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current APY</span>
                <h3 className="text-2xl font-bold text-white mt-1 glow-green">{currentApy.toFixed(2)}%</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gold mt-4">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Yield Index: 1.0456</span>
              </div>
            </div>

            {/* My Lifetime Earnings */}
            <div className="glass-panel glass-panel-hover p-6 rounded-xl relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifetime Yield Earned</span>
                <h3 className="text-2xl font-bold text-white mt-1">₦{lifetimeYield.toLocaleString()}</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Compounding Hourly</span>
              </div>
            </div>
          </div>

          {/* APY Trend Graph (Custom SVG Rendered) */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-semibold text-white">APY Performance History</h4>
                <p className="text-[11px] text-gray-500">Stellar Network Naira Vault Yield Trend (30 Days)</p>
              </div>
              <span className="text-xs bg-nigeria/10 text-nigeria px-2.5 py-1 rounded-full font-medium border border-nigeria/20 flex items-center gap-1">
                +16.9% Growth
              </span>
            </div>

            {/* SVG Plot */}
            <div className="w-full h-48 relative">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008751" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#008751" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Main Curve Area Fill */}
                <path
                  d="M0,200 L0,152 Q100,140 200,126 T400,105 Q500,90 600,80 L600,200 Z"
                  fill="url(#gradient)"
                />
                {/* Smooth APY Line */}
                <path
                  d="M0,152 Q100,140 200,126 T400,105 Q500,90 600,80"
                  fill="none"
                  stroke="#00A86B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Node Points */}
                <circle cx="200" cy="126" r="5" fill="#D4AF37" stroke="#05070a" strokeWidth="2" />
                <circle cx="400" cy="105" r="5" fill="#D4AF37" stroke="#05070a" strokeWidth="2" />
                <circle cx="600" cy="80" r="6" fill="#00A86B" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Data Labels inside SVG */}
              <div className="absolute top-[68%] left-[30%] -translate-x-1/2 -translate-y-1/2 bg-darkBg/90 border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">13.5% APY</div>
              <div className="absolute top-[48%] left-[64%] -translate-x-1/2 -translate-y-1/2 bg-darkBg/90 border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">14.3% APY</div>
              <div className="absolute top-[32%] right-2 bg-nigeria border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white font-bold font-mono">14.5% Current</div>
            </div>

            {/* Time labels */}
            <div className="flex justify-between mt-3 text-[10px] text-gray-500 font-semibold px-2">
              <span>JUN 15</span>
              <span>JUN 22</span>
              <span>JUN 29</span>
              <span>JUL 06</span>
              <span>TODAY</span>
            </div>
          </div>

          {/* Transactions List */}
          <div className="glass-panel p-6 rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                Vault Activity History
              </h4>
              <span className="text-[10px] text-gray-500 font-medium">Shows recent transactions</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Date & Time</th>
                    <th className="pb-2">Tx Hash</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 font-semibold flex items-center gap-1.5">
                        {tx.type === 'deposit' && (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-nigeria" />
                            <span className="text-white">Deposit</span>
                          </>
                        )}
                        {tx.type === 'withdraw' && (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-gray-300">Withdraw</span>
                          </>
                        )}
                        {tx.type === 'claim' && (
                          <>
                            <Coins className="w-3.5 h-3.5 text-gold" />
                            <span className="text-gold">Claim Yield</span>
                          </>
                        )}
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        ₦{tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-gray-500 font-medium">{tx.date}</td>
                      <td className="py-3 text-gray-500 font-mono flex items-center gap-1">
                        {tx.txHash}
                        <ExternalLink className="w-3 h-3 cursor-pointer opacity-55 hover:opacity-100" />
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-nigeria/15 text-nigeria border border-nigeria/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Panel (Deposit / Withdraw / Claim) */}
        <div className="flex flex-col gap-8">
          
          {/* User Vault Positions Card */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-t-2 border-t-gold/40">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Position Summary</span>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-gray-400">Vault Balance</span>
                  <span className="text-sm font-bold text-white font-mono">₦{userBalance.toLocaleString()} NGNC</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-gray-400">Accrued Yield</span>
                  <span className="text-sm font-bold text-gold font-mono glow-gold">₦{claimableYield.toLocaleString()} NGNC</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-400">Active Rate</span>
                  <span className="text-xs font-bold text-nigeria-light">{currentApy}% APY</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimYield}
              disabled={actionLoading || claimableYield <= 0}
              className="mt-6 w-full py-2.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold shadow-lg shadow-gold/15 transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {actionLoading ? 'Claiming...' : 'Claim Yield Rewards'}
            </button>
          </div>

          {/* Action Drawer (Tabbed Deposit / Withdraw Form) */}
          <div className="glass-panel p-6 rounded-xl flex flex-col">
            <div className="flex rounded-lg bg-black/50 p-1 border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('deposit'); setAmount(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'deposit' 
                    ? 'bg-nigeria text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('withdraw'); setAmount(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'withdraw' 
                    ? 'bg-nigeria text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Withdraw
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-2 block">
                  Amount in Naira stablecoin (NGNC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={actionLoading}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-nigeria transition-colors pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    NGNC
                  </span>
                </div>
              </div>

              {/* Yield Projection calculations */}
              {activeTab === 'deposit' && (
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Yield Projection Estimator</span>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-gray-400">Monthly Yield:</span>
                    <span className="font-bold text-nigeria font-mono">₦{monthlyProjection.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGNC</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Yearly Yield:</span>
                    <span className="font-bold text-gold font-mono">₦{(monthlyProjection * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGNC</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading || !amount}
                className="w-full py-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-nigeria to-nigeria-dark hover:from-nigeria-light hover:to-nigeria shadow-lg shadow-nigeria/15 transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {actionLoading 
                  ? 'Processing transaction...' 
                  : activeTab === 'deposit' 
                    ? 'Confirm Deposit to Vault' 
                    : 'Confirm Withdraw Principal'
                }
              </button>
            </form>
          </div>

          {/* Helpful Information Panel */}
          <div className="glass-panel p-5 rounded-xl text-xs flex flex-col gap-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-nigeria" />
              Protocol Details
            </span>
            <p className="text-gray-400 leading-relaxed">
              Naira-Yield automatically sweeps stablecoins into yield-generating Soroban lending pools. Interest compounds dynamically and is redeemable at any time.
            </p>
            <div className="flex flex-col gap-1.5 mt-2 border-t border-white/5 pt-3 text-[10px] text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Vault:</span>
                <span className="font-mono text-gray-400">yield_vault.wasm</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-nigeria-light">Stellar Testnet</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-white/5 py-4 px-6 md:px-12 flex justify-between items-center text-[10px] text-gray-500 mt-12 glass-panel">
        <span>© 2026 Iseoluwa-Protocol. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Designed and Developed by <span className="text-gray-400 font-semibold">@AlAfiz</span>
        </span>
      </footer>
    </div>
  );
}
