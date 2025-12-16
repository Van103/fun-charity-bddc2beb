import { useState } from "react";
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Home, 
  Heart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditDetailsModal } from "./EditDetailsModal";

interface ProfileIntroCardProps {
  profile: {
    full_name: string | null;
    bio: string | null;
    role: string | null;
  } | null;
  onEdit?: () => void;
}

export function ProfileIntroCard({ profile, onEdit }: ProfileIntroCardProps) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Mock data for demonstration - in real app, fetch from profile extended fields
  const introItems = [
    { icon: Briefcase, text: "Làm việc tại GEIN Academy", type: "work" },
    { icon: Briefcase, text: "Leader tại Renaissance Team", type: "work" },
    { icon: GraduationCap, text: "Học tại Đại học Kinh tế Đà Nẵng", type: "education" },
    { icon: MapPin, text: "Sống tại Thành phố Hồ Chí Minh", type: "location" },
    { icon: Home, text: "Đến từ Đà Nẵng", type: "hometown" },
    { icon: Heart, text: "Độc thân", type: "relationship" },
    { icon: Clock, text: "Tham gia từ tháng 1 năm 2024", type: "joined" },
  ];

  return (
    <>
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Giới thiệu</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Bio/Quote */}
          {profile?.bio && (
            <div className="text-center">
              <p className="text-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Edit Bio Button */}
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={onEdit}
          >
            Chỉnh sửa tiểu sử
          </Button>

          {/* Intro Items */}
          <div className="space-y-3">
            {introItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Edit Details Button */}
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setDetailsModalOpen(true)}
          >
            Chỉnh sửa chi tiết
          </Button>
        </div>
      </div>

      <EditDetailsModal 
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </>
  );
}