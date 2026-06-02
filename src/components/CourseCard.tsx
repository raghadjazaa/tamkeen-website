// src/components/CourseCard.tsx
import Link from "next/link";
import { Course } from "@/lib/types";
import { Calendar, MapPin, User, Clock, ArrowLeft } from "lucide-react";

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
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-brand-orange/40 flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-dark">
        {course.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.image_url}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
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
            className={`text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
              isOpen
                ? "bg-emerald-500 text-white"
                : "bg-gray-700 text-white"
            }`}
          >
            {isOpen ? "مفتوح للتسجيل" : "مغلق"}
          </span>
        </div>

        {/* Category */}
        {course.category && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-xs bg-white/95 text-brand-dark px-3 py-1 rounded-md font-bold backdrop-blur-sm shadow-sm">
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
        <div className="space-y-2 text-sm text-gray-600 mt-auto pt-2">
          <div className="flex items-center gap-2">
            <User size={15} className="text-brand-orange shrink-0" />
            <span>{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-brand-orange shrink-0" />
            <span>{dateFormatted}</span>
          </div>
          {course.location && (
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-orange shrink-0" />
              <span className="truncate">{course.location}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-brand-orange shrink-0" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 mt-2">
          {isOpen ? (
            <Link
              href={`/courses/${course.id}`}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              سجّل الآن
              <ArrowLeft size={15} />
            </Link>
          ) : (
            <div className="bg-gray-50 rounded-lg py-3 text-center">
              <p className="text-gray-500 text-sm">التسجيل مغلق</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}