import { useState } from "react";
import { motion } from "framer-motion";
import { 
  RefreshCw, ExternalLink, CheckCircle2, XCircle, 
  Clock, Loader2, Search, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllBlockchainClaims } from "@/hooks/useBlockchainClaims";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function BlockchainMonitor() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: claims, isLoading, refetch } = useAllBlockchainClaims();

  const filteredClaims = claims?.filter(claim => 
    claim.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.tx_hash?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "processing":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  const exportToCSV = () => {
    if (!claims?.length) return;
    
    const headers = ["ID", "User", "Wallet", "Points", "Tokens", "Status", "TX Hash", "Date"];
    const rows = claims.map(c => [
      c.id,
      (c.profiles as { full_name?: string })?.full_name || "Unknown",
      c.wallet_address,
      c.points_claimed,
      c.tokens_minted,
      c.status,
      c.tx_hash || "",
      new Date(c.created_at).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blockchain-claims-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Calculate stats
  const totalClaims = claims?.length || 0;
  const completedClaims = claims?.filter(c => c.status === "completed").length || 0;
  const pendingClaims = claims?.filter(c => c.status === "pending" || c.status === "processing").length || 0;
  const totalTokensMinted = claims?.reduce((sum, c) => sum + (c.status === "completed" ? c.tokens_minted : 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-300/70">Tổng Claims</p>
            <p className="text-2xl font-bold text-white">{totalClaims}</p>
          </CardContent>
        </Card>
        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-300/70">Hoàn thành</p>
            <p className="text-2xl font-bold text-green-400">{completedClaims}</p>
          </CardContent>
        </Card>
        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-300/70">Đang xử lý</p>
            <p className="text-2xl font-bold text-amber-400">{pendingClaims}</p>
          </CardContent>
        </Card>
        <Card className="glass-card-divine border-purple-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-300/70">Tổng FUN Minted</p>
            <p className="text-2xl font-bold text-amber-400">
              {new Intl.NumberFormat("vi-VN").format(totalTokensMinted)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Claims Table */}
      <Card className="glass-card-divine border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Blockchain Claims</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  placeholder="Tìm theo wallet hoặc TX..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-purple-900/30 border-purple-500/30"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-purple-500/10 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClaims?.map((claim, index) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={(claim.profiles as { avatar_url?: string })?.avatar_url || undefined} />
                          <AvatarFallback className="bg-purple-700">
                            {((claim.profiles as { full_name?: string })?.full_name?.[0]) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">
                            {(claim.profiles as { full_name?: string })?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-purple-300/60 font-mono">
                            {claim.wallet_address.slice(0, 10)}...{claim.wallet_address.slice(-8)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-amber-400">
                            {new Intl.NumberFormat("vi-VN").format(claim.tokens_minted)} FUN
                          </p>
                          <p className="text-xs text-purple-300/60">
                            {new Intl.NumberFormat("vi-VN").format(claim.points_claimed)} CAMLY
                          </p>
                        </div>

                        <Badge variant="outline" className={getStatusColor(claim.status)}>
                          {getStatusIcon(claim.status)}
                          <span className="ml-1 capitalize">{claim.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-500/10">
                      <span className="text-xs text-purple-300/50">
                        {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true, locale: vi })}
                      </span>
                      
                      {claim.tx_hash && (
                        <a
                          href={`https://polygonscan.com/tx/${claim.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                        >
                          <span className="font-mono">{claim.tx_hash.slice(0, 16)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {claim.error_message && (
                        <span className="text-xs text-red-400">{claim.error_message}</span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {(!filteredClaims || filteredClaims.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-purple-300/50">Không có claims nào</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
