// src/app/meetings/[id]/page.tsx — Meeting Detail Page (Server Component)
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMeetingById } from "@/actions";
import { Header } from "@/components/header";
import { MeetingRegisterForm } from "@/components/MeetingRegisterForm";
import { ShareMeetingButton } from "@/components/ShareMeetingButton";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const meeting = await getMeetingById(id);

  if (!meeting) notFound();

  const isOpen = meeting.status === "open";
  const meetingDate = new Date(meeting.date);
  const dayName = meetingDate.toLocaleDateString("ar-SA", { weekday: "long" });
  const dd = String(meetingDate.getDate()).padStart(2, "0");
  const mm = String(meetingDate.getMonth() + 1).padStart(2, "0");
  const yyyy = meetingDate.getFullYear();
  const dateFormatted = `${dd}/${mm}/${yyyy}`;

  const timeFormatted = (() => {
    const [hours, minutes] = meeting.time.split(":");
    const h = parseInt(hours);
    const suffix = h >= 12 ? "م" : "ص";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${suffix}`;
  })();

  return (
    <div className="min-h-screen bg-brand-light font-tajawal">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange transition-colors">
            الرئيسية
          </Link>
          <ArrowRight size={12} className="rotate-180" />
          <Link href="/#meetings" className="hover:text-brand-orange transition-colors">
            لقاءات القيادات
          </Link>
          <ArrowRight size={12} className="rotate-180" />
          <span className="text-brand-dark font-medium truncate">{meeting.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Meeting Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Poster */}
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden bg-brand-dark shadow-lg">
              {meeting.poster_url ? (
                <Image
                  src={meeting.poster_url}
                  alt={meeting.title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 right-8 w-32 h-32 border-2 border-brand-orange rounded-full" />
                    <div className="absolute bottom-8 left-8 w-24 h-24 border-2 border-brand-orange rounded-full" />
                  </div>
                  <Sparkles size={64} className="text-brand-orange opacity-30 relative z-10" />
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`text-sm font-semibold px-4 py-1.5 rounded-full shadow-md ${
                    isOpen
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {isOpen ? "التسجيل مفتوح" : "انتهى اللقاء"}
                </span>
              </div>
            </div>

            {/* Title & description */}
            <div>
              <p className="text-brand-orange text-sm font-semibold mb-2">
                لقاءات القيادات الدورية
              </p>
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark leading-tight">
                  {meeting.title}
                </h1>
                <ShareMeetingButton meetingId={meeting.id} />
              </div>

              {meeting.description && (
                <p className="text-gray-600 text-base leading-relaxed">
                  {meeting.description}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-brand-dark mb-4 text-lg">تفاصيل اللقاء</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">التاريخ</p>
                    <p className="font-semibold text-brand-dark text-sm">{dateFormatted}</p>
                    <p className="text-xs text-gray-500">{dayName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">الوقت</p>
                    <p className="font-semibold text-brand-dark text-sm">{timeFormatted}</p>
                  </div>
                </div>

                {meeting.location && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">الموقع</p>
                      <p className="font-semibold text-brand-dark text-sm">{meeting.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Objectives */}
            {meeting.objectives && meeting.objectives.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-brand-dark mb-4 text-lg">محاور اللقاء وأهدافه</h3>
                <ul className="space-y-2.5">
                  {meeting.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-gray-700 text-sm">
                      <CheckCircle size={16} className="text-brand-orange shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Registration Form / Closed State */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              {isOpen ? (
                <MeetingRegisterForm meetingId={meeting.id} meetingTitle={meeting.title} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users size={28} className="text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">انتهى اللقاء</h3>
                  <p className="text-gray-500 text-sm mb-5">{dateFormatted}</p>

                  <div className="bg-brand-light rounded-xl p-5">
                    <p className="text-xs text-gray-500 mb-1">عدد الحضور</p>
                    <p className="text-3xl font-extrabold text-brand-orange">
                      {meeting.attendees_count}
                    </p>
                  </div>

                  <Link
                    href="/#meetings"
                    className="block mt-5 text-sm text-brand-orange hover:text-brand-orange-hover font-medium"
                  >
                    تصفح اللقاءات الأخرى ←
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center space-y-2">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} جمعية تمكين القيادات الأهلية — جميع الحقوق محفوظة
          </p>
          <p className="text-brand-orange text-xs font-medium tracking-wide">
            Designed & Developed by Raghad Alshammari
          </p>
        </div>
      </footer>
    </div>
  );
}