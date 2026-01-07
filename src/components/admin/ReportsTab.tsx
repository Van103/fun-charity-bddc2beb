import { useState } from "react";
import { 
  TrendingUp, Users, Coins, Gift, Download,
  Calendar, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const COLORS = ["#9333EA", "#F59E0B", "#10B981", "#EC4899", "#3B82F6"];

export function ReportsTab() {
  const [timeRange, setTimeRange] = useState("7d");

  // Fetch donation stats
  const { data: donationStats } = useQuery({
    queryKey: ["donation-stats", timeRange],
    queryFn: async () => {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("donations")
        .select("amount, currency, created_at, status")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed");

      if (error) throw error;
      return data;
    },
  });

  // Fetch reward distribution by action type
  const { data: rewardsByType } = useQuery({
    queryKey: ["rewards-by-type"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_transactions")
        .select("action_type, amount")
        .eq("status", "completed");

      if (error) throw error;

      // Group by action type
      const grouped = data.reduce((acc: Record<string, number>, tx) => {
        acc[tx.action_type] = (acc[tx.action_type] || 0) + tx.amount;
        return acc;
      }, {});

      return Object.entries(grouped).map(([name, value]) => ({
        name,
        value: Math.abs(value),
      }));
    },
  });

  // Fetch daily activity
  const { data: dailyActivity } = useQuery({
    queryKey: ["daily-activity", timeRange],
    queryFn: async () => {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("reward_transactions")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed");

      if (error) throw error;

      // Group by date
      const grouped = data.reduce((acc: Record<string, number>, tx) => {
        const date = new Date(tx.created_at!).toLocaleDateString("vi-VN");
        acc[date] = (acc[date] || 0) + Math.abs(tx.amount);
        return acc;
      }, {});

      return Object.entries(grouped)
        .map(([date, rewards]) => ({ date, rewards }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14);
    },
  });

  // Calculate summary stats
  const totalDonations = donationStats?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalRewards = rewardsByType?.reduce((sum, r) => sum + r.value, 0) || 0;

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalDonations,
        totalRewards,
        rewardsByType,
        dailyActivity,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reward-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-purple-900/30 border-purple-500/30">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày qua</SelectItem>
              <SelectItem value="30d">30 ngày qua</SelectItem>
              <SelectItem value="90d">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-purple-300/70">Tổng quyên góp</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {new Intl.NumberFormat("vi-VN").format(totalDonations)} VND
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-purple-300/70">Tổng thưởng phát</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {new Intl.NumberFormat("vi-VN").format(totalRewards)} CAMLY
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-400" />
              <p className="text-sm text-purple-300/70">Giao dịch thưởng</p>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {donationStats?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-purple-300/70">Trung bình/ngày</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {new Intl.NumberFormat("vi-VN").format(
                Math.round(totalRewards / (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90))
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card className="glass-card-divine border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Hoạt động theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyActivity || []}>
                  <defs>
                    <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333EA" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #4B5563",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#E5E7EB" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rewards"
                    stroke="#9333EA"
                    fillOpacity={1}
                    fill="url(#colorRewards)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rewards by Type Chart */}
        <Card className="glass-card-divine border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Phân bổ theo loại thưởng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rewardsByType || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rewardsByType?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #4B5563",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
