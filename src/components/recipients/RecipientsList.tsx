import { motion } from "framer-motion";
import { Loader2, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipientNFTCard } from "./RecipientNFTCard";
import { useRecipients } from "@/hooks/useRecipients";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from "react";

interface RecipientsListProps {
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export function RecipientsList({ limit, showFilters = true, compact = false }: RecipientsListProps) {
  const { language } = useLanguage();
  const { data: recipients, isLoading } = useRecipients({ verified: true, limit });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("total_received");

  const filteredRecipients = useMemo(() => {
    if (!recipients) return [];
    
    let filtered = [...recipients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.story?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "total_received":
          return b.total_received - a.total_received;
        case "donation_count":
          return b.donation_count - a.donation_count;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipients, searchTerm, categoryFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipients || recipients.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">
          {language === "vi" ? "Chưa có người nhận nào" : "No recipients yet"}
        </h3>
        <p className="text-muted-foreground">
          {language === "vi"
            ? "Người nhận từ thiện sẽ xuất hiện tại đây"
            : "Charity recipients will appear here"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === "vi" ? "Tìm kiếm người nhận..." : "Search recipients..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={language === "vi" ? "Danh mục" : "Category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "vi" ? "Tất cả" : "All"}</SelectItem>
              <SelectItem value="medical">{language === "vi" ? "Y tế" : "Medical"}</SelectItem>
              <SelectItem value="education">{language === "vi" ? "Giáo dục" : "Education"}</SelectItem>
              <SelectItem value="housing">{language === "vi" ? "Nhà ở" : "Housing"}</SelectItem>
              <SelectItem value="food">{language === "vi" ? "Thực phẩm" : "Food"}</SelectItem>
              <SelectItem value="children">{language === "vi" ? "Trẻ em" : "Children"}</SelectItem>
              <SelectItem value="elderly">{language === "vi" ? "Người già" : "Elderly"}</SelectItem>
              <SelectItem value="disaster">{language === "vi" ? "Thiên tai" : "Disaster"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={language === "vi" ? "Sắp xếp" : "Sort by"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total_received">
                {language === "vi" ? "Nhận nhiều nhất" : "Most received"}
              </SelectItem>
              <SelectItem value="donation_count">
                {language === "vi" ? "Nhiều lượt giúp" : "Most donations"}
              </SelectItem>
              <SelectItem value="newest">
                {language === "vi" ? "Mới nhất" : "Newest"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {filteredRecipients.map((recipient) => (
          <RecipientNFTCard key={recipient.id} recipient={recipient} compact={compact} />
        ))}
      </motion.div>

      {filteredRecipients.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          {language === "vi"
            ? `Không tìm thấy kết quả cho "${searchTerm}"`
            : `No results found for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
}
