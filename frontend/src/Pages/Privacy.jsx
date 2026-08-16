import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Lock,
  Eye,
  Server,
  KeyRound,
  FileCheck,
  UserX,
  CreditCard,
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

const privacySections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: `We collect information necessary to provide you with seamless travel, hosting, and culinary experiences:
• Personal Identity: Name, email address, date of birth, and optional profile photos.
• Property & Hosting Details: Titles, descriptions, property coordinates, amenities, and uploaded imagery.
• Booking & Trip Records: Check-in/check-out dates, guest counts, reservation receipts, and wishlist items.
• Technical & Session Metadata: IP addresses, browser types, device identifiers, and active JWT session tokens.`,
  },
  {
    icon: KeyRound,
    title: "2. How We Secure Your Data & Account",
    content: `Journey Cuisine employs multi-layered, state-of-the-art security mechanisms:
• Single Concurrent Session Enforcement: Each user account is strictly limited to one active session at a time. When you log in from a new device or browser, previous access tokens are automatically invalidated in the database, preventing concurrent unauthorized hijacking.
• 7-Day Persistent Session Lifetime: User sessions remain active for exactly 1 week (7 days) for convenience. Once expired, automatic logout is enforced.
• Bcrypt Salted Password Hashing: Passwords are encrypted using salted bcrypt (10 rounds) and are mathematically irreversible. Plaintext passwords are never stored or logged.
• Token Cryptography: Authentication utilizes signed JSON Web Tokens (JWT) verified against database records on every private API endpoint.
• SSL/TLS Encryption: All network communication between your client and our API servers is encrypted end-to-end.`,
  },
  {
    icon: CreditCard,
    title: "3. Payment Security & PCI-DSS Compliance",
    content: `Financial privacy is paramount:
• All payments are processed through Razorpay, a certified PCI-DSS Level 1 compliant gateway.
• Journey Cuisine servers never see, handle, or store your credit card numbers, debit cards, UPI PINs, or CVV codes.
• Transaction tokens and digital receipts are stored securely for booking confirmation and dispute resolution.`,
  },
  {
    icon: Server,
    title: "4. How We Use Your Information",
    content: `Your data is used exclusively to:
• Facilitate reservations, host confirmations, and stay coordination.
• Verify user identity and combat fraud, impersonation, or platform abuse.
• Display accurate localized currency conversions (USD, INR, EUR, GBP, JPY, AUD).
• Deliver essential account notifications and customer support responses.
• We do NOT sell, rent, or monetize your personal information to third-party data brokers.`,
  },
  {
    icon: FileCheck,
    title: "5. Data Storage & Local Storage Usage",
    content: `• We utilize browser LocalStorage solely for storing your temporary JWT authentication tokens and currency preference.
• No sensitive personal data is stored unencrypted in browser storage.
• You can clear your LocalStorage at any time by logging out or through your browser settings.`,
  },
  {
    icon: UserX,
    title: "6. Your Privacy Rights & Data Control",
    content: `You maintain complete control over your personal data:
• Access & Update: You can review and update your name, profile photo, and bio directly in your Account Settings.
• Wishlist & Reservation Management: You can modify or remove saved stays and manage your trip bookings at any time.
• Account Deletion: You have the right to request permanent deletion of your account and associated personal data by contacting our support team.`,
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-[#222222] dark:text-[#e5e7eb] transition-colors">
      {/* Hero Header */}
      <section className="bg-neutral-50 dark:bg-[#181818] border-b border-neutral-200 dark:border-neutral-800 py-16 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="journey" className="mb-4 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Privacy &amp; Security Shield
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] dark:text-white tracking-tight"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            At Journey Cuisine, your privacy and account security are foundational. Learn how we protect your personal information, enforce single-session security, and keep your transactions safe.
          </motion.p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
            Last updated: August {new Date().getFullYear()} • Encrypted &amp; Protected
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-12 space-y-10">
        {privacySections.map((sec, index) => {
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

        {/* Security Assurance Card */}
        <section className="p-8 rounded-2xl bg-neutral-50 dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <Lock size={18} className="text-[#ff385c]" />
              Your Security is Guaranteed
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Have concerns or questions about your personal data? Reach out to our privacy officer anytime.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <span>Contact Privacy Team</span>
            <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
