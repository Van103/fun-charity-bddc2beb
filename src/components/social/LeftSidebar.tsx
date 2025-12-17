import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  GraduationCap,
  TrendingUp,
  PiggyBank,
  Heart,
  Scale,
  Globe,
  Coins,
  Edit,
  Sprout,
  Gamepad2,
  MessageCircle,
} from "lucide-react";

const menuItems = [
  { icon: User, label: "Fun Profile", href: "/profile" },
  { icon: Sprout, label: "Fun Farm", href: "/farm" },
  { icon: Globe, label: "Fun Planet", href: "/planet" },
  { icon: Gamepad2, label: "Fun Play", href: "/play" },
  { icon: MessageCircle, label: "Fun Chat", href: "/messages" },
  { icon: GraduationCap, label: "Fun Academy", href: "/academy" },
  { icon: TrendingUp, label: "Fun Trading", href: "/trading" },
  { icon: PiggyBank, label: "Fun Investment", href: "/investment" },
  { icon: Heart, label: "Fun Life", href: "/life" },
  { icon: Scale, label: "Fun Legal", href: "/legal" },
];

interface LeftSidebarProps {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    wallet_address: string | null;
  } | null;
}

export function LeftSidebar({ profile }: LeftSidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 space-y-4 sticky top-20">
      {/* Platform Ecosystem */}
      <div 
        className="rounded-2xl overflow-hidden relative p-4" 
        style={{ backgroundImage: 'url(/images/purple-light-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-[1px]" />
        <div className="relative">
          <h3 className="font-bold mb-1" style={{ color: '#4C1D95', fontSize: '16px' }}>
            Các Platform F.U. Ecosystem
          </h3>
          <p className="text-xs mb-4" style={{ color: '#6B21A8' }}>Coming soon</p>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                  style={isActive ? { 
                    background: 'linear-gradient(to right, #6B21A8, #7C3AED)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  } : { 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#4C1D95',
                    boxShadow: '0 0 12px 2px rgba(255, 215, 0, 0.5), 0 0 4px 1px rgba(255, 215, 0, 0.3)',
                    border: '2px solid rgba(255, 215, 0, 0.6)',
                    fontSize: '16px'
                  }}
                >
                  <item.icon className="w-4 h-4" style={{ color: isActive ? 'white' : '#6B21A8' }} />
                  <span style={{ fontSize: '16px' }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Shortcuts */}
      <div 
        className="rounded-2xl overflow-hidden relative p-4" 
        style={{ backgroundImage: 'url(/images/purple-light-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-[1px]" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ color: '#4C1D95', fontSize: '16px' }}>Lối tắt của bạn</h3>
            <Button variant="ghost" size="sm" className="text-xs hover:bg-white/50" style={{ color: '#6B21A8' }}>
              <Edit className="w-3 h-3 mr-1" />
              Chỉnh sửa
            </Button>
          </div>
          
          <Link 
            to="/wallet" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 0 12px 2px rgba(255, 215, 0, 0.5), 0 0 4px 1px rgba(255, 215, 0, 0.3)',
              border: '2px solid rgba(255, 215, 0, 0.6)'
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-champagne to-gold-light flex items-center justify-center shadow-md">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold" style={{ color: '#4C1D95', fontSize: '16px' }}>CAMLY COIN</span>
          </Link>
        </div>
      </div>

      {/* User Count */}
      <div 
        className="rounded-2xl overflow-hidden relative p-3" 
        style={{ backgroundImage: 'url(/images/purple-light-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-[1px]" />
        <div className="relative flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span style={{ color: '#4C1D95', fontSize: '16px' }}>
            <span className="font-bold">1B96868</span> Users
          </span>
        </div>
      </div>
    </aside>
  );
}