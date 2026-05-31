"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#courses", label: "الدورات" },
    { href: "#meetings", label: "لقاءات القيادات" },
    { href: "#about", label: "عن الجمعية" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-brand-light flex items-center justify-center transition-all group-hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="جمعية تمكين القيادات الأهلية"
                width={56}
                height={56}
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-brand-dark font-bold text-base leading-tight">
                جمعية تمكين القيادات الأهلية
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-brand-dark font-medium hover:text-brand-orange transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300" />
              </a>
            ))}

            <Link
              href="/admin"
              className="flex items-center gap-2 border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Shield size={16} />
              <span>لوحة الإدارة</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-brand-dark hover:text-brand-orange transition-colors"
            aria-label="القائمة"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-brand-dark hover:bg-brand-light hover:text-brand-orange rounded-lg transition-colors font-medium"
              >
                {label}
              </a>
            ))}

            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 mx-4 mt-2 bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2.5 rounded-lg font-medium transition-all justify-center"
            >
              <Shield size={16} />
              <span>لوحة الإدارة</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}