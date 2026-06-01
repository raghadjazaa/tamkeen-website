// src/components/CourseCard.tsx
import Link from "next/link";
import { Course } from "@/lib/types";
import { Calendar, MapPin, User, Clock, Users, ArrowLeft } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const isOpen = course.status === "open";

  const dateFormatted = new Date(course.date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-orange/40 flex flex-col">
      {/* Poster — flexible (3:4 with object-contain) */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-dark">
        {course.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.image_url}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Geometric placeholder */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 border border-brand-orange rounded-full" />
              <div className="absolute bottom-4 left-4 w-14 h-14 border border-brand-orange rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-brand-orange rotate-45" />
            </div>
            <span className="text-brand-orange text-5xl font-bold opacity-30 relative z-10">
              {course.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isOpen
                ? "bg-emerald-500 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            {isOpen ? "مفتوح للتسجيل" : "مغلق"}
          </span>
        </div>

        {/* Category */}
        {course.category && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-xs bg-white/90 text-brand-dark px-2 py-0.5 rounded-md font-medium">
              {course.category}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-brand-dark font-bold text-lg leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Meta */}
        <div className="space-y-1.5 text-sm text-gray-600 mt-auto">
          <div className="flex items-center gap-2">
            <User size={14} className="text-brand-orange shrink-0" />
            <span>{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-orange shrink-0" />
            <span>{dateFormatted}</span>
          </div>
          {course.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-orange shrink-0" />
              <span>{course.location}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-brand-orange shrink-0" />
              <span>{course.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users size={14} className="text-brand-orange shrink-0" />
            <span>{course.seats} مقعد</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100 mt-2">
          <Link
            href={`/courses/${course.id}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isOpen
                ? "bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            {isOpen ? "سجّل الآن" : "مغلق"}
            {isOpen && <ArrowLeft size={14} />}
          </Link>
        </div>
      </div>
    </article>
  );
}