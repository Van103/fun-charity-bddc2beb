import { motion } from "framer-motion";
import { format } from "date-fns";
import { Heart, ExternalLink, MessageCircle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonorDonation, DonorMilestone } from "@/hooks/useDonorJourney";
import { useLanguage } from "@/contexts/LanguageContext";

interface DonorJourneyTimelineProps {
  donations: DonorDonation[];
  milestones: DonorMilestone[];
  showCampaignLinks?: boolean;
}

type TimelineItem = 
  | { type: "donation"; data: DonorDonation; date: Date }
  | { type: "milestone"; data: DonorMilestone; date: Date };

const formatCurrency = (amount: number, currency: string = "VND") => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString();
};

export function DonorJourneyTimeline({ 
  donations, 
  milestones, 
  showCampaignLinks = true 
}: DonorJourneyTimelineProps) {
  const { language } = useLanguage();
  
  // Merge donations and milestones into a single timeline
  const timelineItems: TimelineItem[] = [
    ...donations.map((d) => ({
      type: "donation" as const,
      data: d,
      date: new Date(d.created_at),
    })),
    ...milestones.map((m) => ({
      type: "milestone" as const,
      data: m,
      date: new Date(m.achievedAt),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {language === "vi" 
            ? "Chưa có hoạt động từ thiện nào"
            : "No charity activity yet"}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {language === "vi" ? "Hành Trình Từ Thiện" : "Charity Journey"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {timelineItems.map((item, index) => (
              <motion.div
                key={`${item.type}-${item.type === "donation" ? item.data.id : item.data.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-10"
              >
                {/* Timeline dot */}
                <div 
                  className={`absolute left-2 top-2 w-4 h-4 rounded-full border-2 ${
                    item.type === "milestone" 
                      ? "bg-primary border-primary" 
                      : "bg-background border-primary"
                  }`}
                />
                
                {item.type === "milestone" ? (
                  // Milestone card
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.data.icon}</span>
                      <div>
                        <div className="font-semibold text-primary">
                          {item.data.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(item.date, "dd/MM/yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Donation card
                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-start gap-3">
                      {item.data.campaign_cover && (
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src={item.data.campaign_cover} />
                          <AvatarFallback className="rounded-lg bg-primary/10">
                            <Heart className="h-5 w-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-lg text-primary">
                              {formatCurrency(item.data.amount, item.data.currency)} {item.data.currency}
                            </div>
                            {showCampaignLinks ? (
                              <Link 
                                to={`/campaigns/${item.data.campaign_id}`}
                                className="text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                              >
                                {item.data.campaign_title}
                              </Link>
                            ) : (
                              <div className="text-sm text-foreground line-clamp-1">
                                {item.data.campaign_title}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(item.date, "dd/MM/yyyy")}
                          </div>
                        </div>
                        
                        {item.data.message && (
                          <div className="mt-2 text-sm text-muted-foreground italic flex items-start gap-1">
                            <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            "{item.data.message}"
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          {item.data.is_anonymous && (
                            <Badge variant="outline" className="text-xs">
                              {language === "vi" ? "Ẩn danh" : "Anonymous"}
                            </Badge>
                          )}
                          {item.data.tx_hash && (
                            <a
                              href={`https://polygonscan.com/tx/${item.data.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {language === "vi" ? "Xem giao dịch" : "View tx"}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
