// src/components/MeetingCard.tsx
import Link from "next/link";
import { Meeting } from "@/lib/types";
import { Calendar, Clock, MapPin, ArrowLeft, Users, Sparkles } from "lucide-react";

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
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
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-brand-orange/40 flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-dark">
        {meeting.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meeting.poster_url}
            alt={meeting.title}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-6 right-6 w-24 h-24 border border-brand-orange rounded-full" />
              <div className="absolute bottom-6 left-6 w-16 h-16 border border-brand-orange rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-brand-orange rotate-45" />
            </div>
            <Sparkles size={48} className="text-brand-orange opacity-30 relative z-10" />
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
            {isOpen ? "التسجيل مفتوح" : "انتهى اللقاء"}
          </span>
        </div>

        {/* Day badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="text-xs bg-white/95 text-brand-dark px-3 py-1 rounded-md font-bold backdrop-blur-sm shadow-sm">
            {dayName}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-brand-dark font-bold text-lg leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors">
          {meeting.title}
        </h3>

        {meeting.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
            {meeting.description}
          </p>
        )}

        {/* Meta */}
        <div className="space-y-2 text-sm text-gray-600 mt-auto pt-2">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-brand-orange shrink-0" />
            <span>{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-brand-orange shrink-0" />
            <span>{timeFormatted}</span>
          </div>
          {meeting.location && (
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-orange shrink-0" />
              <span className="truncate">{meeting.location}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 mt-2">
          {isOpen ? (
            <Link
              href={`/meetings/${meeting.id}`}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              التسجيل
              <ArrowLeft size={15} />
            </Link>
          ) : (
            <div className="bg-gray-50 rounded-lg py-3 text-center">
              <p className="text-brand-dark font-semibold text-sm mb-1">
                انتهى اللقاء — {dateFormatted}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                <Users size={13} className="text-brand-orange" />
                <span>عدد الحضور: {meeting.attendees_count}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}