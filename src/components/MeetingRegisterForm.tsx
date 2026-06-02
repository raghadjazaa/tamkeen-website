// src/components/MeetingRegisterForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMeetingRegistration } from "@/actions";
import { User, Phone, Building2, CheckCircle, Loader2, UserCheck, Users } from "lucide-react";

interface MeetingRegisterFormProps {
  meetingId: string;
  meetingTitle: string;
}

export function MeetingRegisterForm({ meetingId, meetingTitle }: MeetingRegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registrationType, setRegistrationType] = useState<"association" | "volunteer" | "">("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const fullName = (fd.get("full_name") as string).trim();
    const phone = (fd.get("phone") as string).trim();
    const associationName = (fd.get("association_name") as string)?.trim() || null;
    const honeypot = (fd.get("website") as string)?.trim() || "";

    if (!fullName || !phone || !registrationType) {
      setError("جميع الحقول الأساسية مطلوبة");
      return;
    }

    // Validate quadrinomial name (at least 4 parts)
    const nameParts = fullName.split(/\s+/).filter(p => p.length > 0);
    if (nameParts.length < 3) {
      setError("الرجاء كتابة الاسم الثلاثي كاملاً (3 أسماء)");
      return;
    }

    if (registrationType === "association" && !associationName) {
      setError("الرجاء كتابة اسم الجمعية");
      return;
    }

    // Validate phone (Saudi format)
    const phoneRegex = /^(05|5|9665|\+9665)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setError("رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)");
      return;
    }

    startTransition(async () => {
      const result = await createMeetingRegistration({
        meeting_id: meetingId,
        full_name: fullName,
        registration_type: registrationType,
        association_name: registrationType === "association" ? associationName : null,
        phone,
        website: honeypot, // honeypot — must be empty
      });

      if (!result.success) {
        setError(result.error || "حدث خطأ في التسجيل");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.refresh(), 100);
    });
  }

  // Success state
  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark mb-3">تم التسجيل بنجاح</h3>
        <p className="text-gray-600 mb-2">
          شكراً لك على تسجيلك في:
        </p>
        <p className="text-brand-orange font-semibold mb-4">{meetingTitle}</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-brand-dark placeholder-gray-400 text-sm transition-all";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <h3 className="text-xl font-bold text-brand-dark mb-1">نموذج التسجيل</h3>
      <p className="text-gray-500 text-sm mb-6">
        املئي البيانات التالية لتأكيد حضورك
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-start gap-2">
          <span className="font-bold">!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/*  Honeypot — مخفي عن المستخدم، يكشف البوتات */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: 0,
            height: 0,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <label htmlFor="website-field">Website (do not fill)</label>
          <input
            id="website-field"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        
        {/*الاسم الثلاثي*\}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
           الاسم الثلاثي <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="full_name"
              type="text"
              required
              placeholder="مثال: محمد عبدالله الشمري"
              className={`${inputClass} pr-10`}
            />
          </div>
        </div>

        {/* نوع التسجيل */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            نوع التسجيل <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRegistrationType("association")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                registrationType === "association"
                  ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Building2 size={16} />
              من جمعية
            </button>
            <button
              type="button"
              onClick={() => setRegistrationType("volunteer")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                registrationType === "volunteer"
                  ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <UserCheck size={16} />
              متطوع/ـة
            </button>
          </div>
        </div>

        {/* اسم الجمعية (شرطي) */}
        {registrationType === "association" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              اسم الجمعية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                name="association_name"
                type="text"
                required
                placeholder="مثال: جمعية تمكين القيادات الأهلية"
                className={`${inputClass} pr-10`}
              />
            </div>
          </div>
        )}

        {/* رقم الجوال */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            رقم الجوال <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="phone"
              type="tel"
              required
              placeholder="05XXXXXXXX"
              dir="ltr"
              className={`${inputClass} pr-10 text-right`}
            />
          </div>
        </div>

        {/* زر التأكيد */}
        <button
          type="submit"
          disabled={isPending || !registrationType}
          className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-0.5 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري التسجيل...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              تأكيد التسجيل
            </>
          )}
        </button>
      </form>
    </div>
  );
}
