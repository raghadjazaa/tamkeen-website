// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",  // Allow all HTTPS images (narrow this down in production)
      },
    ],
  },
};

module.exports = nextConfig;

/* ─────────────────────────────────────────────────────────────────────────────
   SETUP COMMANDS — run these in your project root:
   ─────────────────────────────────────────────────────────────────────────────

   # 1. Create the Next.js project
   npx create-next-app@latest tamkeen --typescript --tailwind --eslint --app --src-dir
   cd tamkeen

   # 2. Install dependencies
   npm install @supabase/supabase-js @supabase/ssr
   npm install lucide-react
   npm install date-fns

   # 3. Copy all provided files into the correct locations
   # 4. Add your .env.local values
   # 5. Run the SQL schema in Supabase Dashboard → SQL Editor
   # 6. Start the dev server
   npm run dev

   ─────────────────────────────────────────────────────────────────────────────
   PROJECT STRUCTURE:
   ─────────────────────────────────────────────────────────────────────────────

   tamkeen/
   ├── .env.local                        ← your Supabase keys
   ├── tailwind.config.ts                ← brand colors
   ├── next.config.js
   ├── supabase_schema.sql               ← run in Supabase SQL Editor
   └── src/
       ├── app/
       │   ├── globals.css
       │   ├── layout.tsx                ← Tajawal font + RTL
       │   ├── page.tsx                  ← Landing page
       │   ├── courses/
       │   │   └── [id]/
       │   │       └── page.tsx          ← Course detail + Register form + QR
       │   └── admin/
       │       └── page.tsx              ← Admin dashboard
       ├── components/
       │   ├── Header.tsx
       │   ├── CourseCard.tsx
       │   ├── RegisterForm.tsx           ← Client component
       │   └── QRCode.tsx                ← Client component (CDN-based)
       ├── lib/
       │   ├── types.ts
       │   └── supabase/
       │       ├── client.ts             ← browser client
       │       └── server.ts             ← server + admin client
       └── actions/
           └── index.ts                  ← all server actions
*/