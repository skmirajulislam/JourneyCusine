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
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <Footer />
      <ChatDrawerModal />
      <NotificationDrawerModal />
      <FoodiePassportModal />
    </>
  );
};

export default MainLayout;
