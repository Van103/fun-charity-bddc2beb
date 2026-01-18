import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface ManifestData {
  name?: string;
  short_name?: string;
  id?: string;
  start_url?: string;
  icons?: ManifestIcon[];
}

const PwaDebug = () => {
  const [manifestUrl, setManifestUrl] = useState<string>("");
  const [manifestData, setManifestData] = useState<ManifestData | null>(null);
  const [error, setError] = useState<string>("");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Get manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const href = manifestLink.getAttribute("href") || "";
      setManifestUrl(href);

      // Fetch manifest content
      fetch(href)
        .then((res) => res.json())
        .then((data) => setManifestData(data))
        .catch((err) => setError(err.message));
    } else {
      setError("Không tìm thấy manifest link trong DOM");
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>PWA Debug - FUN Charity</title>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-center">🔧 PWA Debug</h1>

          {/* Standalone Status */}
          <div className="p-4 rounded-xl bg-card border">
            <h2 className="font-semibold mb-2">Trạng thái PWA</h2>
            <p>
              {isStandalone ? (
                <span className="text-green-500">✅ Đang chạy như app (standalone)</span>
              ) : (
                <span className="text-yellow-500">⚠️ Đang chạy trong trình duyệt</span>
              )}
            </p>
          </div>

          {/* Manifest URL */}
          <div className="p-4 rounded-xl bg-card border">
            <h2 className="font-semibold mb-2">Manifest URL</h2>
            <code className="text-xs break-all bg-muted p-2 rounded block">
              {manifestUrl || "Không tìm thấy"}
            </code>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive">
              <h2 className="font-semibold mb-2 text-destructive">Lỗi</h2>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Manifest Data */}
          {manifestData && (
            <div className="p-4 rounded-xl bg-card border">
              <h2 className="font-semibold mb-4">Thông tin Manifest</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>name:</strong> {manifestData.name}
                </p>
                <p>
                  <strong>short_name:</strong> {manifestData.short_name}
                </p>
                <p>
                  <strong>id:</strong> {manifestData.id}
                </p>
                <p>
                  <strong>start_url:</strong> {manifestData.start_url}
                </p>
              </div>
            </div>
          )}

          {/* Icon Preview */}
          {manifestData?.icons && manifestData.icons.length > 0 && (
            <div className="p-4 rounded-xl bg-card border">
              <h2 className="font-semibold mb-4">Icon Preview</h2>
              <div className="grid grid-cols-2 gap-4">
                {manifestData.icons.map((icon, idx) => (
                  <div key={idx} className="text-center">
                    <img
                      src={icon.src}
                      alt={`Icon ${icon.sizes}`}
                      className="w-16 h-16 mx-auto mb-2 rounded-lg border bg-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      {icon.sizes} - {icon.purpose || "any"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Icon Test */}
          <div className="p-4 rounded-xl bg-card border">
            <h2 className="font-semibold mb-4">Test Icon URLs trực tiếp</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  src="/funcharity-icon-192-v4.png"
                  alt="v4 192"
                  className="w-16 h-16 mx-auto mb-2 rounded-lg border bg-white"
                />
                <p className="text-xs text-muted-foreground">v4 - 192px</p>
              </div>
              <div className="text-center">
                <img
                  src="/funcharity-icon-512-v4.png"
                  alt="v4 512"
                  className="w-16 h-16 mx-auto mb-2 rounded-lg border bg-white"
                />
                <p className="text-xs text-muted-foreground">v4 - 512px</p>
              </div>
              <div className="text-center">
                <img
                  src="/funcharity-apple-touch-icon-v4.png"
                  alt="v4 apple"
                  className="w-16 h-16 mx-auto mb-2 rounded-lg border bg-white"
                />
                <p className="text-xs text-muted-foreground">v4 - Apple</p>
              </div>
              <div className="text-center">
                <img
                  src="/funcharity-favicon-v4.png"
                  alt="v4 favicon"
                  className="w-16 h-16 mx-auto mb-2 rounded-lg border bg-white"
                />
                <p className="text-xs text-muted-foreground">v4 - Favicon</p>
              </div>
            </div>
          </div>

          {/* Cache Clearing Instructions */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <h2 className="font-semibold mb-2">Hướng dẫn xóa cache</h2>
            <div className="text-sm space-y-2">
              <p><strong>Android Chrome:</strong></p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Gỡ app khỏi màn hình chính</li>
                <li>Chrome → Settings → Site settings → All sites → charity.fun.rich → Clear & reset</li>
                <li>Chrome → Settings → Privacy → Clear browsing data → Cached images</li>
                <li>Mở lại: <code className="bg-muted px-1 rounded">/?pwa=v4</code></li>
              </ol>
              <p className="mt-3"><strong>iPhone Safari:</strong></p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Xóa icon đã add</li>
                <li>Settings → Safari → Advanced → Website Data → xóa charity.fun.rich</li>
                <li>Mở lại: <code className="bg-muted px-1 rounded">/?pwa=v4</code></li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PwaDebug;
