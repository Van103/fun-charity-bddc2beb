import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Users,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Heart,
  Gift,
  Search,
  Eye,
  Loader2,
  Wallet,
  Calendar,
  Star,
  UserCog,
  HandHeart,
  Mail,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  role: string | null;
  is_verified: boolean | null;
  reputation_score: number | null;
  wallet_address: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const ITEMS_PER_PAGE = 20;

export default function AdminUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase.rpc("is_admin", { _user_id: user.id });
      return data || false;
    },
  });

  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, checkingAdmin, navigate]);

  // Fetch users with pagination
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users", searchQuery, roleFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });

      // Apply search filter (search by name or email)
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Apply role filter - cast to the proper type
      if (roleFilter !== "all") {
        query = query.eq("role", roleFilter as "beneficiary" | "donor" | "ngo" | "volunteer");
      }

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        users: data as UserProfile[],
        total: count || 0,
      };
    },
    enabled: isAdmin === true,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const [totalResult, verifiedResult, donorResult, beneficiaryResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "donor"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "beneficiary"),
      ]);

      return {
        total: totalResult.count || 0,
        verified: verifiedResult.count || 0,
        donors: donorResult.count || 0,
        beneficiaries: beneficiaryResult.count || 0,
      };
    },
    enabled: isAdmin === true,
  });

  // Toggle verification mutation
  const toggleVerification = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: string; isVerified: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: isVerified })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      toast.success("Cập nhật trạng thái xác minh thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật!");
    },
  });

  // Change role mutation
  const changeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "beneficiary" | "donor" | "ngo" | "volunteer" }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      toast.success("Cập nhật vai trò thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật!");
    },
  });

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetailDialog(true);
  };

  const totalPages = Math.ceil((usersData?.total || 0) / ITEMS_PER_PAGE);

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "donor":
        return <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30"><Heart className="w-3 h-3 mr-1" />Donor</Badge>;
      case "beneficiary":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Gift className="w-3 h-3 mr-1" />Beneficiary</Badge>;
      case "volunteer":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><HandHeart className="w-3 h-3 mr-1" />Volunteer</Badge>;
      case "ngo":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><ShieldCheck className="w-3 h-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  if (checkingAdmin || loadingUsers) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
          </div>
          <p className="text-muted-foreground">
            Xem và quản lý tài khoản người dùng trong hệ thống
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.verified || 0}</p>
                  <p className="text-sm text-muted-foreground">Đã xác minh</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-pink-500/30 bg-pink-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-pink-500/20">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.donors || 0}</p>
                  <p className="text-sm text-muted-foreground">Donors</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Gift className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.beneficiaries || 0}</p>
                  <p className="text-sm text-muted-foreground">Beneficiaries</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="donor">Donor</SelectItem>
              <SelectItem value="beneficiary">Beneficiary</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="hidden md:table-cell">Xác minh</TableHead>
                    <TableHead className="hidden md:table-cell">Điểm uy tín</TableHead>
                    <TableHead className="hidden lg:table-cell">Ví</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-soft to-purple-light text-white">
                              {user.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.full_name || "Chưa đặt tên"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:hidden">
                              {user.email || user.user_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {user.email || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.is_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{user.reputation_score || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.wallet_address ? (
                          <div className="flex items-center gap-1">
                            <Wallet className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs truncate max-w-[100px]">
                              {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {user.created_at
                            ? format(new Date(user.created_at), "dd/MM/yyyy")
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {usersData?.users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      {/* User Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Chi tiết người dùng
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-soft to-purple-light text-white text-xl">
                    {selectedUser.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedUser.full_name || "Chưa đặt tên"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{selectedUser.email || "Chưa có email"}</span>
                  </div>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trạng thái xác minh</p>
                  <div className="flex items-center gap-2">
                    {selectedUser.is_verified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-500">Đã xác minh</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Chưa xác minh</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Điểm uy tín</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{selectedUser.reputation_score || 0}</span>
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Địa chỉ ví</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-mono break-all">
                      {selectedUser.wallet_address || "Chưa liên kết"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>
                      {selectedUser.created_at
                        ? format(new Date(selectedUser.created_at), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <span className="text-sm">
                    {selectedUser.updated_at
                      ? formatDistanceToNow(new Date(selectedUser.updated_at), {
                          addSuffix: true,
                          locale: vi,
                        })
                      : "-"}
                  </span>
                </div>

                {selectedUser.bio && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Xác minh tài khoản</span>
                  <Button
                    variant={selectedUser.is_verified ? "destructive" : "default"}
                    size="sm"
                    onClick={() => {
                      toggleVerification.mutate({
                        userId: selectedUser.user_id,
                        isVerified: !selectedUser.is_verified,
                      });
                      setSelectedUser({
                        ...selectedUser,
                        is_verified: !selectedUser.is_verified,
                      });
                    }}
                    disabled={toggleVerification.isPending}
                  >
                    {toggleVerification.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedUser.is_verified ? (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Hủy xác minh
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Xác minh
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thay đổi vai trò</span>
                  <Select
                    value={selectedUser.role || ""}
                    onValueChange={(value) => {
                      const typedRole = value as "beneficiary" | "donor" | "ngo" | "volunteer";
                      changeRole.mutate({
                        userId: selectedUser.user_id,
                        role: typedRole,
                      });
                      setSelectedUser({
                        ...selectedUser,
                        role: value,
                      });
                    }}
                    disabled={changeRole.isPending}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="beneficiary">Beneficiary</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
