import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  UserCheck,
  Home,
  CreditCard,
  HeartHandshake,
  AlertTriangle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const termsSections = [
  {
    icon: ShieldCheck,
    title: "1. Acceptance of Terms",
    content: `By accessing or using the Journey Cuisine platform, websites, and associated services (collectively, the "Platform"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use or access the Platform. We reserve the right to update these terms at any time with prior notice on this page.`,
  },
  {
    icon: Lock,
    title: "2. Account Registration & Single-Session Security",
    content: `To ensure maximum security for your account, bookings, and financial data:
• Only one active session per account is permitted at any given moment across all devices.
• Logging in from a new browser or device will automatically and immediately invalidate previous sessions.
• Authenticated sessions are securely maintained for exactly 7 days (1 week). If you revisit within 7 days, you will remain logged in. After 7 days of inactivity or expiration, the system automatically logs you out.
• You are responsible for safeguarding your password and account credentials.`,
  },
  {
    icon: UserCheck,
    title: "3. Guest Guidelines & Code of Conduct",
    content: `As a guest on Journey Cuisine, you agree to:
• Provide accurate, authentic personal details matching your government-issued ID.
• Treat host homes, motels, and culinary spaces with dignity, care, and respect.
• Follow house rules regarding occupancy limits, check-in/check-out times, pets, smoking, and quiet hours.
• Promptly report any accidental damages or safety hazards to the host and Journey Cuisine support.`,
  },
  {
    icon: Home,
    title: "4. Host Obligations & Listing Integrity",
    content: `Hosts offering properties, motels, or dining stays must adhere to strict quality standards:
• Accurate Representation: All uploaded photos, amenities, floor plans, and descriptions must truthfully reflect the actual property condition.
• Transparent Pricing: Base prices, author earnings, and estimated taxes (14% baseline) must be clearly stated with no surprise hidden fees.
• Cleanliness & Safety: Accommodations must be sanitary, equipped with functional basic safety utilities (smoke alarms, secure locks, first aid), and legally compliant with local zoning regulations.`,
  },
  {
    icon: CreditCard,
    title: "5. Booking, Payments & Razorpay Processing",
    content: `All monetary transactions on Journey Cuisine are processed through certified PCI-DSS compliant payment gateways (Razorpay):
• Instant Booking & Confirmation: Reservations are secured upon successful payment authorization.
• Currencies & Conversion: Prices are shown in local currencies with live exchange conversion supported across USD, INR, EUR, GBP, JPY, and AUD.
• Cancellations & Refunds: Refunds follow the cancellation timeframe established by the host at the time of reservation.`,
  },
  {
    icon: HeartHandshake,
    title: "6. Community & Anti-Discrimination Policy",
    content: `Journey Cuisine is built on global inclusivity and mutual respect:
• Zero tolerance for discrimination based on race, ethnicity, nationality, religion, sexual orientation, gender identity, disability, or age.
• Any host or guest engaging in discriminatory behavior, hate speech, harassment, or unlawful acts will face immediate and permanent platform termination.`,
  },
  {
    icon: AlertTriangle,
    title: "7. Prohibited Activities & Account Termination",
    content: `Users are strictly prohibited from:
• Submitting false, deceptive, or misleading reviews and ratings.
• Circumventing platform payments or requesting off-platform cash transactions.
• Utilizing automated bots, scrapers, or unauthorized APIs to extract platform data.
• Violating intellectual property rights, copyrights, or privacy of fellow community members.`,
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-[#222222] dark:text-[#e5e7eb] transition-colors">
      {/* Hero Header */}
      <section className="bg-neutral-50 dark:bg-[#181818] border-b border-neutral-200 dark:border-neutral-800 py-16 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="journey" className="mb-4 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Legal &amp; Community Standards
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] dark:text-white tracking-tight"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            Welcome to Journey Cuisine. Please read these terms carefully before booking a stay or listing your home. They govern your access to our global hospitality community.
          </motion.p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
            Last updated: August {new Date().getFullYear()} • Effective immediately
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-12 space-y-10">
        {termsSections.map((sec, index) => {
          const Icon = sec.icon;
          return (
            <motion.section
              key={sec.title}
              custom={index}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#ff385c] flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white">
                  {sec.title}
                </h2>
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line pl-0 sm:pl-[54px]">
                {sec.content}
              </div>
            </motion.section>
          );
        })}

        <Separator className="my-10" />

        {/* Contact Support Card */}
        <section className="p-8 rounded-2xl bg-neutral-50 dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-white">
              Questions regarding our Terms?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Our safety and legal team is here to assist you 24/7.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <span>Contact Support</span>
            <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Terms;
