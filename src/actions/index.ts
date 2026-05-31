// src/actions/index.ts — كامل (دورات + لقاءات)
"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  Course,
  CourseInput,
  Registration,
  RegistrationInput,
  Meeting,
  MeetingRegistration,
  CreateMeetingInput,
  CreateMeetingRegistrationInput,
  SiteSettings,
  UpdateSiteSettingsInput,
} from "@/lib/types";

// ═════════════════════════════════════════════════════════════
// COURSES
// ═════════════════════════════════════════════════════════════

export async function getCourses(filters?: {
  status?: "open" | "closed";
  category?: string;
}): Promise<Course[]> {
  const supabase = createClient();

  let query = supabase
    .from("courses")
    .select("*")
    .order("date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Course[];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Course;
}

export async function createCourse(
  input: CourseInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("courses")
    .insert(input)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, id: data.id };
}

export async function updateCourseStatus(
  id: string,
  status: "open" | "closed"
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("courses")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/courses/${id}`);
  return { success: true };
}

export async function deleteCourse(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

// ═════════════════════════════════════════════════════════════
// COURSE REGISTRATIONS
// ═════════════════════════════════════════════════════════════

export async function registerInCourse(
  input: RegistrationInput
): Promise<{ success: boolean; message: string }> {
  // 🍯 Honeypot — لو حقل website متعبّى، اعتبره بوت
  // نرجّع success وهمي عشان البوت ما يحس أنه انكشف
  if (input.website && input.website.trim() !== "") {
    console.warn("[honeypot] blocked bot submission on course registration");
    return { success: true, message: "تم استلام طلبك" };
  }

  const supabase = createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("status, seats, title")
    .eq("id", input.course_id)
    .single();

  if (!course) return { success: false, message: "الدورة غير موجودة" };
  if (course.status === "closed")
    return { success: false, message: "التسجيل في هذه الدورة مغلق حالياً" };

  const { count } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("course_id", input.course_id)
    .neq("status", "cancelled");

  if ((count ?? 0) >= course.seats)
    return { success: false, message: "اكتملت مقاعد هذه الدورة" };

  // نشيل حقل website قبل ما نخزّن في DB (مو موجود كعمود)
  const { website, ...payload } = input;
  void website;

  const { error } = await supabase
    .from("registrations")
    .insert({ ...payload, status: "pending" });

  if (error) {
    if (error.code === "23505")
      return { success: false, message: "أنت مسجّل مسبقاً في هذه الدورة" };
    return { success: false, message: "حدث خطأ، يرجى المحاولة مجدداً" };
  }

  return {
    success: true,
    message: `تم تسجيلك في "${course.title}" بنجاح! سنتواصل معك قريباً.`,
  };
}

export async function getRegistrationsByCourse(
  courseId: string
): Promise<Registration[]> {
  if (!(await isAdmin())) return [];
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("course_id", courseId)
    .order("registered_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Registration[];
}

export async function getAllRegistrations(): Promise<Registration[]> {
  if (!(await isAdmin())) return [];
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*, courses(title, date)")
    .order("registered_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Registration[];
}

export async function updateRegistrationStatus(
  id: string,
  status: "confirmed" | "cancelled"
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("registrations")
    .update({ status })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

// ═════════════════════════════════════════════════════════════
// MEETINGS (لقاءات القيادات الدورية)
// ═════════════════════════════════════════════════════════════

export async function getMeetings(filters?: {
  status?: "open" | "closed";
}): Promise<Meeting[]> {
  const supabase = createClient();
  let query = supabase
    .from("meetings")
    .select("*")
    .order("date", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    console.error("getMeetings error:", error);
    return [];
  }
  return (data as Meeting[]) ?? [];
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Meeting;
}

export async function createMeeting(
  input: CreateMeetingInput
): Promise<{ success: boolean; data?: Meeting; error?: string; id?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("meetings")
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error("createMeeting error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data: data as Meeting, id: data.id };
}

export async function updateMeetingStatus(
  id: string,
  status: "open" | "closed",
  attendeesCount?: number
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (typeof attendeesCount === "number") {
    updates.attendees_count = attendeesCount;
  }

  const { error } = await supabase.from("meetings").update(updates).eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/meetings/${id}`);
  return { success: true };
}

export async function deleteMeeting(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function createMeetingRegistration(
  input: CreateMeetingRegistrationInput
): Promise<{ success: boolean; error?: string }> {
  // 🍯 Honeypot — لو حقل website متعبّى، اعتبره بوت
  // نرجّع success وهمي عشان البوت ما يحس أنه انكشف
  if (input.website && input.website.trim() !== "") {
    console.warn("[honeypot] blocked bot submission on meeting registration");
    return { success: true };
  }

  // نشيل حقل website قبل ما نخزّن في DB (مو موجود كعمود)
  const { website, ...payload } = input;
  void website;

  const supabase = createClient();
  const { error } = await supabase.from("meeting_registrations").insert([payload]);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "أنتِ مسجل/ة بالفعل في هذا اللقاء بنفس رقم الجوال",
      };
    }
    return { success: false, error: error.message };
  }
  revalidatePath(`/meetings/${input.meeting_id}`);
  return { success: true };
}

export async function getMeetingRegistrations(
  meetingId: string
): Promise<MeetingRegistration[]> {
  if (!(await isAdmin())) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("meeting_registrations")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("registered_at", { ascending: false });

  if (error) {
    console.error("getMeetingRegistrations error:", error);
    return [];
  }
  return (data as MeetingRegistration[]) ?? [];
}

// ═════════════════════════════════════════════════════════════
// SITE SETTINGS (بيانات التواصل)
// ═════════════════════════════════════════════════════════════

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      phone: "",
      email: "",
      address: "",
      twitter: "",
      instagram: "",
      updated_at: "",
    };
  }
  return data as SiteSettings;
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "غير مصرح" };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      phone: input.phone,
      email: input.email,
      address: input.address,
      twitter: input.twitter ?? "",
      instagram: input.instagram ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

// ═════════════════════════════════════════════════════════════
// ADMIN AUTHENTICATION & SECURE UPLOAD
// ═════════════════════════════════════════════════════════════

const SESSION_COOKIE = "tamkeen_admin_session";

function getSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = password + "tamkeen-session-secret-2026";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD;
  if (!correctPassword) {
    console.error("ADMIN_PASSWORD not set in .env.local");
    return false;
  }
  if (password !== correctPassword) return false;

  // Set secure session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return true;
}

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token === getSessionToken();
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function uploadCourseImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "غير مصرح. يجب تسجيل الدخول كأدمن أولاً." };
  }

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File)) {
    return { success: false, error: "لم يتم رفع ملف" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "حجم الصورة أكبر من 5 ميجابايت" };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "يجب أن يكون الملف صورة" };
  }

  const supabase = createAdminClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("course-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from("course-images").getPublicUrl(fileName);
  return { success: true, url: data.publicUrl };
}
