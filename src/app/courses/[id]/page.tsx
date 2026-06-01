// src/app/courses/[id]/page.tsx — Course Detail Page (Server Component)
import { notFound } from "next/navigation";
import { getCourseById } from "../../../actions";
import { Header } from "@/components/header";
import { RegisterForm } from "@/components/Registerform";
import { QRCode } from "@/components/QRCode";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) return { title: "دورة غير موجودة" };
  return {
    title: `${course.title} | جمعية تمكين القيادات الأهلية`,
    description: course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();

  const isOpen = course.status === "open";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamkeen.org.sa";
  const registrationUrl = `${baseUrl}/courses/${course.id}`;

  const dateFormatted = new Date(course.date).toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endDateFormatted = course.end_date
    ? new Date(course.end_date).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Format optional time range (e.g. "10:00 ص - 1:00 م")
  const formatTime = (t?: string | null) => {
    if (!t) return null;
    const [hh, mm] = t.split(":");
    const h = parseInt(hh);
    const suffix = h >= 12 ? "م" : "ص";
    const hour12 = h % 12 || 12;
    return `${hour12}:${mm} ${suffix}`;
  };
  const timeStart = formatTime(course.time_start);
  const timeEnd = formatTime(course.time_end);
  const timeRange =
    timeStart && timeEnd
      ? `${timeStart} – ${timeEnd}`
      : timeStart || timeEnd || null;

  return (
    <div className="min-h-screen bg-brand-bg font-tajawal">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-gold transition-colors">
          الرئيسية
        </Link>
        <ArrowRight size={14} className="rotate-180" />
        <Link href="/#courses" className="hover:text-brand-gold transition-colors">
          الدورات
        </Link>
        <ArrowRight size={14} className="rotate-180" />
        <span className="text-brand-dark font-medium line-clamp-1">
          {course.title}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="bg-brand-dark rounded-2xl overflow-hidden">
              {/* Image if available */}
              {course.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full max-h-[28rem] object-contain bg-brand-dark"
                />
              )}

              <div className="p-8">
                {/* Status + Category */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isOpen
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {isOpen ? "مفتوح للتسجيل" : "مغلق"}
                  </span>
                  {course.category && (
                    <span className="text-xs bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-snug mb-4">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="text-white/60 leading-loose text-sm">
                    {course.description}
                  </p>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-brand-dark font-bold text-lg mb-4 flex items-center gap-2">
                <BadgeCheck size={18} className="text-brand-gold" />
                تفاصيل الدورة
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User, label: "المدرب", value: course.instructor },
                  { icon: Calendar, label: "تاريخ البداية", value: dateFormatted },
                  ...(endDateFormatted
                    ? [{ icon: Calendar, label: "تاريخ النهاية", value: endDateFormatted }]
                    : []),
                  ...(timeRange
                    ? [{ icon: Clock, label: "الوقت", value: timeRange }]
                    : []),
                  ...(course.duration
                    ? [{ icon: Clock, label: "المدة", value: course.duration }]
                    : []),
                  ...(course.location
                    ? [{ icon: MapPin, label: "المكان", value: course.location }]
                    : []),
                  ...(course.seats && course.seats > 0
                    ? [{ icon: Users, label: "عدد المقاعد", value: `${course.seats} مقعد` }]
                    : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 bg-brand-bg rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className="text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-brand-dark font-semibold text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Objectives / محاور */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-brand-dark font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-brand-gold" />
                  محاور الدورة
                </h2>
                <ul className="space-y-2.5">
                  {course.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-brand-gold/10 text-brand-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right Column ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <RegisterForm
                courseId={course.id}
                courseName={course.title}
                isOpen={isOpen}
              />
              <QRCode url={registrationUrl} courseName={course.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}