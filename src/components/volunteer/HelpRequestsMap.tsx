import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HelpRequest } from '@/hooks/useHelpRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Key } from 'lucide-react';

interface HelpRequestsMapProps {
  requests: HelpRequest[];
  onSelectRequest?: (request: HelpRequest) => void;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#ef4444', // red
  high: '#f97316', // orange
  medium: '#eab308', // yellow
  low: '#22c55e', // green
};

export const HelpRequestsMap: React.FC<HelpRequestsMapProps> = ({
  requests,
  onSelectRequest,
}) => {
  const { language } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [isTokenSet, setIsTokenSet] = useState<boolean>(() => {
    return !!localStorage.getItem('mapbox_token');
  });
  const [inputToken, setInputToken] = useState('');

  const handleSaveToken = () => {
    if (inputToken.trim()) {
      localStorage.setItem('mapbox_token', inputToken.trim());
      setMapboxToken(inputToken.trim());
      setIsTokenSet(true);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.6297, 16.4637], // Center of Vietnam
        zoom: 5,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );

      return () => {
        markersRef.current.forEach((marker) => marker.remove());
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsTokenSet(false);
      localStorage.removeItem('mapbox_token');
    }
  }, [isTokenSet, mapboxToken]);

  // Add markers for requests
  useEffect(() => {
    if (!map.current || !isTokenSet) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter requests with valid coordinates
    const requestsWithCoords = requests.filter(
      (r) => r.latitude && r.longitude
    );

    if (requestsWithCoords.length === 0) return;

    // Add markers
    requestsWithCoords.forEach((request) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = URGENCY_COLORS[request.urgency] || URGENCY_COLORS.medium;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // Add inner icon
      const icon = document.createElement('div');
      icon.innerHTML = '📍';
      icon.style.fontSize = '16px';
      el.appendChild(icon);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${request.title}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${request.location_name || 'Unknown location'}</p>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <span style="
              padding: 2px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: 500;
              background: ${URGENCY_COLORS[request.urgency]}20;
              color: ${URGENCY_COLORS[request.urgency]};
            ">
              ${request.urgency === 'critical' ? '🔴 Khẩn cấp' : 
                request.urgency === 'high' ? '🟠 Cao' : 
                request.urgency === 'medium' ? '🟡 Trung bình' : '🟢 Thấp'}
            </span>
            <span style="font-size: 11px; color: #6b7280;">
              👥 ${request.volunteers_matched}/${request.volunteers_needed}
            </span>
          </div>
          <p style="font-size: 12px; color: #4b5563; line-height: 1.4;">
            ${(request.description || '').substring(0, 100)}${(request.description?.length || 0) > 100 ? '...' : ''}
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([request.longitude!, request.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectRequest?.(request);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (requestsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      requestsWithCoords.forEach((r) => {
        bounds.extend([r.longitude!, r.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [requests, isTokenSet, onSelectRequest]);

  if (!isTokenSet) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {language === 'vi' ? 'Cần Mapbox Token' : 'Mapbox Token Required'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {language === 'vi'
              ? 'Để hiển thị bản đồ, vui lòng nhập Mapbox Public Token của bạn. Truy cập mapbox.com để lấy token miễn phí.'
              : 'To display the map, please enter your Mapbox Public Token. Visit mapbox.com to get a free token.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveToken} className="gap-2">
              <Key className="w-4 h-4" />
              {language === 'vi' ? 'Lưu Token' : 'Save Token'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {language === 'vi'
              ? 'Token sẽ được lưu trong trình duyệt của bạn.'
              : 'The token will be saved in your browser.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-border/50">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50">
        <p className="text-xs font-medium mb-2 text-muted-foreground">
          {language === 'vi' ? 'Mức độ khẩn cấp' : 'Urgency Level'}
        </p>
        <div className="space-y-1">
          {[
            { key: 'critical', label: language === 'vi' ? 'Khẩn cấp' : 'Critical' },
            { key: 'high', label: language === 'vi' ? 'Cao' : 'High' },
            { key: 'medium', label: language === 'vi' ? 'Trung bình' : 'Medium' },
            { key: 'low', label: language === 'vi' ? 'Thấp' : 'Low' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: URGENCY_COLORS[item.key] }}
              />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Request count */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/50">
        <p className="text-sm font-medium">
          {requests.filter((r) => r.latitude && r.longitude).length}{' '}
          {language === 'vi' ? 'yêu cầu trên bản đồ' : 'requests on map'}
        </p>
      </div>
    </div>
  );
};
