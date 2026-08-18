import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Shared/Footer";
import Navbar from "../components/Shared/Navbar";
import ChatDrawerModal from "../components/chat/ChatDrawerModal";
import NotificationDrawerModal from "../components/notifications/NotificationDrawerModal";
import FoodiePassportModal from "../components/loyalty/FoodiePassportModal";

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-[#222222] dark:text-neutral-200 transition-colors w-full max-w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col w-full max-w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatDrawerModal />
      <NotificationDrawerModal />
      <FoodiePassportModal />
    </div>
  );
};

export default MainLayout;
