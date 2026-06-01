"use client";

import { useState, useTransition } from "react";
import { registerInCourse } from "../actions";
import { CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";

interface RegisterFormProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  requireEmail?: boolean;
  requireAssociationName?: boolean;
  requireLicenseNumber?: boolean;
}

export function RegisterForm({
  courseId,
  courseName,
  isOpen,
  requireEmail = false,
  requireAssociationName = false,
  requireLicenseNumber = false,
}: RegisterFormProps) {
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    association_name: "",
    license_number: "",
    website: "", // 🍯 honeypot
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.phone) return;
    if (requireEmail && !form.email) return;
    if (requireAssociationName && !form.association_name) return;
    if (requireLicenseNumber && !form.license_number) return;

    startTransition(async () => {
      const result = await registerInCourse({
        course_id: courseId,
        full_name: form.full_name,
        phone: form.phone,
        email: requireEmail ? form.email : "",
        association_name: requireAssociationName ? form.association_name : null,
        license_number: requireLicenseNumber ? form.license_number : null,
        website: form.website,
      });
      setMessage(result.message);
      setState(result.success ? "success" : "error");
      if (result.success)
        setForm({
          full_name: "",
          phone: "",
          email: "",
          association_name: "",
          license_number: "",
          website: "",
        });
    });
  }

  if (!isOpen) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={22} className="text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">التسجيل في هذه الدورة مغلق حالياً</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-brand-dark placeholder-gray-300 text-sm transition-all";
  const labelClass = "block text-sm font-medium text-brand-dark mb-1.5";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-brand-dark mb-1">التسجيل في الدورة</h2>
      <p className="text-sm text-gray-400 mb-6">{courseName}</p>

      {state === "success" && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
          <CheckCircle size={18} className="text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-emerald-800 text-sm leading-relaxed">{message}</p>
        </div>
      )}
      {state === "error" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 🍯 Honeypot */}
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
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClass}>
            الاسم الكامل <span className="text-red-400">*</span>
          </label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            placeholder="أدخل اسمك الثلاثي"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            رقم الجوال <span className="text-red-400">*</span>
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="05xxxxxxxx"
            className={inputClass}
          />
        </div>

        {requireEmail && (
          <div>
            <label className={labelClass}>
              البريد الإلكتروني <span className="text-red-400">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className={inputClass}
            />
          </div>
        )}

        {requireAssociationName && (
          <div>
            <label className={labelClass}>
              اسم الجمعية <span className="text-red-400">*</span>
            </label>
            <input
              name="association_name"
              value={form.association_name}
              onChange={handleChange}
              required
              placeholder="اسم الجمعية اللي تنتمين لها"
              className={inputClass}
            />
          </div>
        )}

        {requireLicenseNumber && (
          <div>
            <label className={labelClass}>
              رقم الترخيص <span className="text-red-400">*</span>
            </label>
            <input
              name="license_number"
              value={form.license_number}
              onChange={handleChange}
              required
              placeholder="رقم الترخيص"
              className={inputClass}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || state === "success"}
          className="w-full flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm mt-2"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري التسجيل...
            </>
          ) : state === "success" ? (
            <>
              <CheckCircle size={16} />
              تم التسجيل بنجاح
            </>
          ) : (
            <>
              <Send size={16} />
              تأكيد التسجيل
            </>
          )}
        </button>
      </form>
    </div>
  );
}