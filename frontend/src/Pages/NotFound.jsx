import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiCompass, FiMapPin, FiArrowLeft, FiSearch } from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-[78vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-[#121212] transition-colors">
      <div className="max-w-2xl w-full text-center flex flex-col items-center">
        {/* Floating Animated Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-[#ff385c] text-xs sm:text-sm font-semibold mb-6 shadow-xs"
        >
          <FiCompass className="w-4 h-4 animate-spin text-[#ff385c]" style={{ animationDuration: "10s" }} />
          <span>Error 404 • Destination Not Found</span>
        </motion.div>

        {/* Big 404 Headline */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative select-none"
        >
          <h1 className="text-8xl sm:text-9xl md:text-[13rem] font-extrabold tracking-tight text-neutral-100 dark:text-neutral-800/80 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1e1e1e] shadow-xl border border-neutral-200 dark:border-neutral-700 text-[#ff385c]"
            >
              <IoFastFoodOutline className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 sm:p-5 rounded-2xl bg-[#ff385c] shadow-xl text-white"
            >
              <FiMapPin className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 sm:mt-8 max-w-md"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Lost your taste buds?
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
            The page, motel stay, or delicious recipe you&apos;re looking for might have been checked out, moved, or never existed.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
          >
            <FiHome className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/trips"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1e1e1e] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <FiSearch className="w-4 h-4" />
            <span>Explore Trips</span>
          </Link>
        </motion.div>

        {/* Quick Help Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400"
        >
          <span>Looking for something else?</span>
          <Link to="/contact" className="hover:text-[#ff385c] underline transition-colors">
            Contact Support
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-[#ff385c] underline transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-[#ff385c] underline transition-colors">
            Privacy Policy
          </Link>
        </motion.div>
      </div>
    </main>
  );
};

export default NotFound;
