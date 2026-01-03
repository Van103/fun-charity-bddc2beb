import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VolunteerRanker {
  rank: number;
  name: string;
  hours: number;
  tasksCompleted: number;
  impactScore: number;
  avatar?: string;
  verified?: boolean;
  userId: string;
}

// Mock data for volunteers since we don't have a dedicated volunteer hours table yet
const mockVolunteers: VolunteerRanker[] = [
  { rank: 1, name: "Lê Thị Mai", hours: 520, tasksCompleted: 48, impactScore: 9800, avatar: "", verified: true, userId: "mock-1" },
  { rank: 2, name: "Nguyễn Văn Hùng", hours: 485, tasksCompleted: 42, impactScore: 8900, avatar: "", verified: true, userId: "mock-2" },
  { rank: 3, name: "Trần Minh Tâm", hours: 420, tasksCompleted: 38, impactScore: 7600, avatar: "", verified: false, userId: "mock-3" },
  { rank: 4, name: "Phạm Thu Hà", hours: 380, tasksCompleted: 35, impactScore: 6800, avatar: "", verified: true, userId: "mock-4" },
  { rank: 5, name: "Hoàng Đức Anh", hours: 345, tasksCompleted: 31, impactScore: 6200, avatar: "", verified: false, userId: "mock-5" },
  { rank: 6, name: "Vũ Thị Lan", hours: 310, tasksCompleted: 28, impactScore: 5500, avatar: "", verified: true, userId: "mock-6" },
  { rank: 7, name: "Đặng Quốc Bảo", hours: 285, tasksCompleted: 25, impactScore: 4900, avatar: "", verified: false, userId: "mock-7" },
  { rank: 8, name: "Bùi Thị Ngọc", hours: 260, tasksCompleted: 23, impactScore: 4400, avatar: "", verified: true, userId: "mock-8" },
  { rank: 9, name: "Ngô Văn Phú", hours: 240, tasksCompleted: 21, impactScore: 4000, avatar: "", verified: false, userId: "mock-9" },
  { rank: 10, name: "Đỗ Thị Kim", hours: 220, tasksCompleted: 19, impactScore: 3600, avatar: "", verified: true, userId: "mock-10" },
];

async function fetchVolunteerRanking(): Promise<VolunteerRanker[]> {
  try {
    // For now, we'll use reputation_events to approximate volunteer activity
    // In the future, you can create a dedicated volunteer_hours table
    const { data: reputationData, error } = await supabase
      .from("reputation_events")
      .select("user_id, points, event_type")
      .order("points", { ascending: false });

    if (error || !reputationData || reputationData.length === 0) {
      // Return mock data if no real data
      return mockVolunteers;
    }

    // Aggregate by user
    const userStats: Record<string, { points: number; events: number }> = {};
    reputationData.forEach(event => {
      if (!userStats[event.user_id]) {
        userStats[event.user_id] = { points: 0, events: 0 };
      }
      userStats[event.user_id].points += event.points;
      userStats[event.user_id].events += 1;
    });

    // Sort and get top 10
    const sortedUsers = Object.entries(userStats)
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 10);

    if (sortedUsers.length === 0) {
      return mockVolunteers;
    }

    // Fetch profiles
    const userIds = sortedUsers.map(([id]) => id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, is_verified")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    return sortedUsers.map(([userId, stats], index) => {
      const profile = profileMap.get(userId);
      // Approximate hours from points (1 hour = 10 points assumption)
      const hours = Math.floor(stats.points / 10);
      
      return {
        rank: index + 1,
        name: profile?.full_name || "Volunteer",
        hours,
        tasksCompleted: stats.events,
        impactScore: stats.points,
        avatar: profile?.avatar_url || undefined,
        verified: profile?.is_verified || false,
        userId,
      };
    });
  } catch (error) {
    console.error("Error fetching volunteer ranking:", error);
    return mockVolunteers;
  }
}

export function useVolunteerRanking() {
  return useQuery({
    queryKey: ["volunteer-ranking"],
    queryFn: fetchVolunteerRanking,
    staleTime: 60000,
  });
}
