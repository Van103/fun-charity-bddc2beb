import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio?: number;
  onCropComplete: (croppedImageBlob: Blob) => void;
  title?: string;
}

export function ImageCropper({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio = 1,
  onCropComplete,
  title = "Cắt ảnh"
}: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Get container dimensions (the visible crop area)
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Calculate output size (max 800px)
    const outputWidth = Math.min(800, containerWidth * 2);
    const outputHeight = aspectRatio ? outputWidth / aspectRatio : Math.min(800, containerHeight * 2);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Calculate the visible portion of the image
    const imgDisplayWidth = img.width * scale;
    const imgDisplayHeight = img.height * scale;
    
    // Position of top-left corner of visible area relative to image
    const visibleX = (containerWidth / 2 - position.x - imgDisplayWidth / 2);
    const visibleY = (containerHeight / 2 - position.y - imgDisplayHeight / 2);

    // Convert to source coordinates
    const sourceX = (visibleX / scale) * (img.naturalWidth / img.width);
    const sourceY = (visibleY / scale) * (img.naturalHeight / img.height);
    const sourceWidth = (containerWidth / scale) * (img.naturalWidth / img.width);
    const sourceHeight = (containerHeight / scale) * (img.naturalHeight / img.height);

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.92
      );
    });
  }, [scale, position, aspectRatio]);

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
      onClose();
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Calculate container dimensions based on aspect ratio
  const getContainerStyle = () => {
    if (aspectRatio === 1) {
      return { width: '280px', height: '280px' };
    } else if (aspectRatio > 1) {
      // Landscape (e.g., cover 16:9)
      return { width: '100%', maxWidth: '480px', aspectRatio: `${aspectRatio}` };
    } else {
      // Portrait
      return { width: '280px', aspectRatio: `${aspectRatio}` };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <span className="text-sm font-normal text-muted-foreground">
              (Kéo để di chuyển ảnh)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col items-center justify-center py-4">
          {/* Crop frame - Facebook style */}
          <div 
            ref={containerRef}
            className="relative overflow-hidden bg-black rounded-lg cursor-move"
            style={getContainerStyle()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The image that can be dragged and zoomed */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute select-none"
              style={{
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                left: '50%',
                top: '50%',
                maxWidth: 'none',
                maxHeight: 'none',
                width: 'auto',
                height: aspectRatio === 1 ? '100%' : aspectRatio > 1 ? '150%' : '100%',
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Overlay hint */}
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Kéo để di chuyển
                </div>
              </div>
            )}

            {/* Circle overlay for avatar */}
            {aspectRatio === 1 && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  WebkitMaskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
                  maskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
                }}
              />
            )}
          </div>

          {/* Zoom control */}
          <div className="flex items-center gap-4 mt-6 w-full max-w-xs">
            <ZoomOut className="w-5 h-5 text-muted-foreground shrink-0" />
            <Slider
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
              min={1}
              max={3}
              step={0.05}
              className="flex-1"
            />
            <ZoomIn className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Thu phóng: {Math.round(scale * 100)}%</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleReset} size="sm">
            Đặt lại
          </Button>
          <Button variant="outline" onClick={onClose} size="sm">
            Hủy
          </Button>
          <Button onClick={handleSave} size="sm">
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
