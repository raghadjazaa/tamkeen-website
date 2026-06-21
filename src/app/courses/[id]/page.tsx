// src/app/courses/[id]/page.tsx — Course Detail Page (Server Component)
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/actions";
import { Header } from "@/components/header";
import { RegisterForm } from "@/components/Registerform";
import { ShareCourseButton } from "@/components/ShareCourseButton";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  CheckCircle,
  BookOpen,
} from "lucide-react";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) notFound();

  const isOpen = course.status === "open";

  const startDate = new Date(course.date);
  const dd = String(startDate.getDate()).padStart(2, "0");
  const mm = String(startDate.getMonth() + 1).padStart(2, "0");
  const yyyy = startDate.getFullYear();
  const dateFormatted = `${dd}/${mm}/${yyyy}`;

  const endDateFormatted = course.end_date
    ? (() => {
        const d = new Date(course.end_date);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      })()
    : null;

  const timeFormatted =
    course.time_start
      ? (() => {
          const [h, m] = course.time_start.split(":");
          const hour = parseInt(h);
          const suffix = hour >= 12 ? "م" : "ص";
          const hour12 = hour % 12 || 12;
          return `${hour12}:${m} ${suffix}`;
        })()
      : null;

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
          <Link href="/#courses" className="hover:text-brand-orange transition-colors">
            الدورات
          </Link>
          <ArrowRight size={12} className="rotate-180" />
          <span className="text-brand-dark font-medium truncate">{course.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Course Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cover Image */}
            {course.image_url && (
              <div className="w-full rounded-2xl overflow-hidden bg-brand-dark shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}

            {/* Title & Status */}
            <div>
              {course.category && (
                <span className="inline-block bg-brand-orange/10 text-brand-orange text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {course.category}
                </span>
              )}
              <h1 className="text-2xl font-bold text-brand-dark mb-2">{course.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    isOpen
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isOpen ? "التسجيل مفتوح" : "التسجيل مغلق"}
                </span>
                <ShareCourseButton courseId={course.id} />
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <User size={16} className="text-brand-orange shrink-0" />
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar size={16} className="text-brand-orange shrink-0" />
                <span>
                  {dateFormatted}
                  {endDateFormatted && ` — ${endDateFormatted}`}
                </span>
              </div>
              {timeFormatted && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock size={16} className="text-brand-orange shrink-0" />
                  <span>
                    {timeFormatted}
                    {course.time_end &&
                      ` — ${(() => {
                        const [h, m] = course.time_end.split(":");
                        const hour = parseInt(h);
                        const suffix = hour >= 12 ? "م" : "ص";
                        const hour12 = hour % 12 || 12;
                        return `${hour12}:${m} ${suffix}`;
                      })()}`}
                  </span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <BookOpen size={16} className="text-brand-orange shrink-0" />
                  <span>{course.duration}</span>
                </div>
              )}
              {course.location && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin size={16} className="text-brand-orange shrink-0" />
                  <span>{course.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-brand-dark mb-2 text-base">عن الدورة</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
              </div>
            )}

            {/* Objectives */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-brand-dark mb-3 text-base">محاور الدورة</h2>
                <ul className="space-y-2">
                  {course.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-brand-orange shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Bio */}
            {course.instructor_bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-brand-dark mb-2 text-base">عن المدرب</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{course.instructor_bio}</p>
              </div>
            )}
          </div>

          {/* Right: Registration Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <RegisterForm
                courseId={course.id}
                courseName={course.title}
                isOpen={isOpen}
                requireEmail={course.require_email}
                requireAssociationName={course.require_association_name}
                requireLicenseNumber={course.require_license_number}
                attendeesCount={course.attendees_count}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}