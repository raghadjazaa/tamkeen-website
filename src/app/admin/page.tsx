"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Course, Registration, SiteSettings, Meeting, MeetingRegistration } from "@/lib/types";
import {
  createCourse,
  updateCourseStatus,
  deleteCourse,
  getRegistrationsByCourse,
  updateRegistrationStatus,
  getSiteSettings,
  updateSiteSettings,
  getMeetings,
  createMeeting,
  updateMeetingStatus,
  deleteMeeting,
  getMeetingRegistrations,
  verifyAdminPassword,
  uploadCourseImage,
  logoutAdmin,
} from "../../actions";
import {
  PlusCircle,
  Users,
  BookOpen,
  Download,
  ChevronDown,
  ChevronUp,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  ArrowRight,
  LogOut,
  Link2,
  Check,
  Upload,
  Image as ImageIcon,
  X as XIcon,
  Settings as SettingsIcon,
  Save,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Sparkles,
  Building2,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleLogin() {
    if (!pw) return;
    setChecking(true);
    setPwError(false);
    const isValid = await verifyAdminPassword(pw);
    setChecking(false);
    if (isValid) {
      setAuthed(true);
    } else {
      setPwError(true);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center font-tajawal">
        <div className="bg-white rounded-2xl p-10 w-full max-w-sm shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-brand-orange" />
          </div>
          <h1 className="text-xl font-bold text-brand-dark mb-1">لوحة الإدارة</h1>
          <p className="text-gray-500 text-sm mb-6">أدخل كلمة المرور للمتابعة</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="كلمة المرور"
            disabled={checking}
            className={`w-full px-4 py-3 rounded-xl border text-center text-brand-dark text-sm outline-none mb-3 ${
              pwError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
            }`}
          />
          {pwError && (
            <p className="text-red-500 text-xs mb-3">كلمة المرور غير صحيحة</p>
          )}
          <button
            onClick={handleLogin}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-orange/30"
          >
            {checking ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                جاري التحقق...
              </>
            ) : (
              "دخول"
            )}
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "add" | "meetings" | "add-meeting" | "settings">("courses");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Record<string, Registration[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [meetingRegs, setMeetingRegs] = useState<Record<string, MeetingRegistration[]>>({});
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // ✅ تم تصحيح الخطأ هنا

  function copyLink(courseId: string) {
    const url = `${window.location.origin}/courses/${courseId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(courseId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .order("date", { ascending: true });
      setCourses((data as Course[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadMeetings() {
      const data = await getMeetings();
      setMeetings(data);
      setMeetingsLoading(false);
    }
    loadMeetings();
  }, []);

  function copyMeetingLink(meetingId: string) {
    const url = `${window.location.origin}/meetings/${meetingId}`;
    navigator.clipboard.writeText(url);
    setCopiedMeetingId(meetingId);
    setTimeout(() => setCopiedMeetingId(null), 2000);
  }

  async function loadMeetingRegistrations(meetingId: string) {
    if (meetingRegs[meetingId]) return;
    const data = await getMeetingRegistrations(meetingId);
    setMeetingRegs((prev) => ({ ...prev, [meetingId]: data }));
  }

  function toggleMeeting(id: string) {
    setExpandedMeeting((prev) => (prev === id ? null : id));
    if (expandedMeeting !== id) loadMeetingRegistrations(id);
  }

  async function handleToggleMeetingStatus(meeting: Meeting) {
    if (meeting.status === "open") {
      const countStr = prompt("كم عدد الحضور؟", "0");
      if (countStr === null) return;
      const count = parseInt(countStr) || 0;
      startTransition(async () => {
        await updateMeetingStatus(meeting.id, "closed", count);
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meeting.id ? { ...m, status: "closed", attendees_count: count } : m
          )
        );
      });
    } else {
      startTransition(async () => {
        await updateMeetingStatus(meeting.id, "open");
        setMeetings((prev) =>
          prev.map((m) => (m.id === meeting.id ? { ...m, status: "open" } : m))
        );
      });
    }
  }

  async function handleDeleteMeeting(id: string) {
    if (!confirm("هل تريدين حذف هذا اللقاء؟ سيتم حذف جميع التسجيلات.")) return;
    startTransition(async () => {
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    });
  }

  async function loadRegistrations(courseId: string) {
    if (registrations[courseId]) return;
    const data = await getRegistrationsByCourse(courseId);
    setRegistrations((prev) => ({ ...prev, [courseId]: data }));
  }

  function toggleCourse(id: string) {
    setExpandedCourse((prev) => (prev === id ? null : id));
    if (expandedCourse !== id) loadRegistrations(id);
  }

  function exportCSV(courseId: string, courseTitle: string) {
    const regs = registrations[courseId] ?? [];
    const header = "الاسم,الجوال,البريد,الحالة,تاريخ التسجيل";
    const rows = regs.map(
      (r) =>
        `"${r.full_name}","${r.phone}","${r.email}","${r.status}","${new Date(r.registered_at).toLocaleDateString("ar-SA")}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${courseTitle}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleToggleStatus(course: Course) {
    if (course.status === "open") {
      const countStr = prompt("كم عدد الحضور؟", "0");
      if (countStr === null) return;
      const count = parseInt(countStr) || 0;
      startTransition(async () => {
        await updateCourseStatus(course.id, "closed", count);
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, status: "closed", attendees_count: count } : c
          )
        );
      });
    } else {
      startTransition(async () => {
        await updateCourseStatus(course.id, "open");
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, status: "open" } : c))
        );
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذه الدورة؟ سيتم حذف جميع التسجيلات المرتبطة بها.")) return;
    startTransition(async () => {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    });
  }

  async function handleRegStatus(regId: string, courseId: string, status: "confirmed" | "cancelled") {
    await updateRegistrationStatus(regId, status);
    setRegistrations((prev) => ({
      ...prev,
      [courseId]: prev[courseId].map((r) =>
        r.id === regId ? { ...r, status } : r
      ),
    }));
  }

  const statusLabel: Record<string, string> = {
    pending: "معلّق",
    confirmed: "مؤكّد",
    cancelled: "ملغي",
  };
  const statusColor: Record<string, string> = {
    pending: "text-amber-600 bg-amber-50",
    confirmed: "text-emerald-600 bg-emerald-50",
    cancelled: "text-red-500 bg-red-50",
  };

  return (
    <div className="min-h-screen bg-brand-light font-tajawal">
      <header className="bg-brand-dark sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-brand-orange" />
            <span className="text-white font-bold text-sm">لوحة تحكم الإدارة</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/60 hover:text-brand-orange text-xs transition-colors"
            >
              <ArrowRight size={13} className="rotate-180" />
              العودة للموقع
            </Link>
            <button
              onClick={async () => {
                if (confirm("هل تريدين تسجيل الخروج؟")) {
                  await logoutAdmin();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-1.5 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all border border-red-500/30"
            >
              <LogOut size={13} />
              تسجيل خروج
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-brand-orange to-transparent" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {(["courses", "add", "meetings", "add-meeting", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                  : "bg-white text-gray-500 hover:text-brand-dark border border-gray-100"
              }`}
            >
              {tab === "courses" ? (
                <><BookOpen size={15} /> الدورات</>
              ) : tab === "add" ? (
                <><PlusCircle size={15} /> إضافة دورة</>
              ) : tab === "meetings" ? (
                <><Sparkles size={15} /> اللقاءات</>
              ) : tab === "add-meeting" ? (
                <><PlusCircle size={15} /> إضافة لقاء</>
              ) : (
                <><SettingsIcon size={15} /> بيانات التواصل</>
              )}
            </button>
          ))}
        </div>

        {activeTab === "courses" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 size={24} className="animate-spin ml-2" />
                جاري التحميل...
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد دورات بعد. أضف أول دورة!</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-orange/30 transition-colors"
                >
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-brand-dark text-base truncate">
                          {course.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            course.status === "open"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {course.status === "open" ? "مفتوح" : `مغلق — ${course.attendees_count} حاضر`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {course.instructor} •{" "}
                        {(() => { const d = new Date(course.date); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; })()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyLink(course.id)}
                        title="نسخ رابط الدورة"
                        className={`p-2 rounded-lg transition-colors ${
                          copiedId === course.id
                            ? "bg-emerald-50 text-emerald-600"
                            : "hover:bg-gray-50 text-gray-400 hover:text-brand-orange"
                        }`}
                      >
                        {copiedId === course.id ? (
                          <Check size={18} />
                        ) : (
                          <Link2 size={18} />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(course)}
                        disabled={isPending}
                        title={course.status === "open" ? "إغلاق التسجيل" : "فتح التسجيل"}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-brand-orange transition-colors"
                      >
                        {course.status === "open" ? (
                          <ToggleRight size={20} className="text-emerald-500" />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={isPending}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={() => toggleCourse(course.id)}
                        className="flex items-center gap-1.5 text-xs text-brand-orange border border-brand-orange/30 hover:bg-brand-orange hover:text-white px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Users size={13} />
                        المسجلون
                        {expandedCourse === course.id ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="border-t border-gray-100 bg-brand-light/50">
                      <div className="p-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-brand-dark">
                          المسجلون ({registrations[course.id]?.length ?? "..."})
                        </p>
                        <button
                          onClick={() => exportCSV(course.id, course.title)}
                          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-brand-orange border border-gray-200 hover:border-brand-orange px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Download size={12} />
                          تصدير CSV
                        </button>
                      </div>

                      {!registrations[course.id] ? (
                        <div className="py-6 text-center text-gray-500 text-sm">
                          <Loader2 size={18} className="animate-spin mx-auto mb-2" />
                          جاري التحميل...
                        </div>
                      ) : registrations[course.id].length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-sm">
                          لا يوجد مسجلون في هذه الدورة بعد
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-500 border-b border-gray-100">
                                <th className="text-right px-4 py-2 font-medium">الاسم</th>
                                <th className="text-right px-4 py-2 font-medium">الجوال</th>
                                <th className="text-right px-4 py-2 font-medium">البريد</th>
                                <th className="text-right px-4 py-2 font-medium">الجهة</th>
                                <th className="text-right px-4 py-2 font-medium">الترخيص</th>
                                <th className="text-right px-4 py-2 font-medium">الحالة</th>
                                <th className="text-right px-4 py-2 font-medium">إجراء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {registrations[course.id].map((reg) => (
                                <tr
                                  key={reg.id}
                                  className="border-b border-gray-50 hover:bg-white transition-colors"
                                >
                                  <td className="px-4 py-3 font-medium text-brand-dark">
                                    {reg.full_name}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">{reg.phone}</td>
                                  <td className="px-4 py-3 text-gray-600 text-xs">
                                    {reg.email}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 text-xs">
                                    {reg.association_name || "—"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 text-xs">
                                    {reg.license_number || "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[reg.status]}`}
                                    >
                                      {statusLabel[reg.status]}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                      {reg.status !== "confirmed" && (
                                        <button
                                          onClick={() =>
                                            handleRegStatus(reg.id, course.id, "confirmed")
                                          }
                                          className="p-1 rounded text-emerald-500 hover:bg-emerald-50 transition-colors"
                                          title="تأكيد"
                                        >
                                          <CheckCircle size={15} />
                                        </button>
                                      )}
                                      {reg.status !== "cancelled" && (
                                        <button
                                          onClick={() =>
                                            handleRegStatus(reg.id, course.id, "cancelled")
                                          }
                                          className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
                                          title="إلغاء"
                                        >
                                          <XCircle size={15} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "add" && (
          <AddCourseForm
            onSuccess={(newCourse) => {
              setCourses((prev) => [newCourse, ...prev]);
              setActiveTab("courses");
            }}
          />
        )}

        {activeTab === "meetings" && (
          <div className="space-y-4">
            {meetingsLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 size={24} className="animate-spin ml-2" />
                جاري التحميل...
              </div>
            ) : meetings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <Sparkles size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد لقاءات بعد. أضيفي أول لقاء!</p>
              </div>
            ) : (
              meetings.map((meeting) => {
                const meetingDate = new Date(meeting.date);
                const ddm = String(meetingDate.getDate()).padStart(2, "0");
                const mmm = String(meetingDate.getMonth() + 1).padStart(2, "0");
                const yyyym = meetingDate.getFullYear();
                const dateStr = `${ddm}/${mmm}/${yyyym}`;
                return (
                  <div
                    key={meeting.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-orange/30 transition-colors"
                  >
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-brand-dark text-base truncate">
                            {meeting.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                              meeting.status === "open"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {meeting.status === "open" ? "مفتوح" : `انتهى — ${meeting.attendees_count} حاضر`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {dateStr} • {meeting.time}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <button
                          onClick={() => copyMeetingLink(meeting.id)}
                          title="نسخ رابط اللقاء"
                          className={`p-2 rounded-lg transition-colors ${
                            copiedMeetingId === meeting.id
                              ? "bg-emerald-50 text-emerald-600"
                              : "hover:bg-gray-50 text-gray-400 hover:text-brand-orange"
                          }`}
                        >
                          {copiedMeetingId === meeting.id ? <Check size={18} /> : <Link2 size={18} />}
                        </button>

                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          disabled={isPending}
                          title="حذف"
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleMeetingStatus(meeting)}
                          disabled={isPending}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                            meeting.status === "open"
                              ? "border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                              : "border-emerald-300 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                          }`}
                        >
                          {meeting.status === "open" ? (
                            <><XCircle size={13} /> إنهاء اللقاء</>
                          ) : (
                            <><CheckCircle size={13} /> إعادة فتح</>
                          )}
                        </button>

                        <button
                          onClick={() => toggleMeeting(meeting.id)}
                          className="flex items-center gap-1.5 text-xs text-brand-orange border border-brand-orange/30 hover:bg-brand-orange hover:text-white px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Users size={13} />
                          المسجلون
                          {expandedMeeting === meeting.id ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedMeeting === meeting.id && (
                      <div className="border-t border-gray-100 bg-brand-light/50">
                        <div className="p-4">
                          <p className="text-sm font-semibold text-brand-dark mb-3">
                            المسجلون ({meetingRegs[meeting.id]?.length ?? "..."})
                          </p>
                          {!meetingRegs[meeting.id] ? (
                            <div className="py-6 text-center text-gray-500 text-sm">
                              <Loader2 size={18} className="animate-spin mx-auto mb-2" />
                              جاري التحميل...
                            </div>
                          ) : meetingRegs[meeting.id].length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">
                              لا يوجد مسجلون بعد
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                                    <th className="text-right px-3 py-2 font-medium">الاسم</th>
                                    <th className="text-right px-3 py-2 font-medium">النوع</th>
                                    <th className="text-right px-3 py-2 font-medium">الجمعية</th>
                                    <th className="text-right px-3 py-2 font-medium">الجوال</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {meetingRegs[meeting.id].map((reg) => (
                                    <tr key={reg.id} className="border-b border-gray-50 hover:bg-white">
                                      <td className="px-3 py-3 font-medium text-brand-dark">
                                        {reg.full_name}
                                      </td>
                                      <td className="px-3 py-3">
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            reg.registration_type === "association"
                                              ? "bg-blue-50 text-blue-600"
                                              : "bg-purple-50 text-purple-600"
                                          }`}
                                        >
                                          {reg.registration_type === "association" ? "جمعية" : "متطوع/ـة"}
                                        </span>
                                      </td>
                                      <td className="px-3 py-3 text-gray-600 text-xs">
                                        {reg.association_name || "—"}
                                      </td>
                                      <td className="px-3 py-3 text-gray-600" dir="ltr">
                                        {reg.phone}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "add-meeting" && (
          <AddMeetingForm
            onSuccess={(newMeeting) => {
              setMeetings((prev) => [newMeeting, ...prev]);
              setActiveTab("meetings");
            }}
          />
        )}

        {activeTab === "settings" && <SettingsForm />}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ADD MEETING FORM
// ═════════════════════════════════════════════════════════════

function AddMeetingForm({ onSuccess }: { onSuccess: (m: Meeting) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [objectives, setObjectives] = useState<string[]>([""]);

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadCourseImage(fd);

      if (!result.success || !result.url) {
        setError(result.error || "فشل رفع البوستر");
        return;
      }

      setPosterUrl(result.url);
    } catch (err) {
      setError("حدث خطأ أثناء رفع البوستر");
    } finally {
      setUploading(false);
    }
  }

  function addObjective() { setObjectives((prev) => [...prev, ""]); }
  function updateObjective(i: number, val: string) {
    setObjectives((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  }
  function removeObjective(i: number) {
    setObjectives((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const input = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      objectives: objectives.filter((o) => o.trim() !== ""),
      poster_url: posterUrl || null,
      date: fd.get("date") as string,
      time: fd.get("time") as string,
      location: (fd.get("location") as string) || null,
      status: fd.get("status") as "open" | "closed",
    };

    startTransition(async () => {
      const result = await createMeeting(input);
      if (!result.success) {
        setError(result.error ?? "حدث خطأ");
        return;
      }
      if (result.data) onSuccess(result.data);
    });
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-brand-dark placeholder-gray-400 text-sm transition-all";
  const labelClass = "block text-sm font-medium text-brand-dark mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <Sparkles size={20} className="text-brand-orange" />
        إضافة لقاء جديد
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>عنوان اللقاء *</label>
            <input name="title" required placeholder="مثال: لقاء قيادات العمل التطوعي" className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>وصف مختصر</label>
            <textarea
              name="description"
              rows={3}
              placeholder="وصف مختصر عن اللقاء..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>التاريخ *</label>
            <input name="date" type="date" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>الوقت *</label>
            <input name="time" type="time" required className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>المكان</label>
            <input name="location" placeholder="مثال: فندق فيرمونت، الرياض" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>حالة التسجيل</label>
            <select name="status" className={inputClass}>
              <option value="open">مفتوح</option>
              <option value="closed">مغلق</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>بوستر اللقاء</label>
            {!posterUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-xl cursor-pointer transition-colors bg-gray-50/50">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 size={24} className="animate-spin text-brand-orange" />
                    <p className="text-sm">جاري الرفع...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center">
                      <Upload size={20} className="text-brand-orange" />
                    </div>
                    <p className="text-sm font-medium text-brand-dark">اضغطي لرفع البوستر</p>
                    <p className="text-xs">PNG أو JPG (حد أقصى 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePosterUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                <img src={posterUrl} alt="معاينة البوستر" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPosterUrl("")}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
                >
                  <XIcon size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>محاور اللقاء وأهدافه</label>
          <div className="space-y-2">
            {objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={obj}
                  onChange={(e) => updateObjective(i, e.target.value)}
                  placeholder={`المحور ${i + 1}`}
                  className={`${inputClass} flex-1`}
                />
                {objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(i)}
                    className="text-red-400 hover:text-red-600 px-2"
                  >×</button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addObjective}
              className="text-brand-orange text-sm hover:text-brand-orange-hover flex items-center gap-1 mt-1"
            >
              <PlusCircle size={14} />
              إضافة محور
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-orange/30"
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> جاري الحفظ...</>
            ) : (
              <><PlusCircle size={15} /> حفظ اللقاء</>
            )}
          </button>
          <button
            type="reset"
            className="border border-gray-200 text-gray-600 hover:text-brand-dark px-6 py-3 rounded-xl text-sm transition-all"
          >
            مسح
          </button>
        </div>
      </form>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SETTINGS FORM
// ═════════════════════════════════════════════════════════════

function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getSiteSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSavedMsg("");

    const fd = new FormData(e.currentTarget);
    const result = await updateSiteSettings({
      phone: (fd.get("phone") as string) || "",
      email: (fd.get("email") as string) || "",
      address: (fd.get("address") as string) || "",
      twitter: (fd.get("twitter") as string) || "",
      instagram: (fd.get("instagram") as string) || "",
    });

    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "حدث خطأ");
      return;
    }
    setSavedMsg("تم الحفظ بنجاح ✓ — البيانات تظهر الآن في الصفحة الرئيسية");
    setTimeout(() => setSavedMsg(""), 4000);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Loader2 size={24} className="animate-spin text-brand-orange mx-auto" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-brand-dark placeholder-gray-400 text-sm transition-all";
  const labelClass = "block text-sm font-medium text-brand-dark mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <SettingsIcon size={20} className="text-brand-orange" />
        <h2 className="text-xl font-bold text-brand-dark">بيانات التواصل</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        هذه البيانات تظهر في قسم "تواصل معنا" في الصفحة الرئيسية
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-3 mb-4">
          {savedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>
            <Phone size={14} className="inline ml-1 text-brand-orange" />
            رقم الهاتف
          </label>
          <input
            name="phone"
            defaultValue={settings?.phone ?? ""}
            placeholder="مثال: +966 50 123 4567"
            dir="ltr"
            className={`${inputClass} text-right`}
          />
        </div>

        <div>
          <label className={labelClass}>
            <Mail size={14} className="inline ml-1 text-brand-orange" />
            البريد الإلكتروني
          </label>
          <input
            name="email"
            type="email"
            defaultValue={settings?.email ?? ""}
            placeholder="info@tamkeen.org.sa"
            dir="ltr"
            className={`${inputClass} text-right`}
          />
        </div>

        <div>
          <label className={labelClass}>
            <MapPin size={14} className="inline ml-1 text-brand-orange" />
            العنوان
          </label>
          <input
            name="address"
            defaultValue={settings?.address ?? ""}
            placeholder="مثال: الرياض، حي العليا"
            className={inputClass}
          />
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">حسابات التواصل (اختياري)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>تويتر / X</label>
              <input
                name="twitter"
                defaultValue={settings?.twitter ?? ""}
                placeholder="@tamkeen"
                dir="ltr"
                className={`${inputClass} text-right`}
              />
            </div>
            <div>
              <label className={labelClass}>إنستقرام</label>
              <input
                name="instagram"
                defaultValue={settings?.instagram ?? ""}
                placeholder="@tamkeen"
                dir="ltr"
                className={`${inputClass} text-right`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-orange/30"
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save size={15} />
              حفظ البيانات
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Add Course Form ───────────────────────────────────────────────────────────
function AddCourseForm({ onSuccess }: { onSuccess: (c: Course) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadCourseImage(fd);

      if (!result.success || !result.url) {
        setError(result.error || "فشل رفع الصورة");
        return;
      }

      setImageUrl(result.url);
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() { setImageUrl(""); }

  function addObjective() { setObjectives((prev) => [...prev, ""]); }
  function updateObjective(i: number, val: string) {
    setObjectives((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  }
  function removeObjective(i: number) {
    setObjectives((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    const seatsRaw = (fd.get("seats") as string)?.trim();
    const seatsNum = seatsRaw ? parseInt(seatsRaw) : 0;

    const input = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      instructor: fd.get("instructor") as string,
      instructor_bio: (fd.get("instructor_bio") as string) || null,
      date: fd.get("date") as string,
      end_date: (fd.get("end_date") as string) || null,
      time_start: (fd.get("time_start") as string) || null,
      time_end: (fd.get("time_end") as string) || null,
      duration: (fd.get("duration") as string) || null,
      location: (fd.get("location") as string) || null,
      status: fd.get("status") as "open" | "closed",
      category: (fd.get("category") as string) || null,
      image_url: imageUrl || null,
      seats: isNaN(seatsNum) ? 0 : seatsNum,
      price: 0,
      objectives: objectives.filter((o) => o.trim() !== ""),
      require_email: fd.get("require_email") === "on",
      require_association_name: fd.get("require_association_name") === "on",
      require_license_number: fd.get("require_license_number") === "on",
    };

    startTransition(async () => {
      const result = await createCourse(input);
      if (!result.success) {
        setError(result.error ?? "حدث خطأ");
        return;
      }
      window.location.reload();
    });
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-brand-dark placeholder-gray-400 text-sm transition-all";
  const labelClass = "block text-sm font-medium text-brand-dark mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
        <PlusCircle size={20} className="text-brand-orange" />
        إضافة دورة جديدة
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>عنوان الدورة *</label>
            <input name="title" required placeholder="مثال: مهارات القيادة الفعّالة" className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>وصف الدورة</label>
            <textarea
              name="description"
              rows={3}
              placeholder="وصف مختصر عن الدورة وأهدافها..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>اسم المدرب *</label>
            <input name="instructor" required placeholder="د. محمد العلي" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>التصنيف</label>
            <input name="category" placeholder="مثال: قيادة وإدارة" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>تاريخ البداية *</label>
            <input name="date" type="date" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>تاريخ النهاية (اختياري)</label>
            <input name="end_date" type="date" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>وقت البداية (اختياري)</label>
            <input name="time_start" type="time" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>وقت النهاية (اختياري)</label>
            <input name="time_end" type="time" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>المدة</label>
            <input name="duration" placeholder="مثال: 3 أيام" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>المكان</label>
            <input name="location" placeholder="مثال: الرياض / عن بعد" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>عدد المقاعد (اختياري)</label>
            <input name="seats" type="number" min="0" placeholder="اتركيه فاضي إذا ما تبين تظهر" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>حالة التسجيل</label>
            <select name="status" className={inputClass}>
              <option value="open">مفتوح</option>
              <option value="closed">مغلق</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>صورة البوستر / الغلاف</label>
            {!imageUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 hover:border-brand-orange rounded-xl cursor-pointer transition-colors bg-gray-50/50">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 size={24} className="animate-spin text-brand-orange" />
                    <p className="text-sm">جاري الرفع...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center">
                      <Upload size={20} className="text-brand-orange" />
                    </div>
                    <p className="text-sm font-medium text-brand-dark">اضغطي لرفع البوستر</p>
                    <p className="text-xs">PNG أو JPG (حد أقصى 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={imageUrl}
                  alt="معاينة البوستر"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all opacity-90 hover:opacity-100"
                  title="حذف الصورة"
                >
                  <XIcon size={16} />
                </button>
                <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} />
                  تم الرفع
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3 pt-2 border-t border-gray-100">
          <p className="text-sm font-medium text-brand-dark">حقول إضافية في نموذج التسجيل</p>
          {[
            { name: "require_email", label: "البريد الإلكتروني" },
            { name: "require_association_name", label: "اسم الجهة / الجمعية" },
            { name: "require_license_number", label: "رقم الترخيص" },
          ].map((field) => (
            <label key={field.name} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name={field.name} className="w-4 h-4 accent-brand-orange" />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className={labelClass}>محاور الدورة</label>
          <div className="space-y-2">
            {objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={obj}
                  onChange={(e) => updateObjective(i, e.target.value)}
                  placeholder={`المحور ${i + 1}`}
                  className={`${inputClass} flex-1`}
                />
                {objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(i)}
                    className="text-red-400 hover:text-red-600 px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addObjective}
              className="text-brand-orange text-sm hover:text-brand-orange-hover flex items-center gap-1 mt-1"
            >
              <PlusCircle size={14} />
              إضافة محور
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-orange/30"
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> جاري الحفظ...</>
            ) : (
              <><PlusCircle size={15} /> حفظ الدورة</>
            )}
          </button>
          <button
            type="reset"
            className="border border-gray-200 text-gray-600 hover:text-brand-dark px-6 py-3 rounded-xl text-sm transition-all"
          >
            مسح
          </button>
        </div>
      </form>
    </div>
  );
}