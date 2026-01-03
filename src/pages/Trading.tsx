import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Activity,
  DollarSign,
  Bitcoin
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

// Mock price history data
const generatePriceHistory = (basePrice: number, days: number = 7) => {
  const data = [];
  let price = basePrice * 0.9;
  for (let i = days; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * 0.05);
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN", { weekday: "short" }),
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
};

// Mock portfolio data
const portfolioAssets = [
  { name: "ETH", value: 45, color: "hsl(var(--primary))" },
  { name: "MATIC", value: 25, color: "hsl(var(--secondary))" },
  { name: "CAMLY", value: 20, color: "hsl(var(--accent))" },
  { name: "Khác", value: 10, color: "hsl(var(--muted))" },
];

export default function Trading() {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>("ethereum");
  const navigate = useNavigate();
  const { eth, matic, ethUsd, maticUsd, loading: balanceLoading, refetch } = useWalletBalance(walletAddress);

  // Fetch wallet address from profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("user_id", user.id)
        .single();

      if (profile?.wallet_address) {
        setWalletAddress(profile.wallet_address);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        // Using mock data since CoinGecko has rate limits
        const mockPrices: CryptoPrice[] = [
          {
            id: "ethereum",
            symbol: "eth",
            name: "Ethereum",
            current_price: 2350.42,
            price_change_percentage_24h: 2.45,
            market_cap: 282000000000,
            image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
          },
          {
            id: "bitcoin",
            symbol: "btc",
            name: "Bitcoin",
            current_price: 43250.00,
            price_change_percentage_24h: 1.23,
            market_cap: 847000000000,
            image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
          },
          {
            id: "matic-network",
            symbol: "matic",
            name: "Polygon",
            current_price: 0.92,
            price_change_percentage_24h: -1.15,
            market_cap: 8500000000,
            image: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
          },
          {
            id: "tether",
            symbol: "usdt",
            name: "Tether",
            current_price: 1.00,
            price_change_percentage_24h: 0.01,
            market_cap: 95000000000,
            image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
          },
          {
            id: "solana",
            symbol: "sol",
            name: "Solana",
            current_price: 98.45,
            price_change_percentage_24h: 4.32,
            market_cap: 42000000000,
            image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
          },
        ];
        setCryptoPrices(mockPrices);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedCryptoData = cryptoPrices.find(c => c.id === selectedCrypto);
  const priceHistory = selectedCryptoData ? generatePriceHistory(selectedCryptoData.current_price) : [];

  const totalPortfolioValue = parseFloat(ethUsd || "0") + parseFloat(maticUsd || "0");

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <>
      <Helmet>
        <title>Trading & Investment - FUN Charity</title>
        <meta name="description" content="Theo dõi portfolio crypto và giao dịch trên nền tảng FUN Charity" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 lg:pb-12">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Trading & Investment
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Theo dõi portfolio và thị trường crypto
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={balanceLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${balanceLoading ? "animate-spin" : ""}`} />
                  Làm mới
                </Button>
              </div>

              {/* Portfolio Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass-card border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Tổng giá trị</span>
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</div>
                      <div className="flex items-center text-sm text-green-500 mt-1">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        +5.2% tuần này
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="glass-card border-secondary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">ETH Balance</span>
                        <span className="text-xl">⟠</span>
                      </div>
                      <div className="text-2xl font-bold">{eth || "0"} ETH</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ≈ ${ethUsd || "0"}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-card border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">MATIC Balance</span>
                        <span className="text-xl">⬡</span>
                      </div>
                      <div className="text-2xl font-bold">{matic || "0"} MATIC</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ≈ ${maticUsd || "0"}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="glass-card border-yellow-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Camly Coins</span>
                        <Coins className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="text-2xl font-bold">1,250 🪙</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ≈ $12.50 value
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>

            <Tabs defaultValue="market" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
                <TabsTrigger value="market" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Thị trường
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="exchanges" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Sàn giao dịch
                </TabsTrigger>
              </TabsList>

              {/* Market Tab */}
              <TabsContent value="market" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Price Chart */}
                  <Card className="lg:col-span-2 glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {selectedCryptoData && (
                            <img src={selectedCryptoData.image} alt={selectedCryptoData.name} className="w-6 h-6" />
                          )}
                          {selectedCryptoData?.name || "Loading..."} Chart
                        </CardTitle>
                        {selectedCryptoData && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">${selectedCryptoData.current_price.toLocaleString()}</span>
                            <Badge variant={selectedCryptoData.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
                              {selectedCryptoData.price_change_percentage_24h >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {selectedCryptoData.price_change_percentage_24h.toFixed(2)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={priceHistory}>
                            <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="price"
                              stroke="hsl(var(--primary))"
                              fillOpacity={1}
                              fill="url(#colorPrice)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Crypto List */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Top Crypto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        cryptoPrices.map((crypto) => (
                          <motion.div
                            key={crypto.id}
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                              selectedCrypto === crypto.id
                                ? "bg-primary/10 border border-primary/30"
                                : "bg-muted/30 hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedCrypto(crypto.id)}
                          >
                            <div className="flex items-center gap-3">
                              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                              <div>
                                <div className="font-semibold">{crypto.name}</div>
                                <div className="text-sm text-muted-foreground uppercase">{crypto.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${crypto.current_price.toLocaleString()}</div>
                              <div className={`text-sm flex items-center justify-end ${
                                crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                              }`}>
                                {crypto.price_change_percentage_24h >= 0 ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-secondary" />
                        Phân bổ tài sản
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={portfolioAssets}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {portfolioAssets.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {portfolioAssets.map((asset) => (
                          <div key={asset.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                            <span className="text-sm">{asset.name}: {asset.value}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Holdings */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Tài sản nắm giữ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {walletAddress ? (
                        <>
                          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">⟠</span>
                              <div>
                                <div className="font-semibold">Ethereum</div>
                                <div className="text-sm text-muted-foreground">{eth} ETH</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${ethUsd}</div>
                              <div className="text-sm text-green-500">+2.45%</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">⬡</span>
                              <div>
                                <div className="font-semibold">Polygon</div>
                                <div className="text-sm text-muted-foreground">{matic} MATIC</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${maticUsd}</div>
                              <div className="text-sm text-red-500">-1.15%</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🪙</span>
                              <div>
                                <div className="font-semibold">Camly Coin</div>
                                <div className="text-sm text-muted-foreground">1,250 CAMLY</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">$12.50</div>
                              <Badge variant="outline" className="text-xs">Polygon</Badge>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Kết nối ví để xem tài sản</p>
                          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
                            Kết nối ví
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Exchanges Tab */}
              <TabsContent value="exchanges" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Binance", logo: "https://assets.coingecko.com/markets/images/52/small/binance.jpg", url: "https://binance.com", volume: "$15.2B" },
                    { name: "Coinbase", logo: "https://assets.coingecko.com/markets/images/23/small/Coinbase_Coin_Primary.png", url: "https://coinbase.com", volume: "$2.1B" },
                    { name: "OKX", logo: "https://assets.coingecko.com/markets/images/96/small/WeChat_Image_20220117220452.png", url: "https://okx.com", volume: "$3.8B" },
                    { name: "Bybit", logo: "https://assets.coingecko.com/markets/images/698/small/bybit_spot.png", url: "https://bybit.com", volume: "$2.5B" },
                    { name: "KuCoin", logo: "https://assets.coingecko.com/markets/images/61/small/kucoin.png", url: "https://kucoin.com", volume: "$1.2B" },
                    { name: "Gate.io", logo: "https://assets.coingecko.com/markets/images/60/small/gate_io_logo1.jpg", url: "https://gate.io", volume: "$890M" },
                  ].map((exchange) => (
                    <motion.div key={exchange.name} whileHover={{ y: -4 }}>
                      <Card className="glass-card hover:border-primary/30 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={exchange.logo} alt={exchange.name} className="w-10 h-10 rounded-full" />
                              <div>
                                <div className="font-semibold">{exchange.name}</div>
                                <div className="text-sm text-muted-foreground">Vol 24h: {exchange.volume}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(exchange.url, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>🚀 Camly Coin trên Polygon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Camly Coin (CAMLY) là token tiện ích của nền tảng FUN Charity, được triển khai trên mạng Polygon 
                      với phí gas thấp và giao dịch nhanh chóng.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">ERC-20</Badge>
                      <Badge variant="outline">Polygon Network</Badge>
                      <Badge variant="outline">Low Gas Fees</Badge>
                      <Badge variant="outline">NFT Badges Support</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </>
  );
}
