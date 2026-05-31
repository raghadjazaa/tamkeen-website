"use client";

import { useEffect, useRef } from "react";
import { QrCode } from "lucide-react";

interface QRCodeProps {
  url: string;
  courseName: string;
}

/**
 * Renders a QR code using the qrcode.js library loaded from CDN.
 * No npm package needed — works entirely client-side.
 */
export function QRCode({ url, courseName }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load QRCode library
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && (window as unknown as { QRCode: unknown }).QRCode) {
        containerRef.current.innerHTML = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window as any).QRCode(containerRef.current, {
          text: url,
          width: 180,
          height: 180,
          colorDark: "#232937",
          colorLight: "#ffffff",
          correctLevel: (window as unknown as { QRCode: { CorrectLevel: { H: number } } }).QRCode.CorrectLevel.H,
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [url]);

  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${courseName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-brand-dark font-semibold text-sm">
        <QrCode size={16} className="text-brand-gold" />
        رمز QR للتسجيل
      </div>

      <div
        ref={containerRef}
        className="p-3 bg-white rounded-xl border-2 border-brand-dark/10"
        style={{ minWidth: 180, minHeight: 180 }}
      />

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        امسح الرمز للانتقال<br />لصفحة التسجيل مباشرة
      </p>

      <button
        onClick={handleDownload}
        className="text-xs text-brand-gold hover:text-brand-gold-dark border border-brand-gold/30 hover:border-brand-gold px-4 py-1.5 rounded-lg transition-all"
      >
        تحميل رمز QR
      </button>
    </div>
  );
}