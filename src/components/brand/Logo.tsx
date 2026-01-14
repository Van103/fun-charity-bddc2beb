import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import funCharityLogo from "@/assets/fun-charity-logo-cutout.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const logoChromaCache = new Map<string, string>();

function colorDistance(a: [number, number, number], b: [number, number, number]) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

async function chromaKeyToTransparentPng(src: string) {
  if (logoChromaCache.has(src)) return logoChromaCache.get(src)!;

  const img = new Image();
  img.src = src;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return src;

  ctx.drawImage(img, 0, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Sample background colors from corners (works even if the asset was exported with a solid background).
  const sample = (x: number, y: number): [number, number, number] => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const bgColors: [number, number, number][] = [
    sample(0, 0),
    sample(width - 1, 0),
    sample(0, height - 1),
    sample(width - 1, height - 1),
  ];

  // Thresholds tuned to remove white / checkerboard backgrounds + edge halos.
  const hardCut = 28; // definitely background
  const softCut = 80; // fade edge halos

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const pix: [number, number, number] = [r, g, b];
    let minDist = Infinity;
    for (const bg of bgColors) {
      const d = colorDistance(pix, bg);
      if (d < minDist) minDist = d;
    }

    if (minDist <= hardCut) {
      data[i + 3] = 0;
      continue;
    }

    if (minDist < softCut) {
      const t = (minDist - hardCut) / (softCut - hardCut); // 0..1
      data[i + 3] = Math.round(a * t);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const out = canvas.toDataURL("image/png");
  logoChromaCache.set(src, out);
  return out;
}

export function Logo({ size = "md", showText = false, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 72, text: "text-lg" },
    md: { icon: 96, text: "text-xl" },
    lg: { icon: 120, text: "text-2xl" },
    xl: { icon: 160, text: "text-3xl" },
  };

  const s = sizes[size];

  const initialSrc = useMemo(
    () => logoChromaCache.get(funCharityLogo) ?? funCharityLogo,
    []
  );
  const [logoSrc, setLogoSrc] = useState<string>(initialSrc);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const processed = await chromaKeyToTransparentPng(funCharityLogo);
      if (!cancelled) setLogoSrc(processed);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="relative"
        style={{ width: s.icon, height: s.icon }}
      >
        <img
          src={logoSrc}
          alt="FUN Charity Logo"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </motion.div>

      {showText && (
        <motion.span
          className={`font-display font-bold ${s.text} text-gold-shimmer tracking-tight whitespace-nowrap`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          FUNCHARITY
        </motion.span>
      )}
    </div>
  );
}
