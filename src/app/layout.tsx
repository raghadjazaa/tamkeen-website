import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "جمعية تمكين القيادات الأهلية",
  description: "منصة رسمية لبرامج وأنشطة جمعية تمكين القيادات الأهلية",
  keywords: ["تمكين", "قيادات", "دورات تدريبية", "جمعية أهلية"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.variable} font-tajawal bg-brand-bg text-brand-dark antialiased`}
      >
        {children}
      </body>
    </html>
  );
}