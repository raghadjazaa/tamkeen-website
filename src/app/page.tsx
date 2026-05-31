// src/app/page.tsx — Landing Page (Server Component)
import { getCourses, getMeetings, getSiteSettings } from "@/actions";
import { Header } from "@/components/header";
import { CourseCard } from "@/components/CourseCard";
import { MeetingCard } from "@/components/MeetingCard";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [courses, meetings, settings] = await Promise.all([
    getCourses({ status: "open" }),
    getMeetings(),
    getSiteSettings(),
  ]);

  const contactItems = [
    { icon: Phone, label: "الهاتف", value: settings.phone || "— يُضاف لاحقاً —" },
    { icon: Mail, label: "البريد", value: settings.email || "— يُضاف لاحقاً —" },
    { icon: MapPin, label: "العنوان", value: settings.address || "— يُضاف لاحقاً —" },
  ];

  return (
    <div className="min-h-screen bg-brand-light font-tajawal">
      <Header />

      {/* HERO */}
      <section className="relative bg-brand-dark overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 border border-brand-orange rounded-full" />
          <div className="absolute bottom-10 left-10 w-40 h-40 border border-brand-orange rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-brand-orange rotate-12 rounded-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 border border-brand-orange/30 bg-brand-orange/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-brand-orange text-sm font-medium">
              نحو قيادة أهلية فاعلة ومستدامة
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            جمعية{" "}
            <span className="text-brand-orange">تمكين القيادات</span>{" "}
            الأهلية
          </h1>

          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            نُعنى ببناء قيادات مجتمعية مؤهلة قادرة على إحداث الأثر الإيجابي
            في القطاع الأهلي، من خلال برامج تدريبية متخصصة.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#courses"
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-0.5"
            >
              استعرض الدورات
            </a>
            <a
              href="#meetings"
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-0.5"
            >
              اللقاءات الدورية
            </a>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-brand-orange to-transparent" />
      </section>

      {/* COURSES */}
      <section id="courses" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-orange text-sm font-semibold mb-1">
              برامجنا التدريبية
            </p>
            <h2 className="text-3xl font-extrabold text-brand-dark">
              الدورات المتاحة
            </h2>
          </div>
          {courses.length > 0 && (
            <p className="text-gray-500 text-sm">{courses.length} دورة متاحة</p>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-brand-orange" />
            </div>
            <h3 className="text-brand-dark font-bold text-xl mb-2">
              لا توجد دورات متاحة حالياً
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              يعمل فريقنا على إعداد برامج تدريبية متميزة. تابعونا لمعرفة أحدث
              الدورات عند إطلاقها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════ MEETINGS ═══════════════════ */}
      <section id="meetings" className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-orange text-sm font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles size={14} />
                مبادراتنا المستمرة
              </p>
              <h2 className="text-3xl font-extrabold text-brand-dark">
                لقاءات القيادات الدورية
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xl">
                لقاءات تجمع القيادات الأهلية لتبادل الخبرات وبناء شراكات فاعلة
              </p>
            </div>
            {meetings.length > 0 && (
              <p className="text-gray-500 text-sm shrink-0">
                {meetings.filter((m) => m.status === "open").length} لقاء قادم
              </p>
            )}
          </div>

          {meetings.length === 0 ? (
            <div className="bg-brand-light/40 rounded-2xl border border-gray-100 py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-brand-orange" />
              </div>
              <h3 className="text-brand-dark font-bold text-xl mb-2">
                لا توجد لقاءات حالياً
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                ترقّبوا قريباً لقاءاتنا الدورية التي تجمع نخبة من القيادات الأهلية.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-brand-dark py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-brand-orange text-sm font-semibold mb-2">من نحن</p>
          <h2 className="text-3xl font-extrabold text-white mb-6">
            رسالتنا ورؤيتنا
          </h2>
          <p className="text-white/70 leading-loose text-base max-w-2xl mx-auto">
            جمعية تمكين القيادات الأهلية جمعية مرخصة تسعى إلى تطوير الكوادر
            القيادية في القطاع الأهلي، وتعزيز دورهم في العمل التطوعي والمجتمعي،
            من خلال برامج تدريبية متخصصة وورش عمل.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-brand-orange text-sm font-semibold mb-1">تواصل معنا</p>
          <h2 className="text-3xl font-extrabold text-brand-dark">نحن هنا للمساعدة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {contactItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-brand-orange/10 flex items-center justify-center">
                <Icon size={18} className="text-brand-orange" />
              </div>
              <p className="font-semibold text-brand-dark text-sm">{label}</p>
              <p className="text-gray-500 text-sm">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-dark border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center space-y-2">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} جمعية تمكين القيادات الأهلية — جميع الحقوق محفوظة
          </p>
          <p className="text-brand-orange text-xs font-medium tracking-wide">
            Designed & Developed by Raghad Jazaa
          </p>
        </div>
      </footer>
    </div>
  );
}