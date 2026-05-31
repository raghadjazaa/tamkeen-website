// src/lib/types.ts — كامل (دورات + لقاءات)

// ═════════════════════════════════════════════════════════════
// COURSES
// ═════════════════════════════════════════════════════════════

export interface Course {
  id: string;
  title: string;
  description: string | null;
  objectives: string[] | null;
  instructor: string;
  instructor_bio: string | null;
  date: string;
  end_date: string | null;
  duration: string | null;
  location: string | null;
  status: "open" | "closed";
  category: string | null;
  image_url: string | null;
  seats: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface CourseInput {
  title: string;
  description: string | null;
  objectives?: string[];
  instructor: string;
  instructor_bio: string | null;
  date: string;
  end_date: string | null;
  duration: string | null;
  location: string | null;
  status: "open" | "closed";
  category: string | null;
  image_url: string | null;
  seats: number;
  price: number;
}

export interface Registration {
  id: string;
  course_id: string;
  full_name: string;
  phone: string;
  email: string;
  status: "pending" | "confirmed" | "cancelled";
  registered_at: string;
}

export interface RegistrationInput {
  course_id: string;
  full_name: string;
  phone: string;
  email: string;
  website?: string; // honeypot — must be empty
}

// ═════════════════════════════════════════════════════════════
// MEETINGS (لقاءات القيادات الدورية)
// ═════════════════════════════════════════════════════════════

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  objectives: string[] | null;
  poster_url: string | null;
  date: string;
  time: string;
  location: string | null;
  status: "open" | "closed";
  attendees_count: number;
  created_at: string;
  updated_at: string;
}

export interface MeetingRegistration {
  id: string;
  meeting_id: string;
  full_name: string;
  registration_type: "association" | "volunteer";
  association_name: string | null;
  phone: string;
  registered_at: string;
}

export interface CreateMeetingInput {
  title: string;
  description: string | null;
  objectives?: string[];
  poster_url: string | null;
  date: string;
  time: string;
  location: string | null;
  status: "open" | "closed";
}

export interface CreateMeetingRegistrationInput {
  meeting_id: string;
  full_name: string;
  registration_type: "association" | "volunteer";
  association_name: string | null;
  phone: string;
  website?: string; // honeypot — must be empty
}

// ═════════════════════════════════════════════════════════════
// SITE SETTINGS (إعدادات الموقع — بيانات التواصل)
// ═════════════════════════════════════════════════════════════

export interface SiteSettings {
  id: number;
  phone: string;
  email: string;
  address: string;
  twitter: string;
  instagram: string;
  updated_at: string;
}

export interface UpdateSiteSettingsInput {
  phone: string;
  email: string;
  address: string;
  twitter?: string;
  instagram?: string;
}
