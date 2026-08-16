import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthenticationPopUp from "../popUp/authentication/AuthenticationPopUp";
import MiniNavbar from "./DashboardMenu";
import { useAuth } from "../../hooks/useAuth";
import motelLogo from "../../assets/Travel_Logo.png";
import searchIcon from "../../assets/basicIcon/search.svg";
import house from "../../assets/basicIcon/houseWhite.png";

import { useTheme } from "../../context/ThemeContext.jsx";
import { useChat } from "../../context/ChatContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useLoyalty } from "../../context/LoyaltyContext.jsx";
import { BsSun, BsMoonStars } from "react-icons/bs";
import { FiX, FiSliders, FiMessageSquare, FiBell, FiAward } from "react-icons/fi";
import { Menu, User } from "lucide-react";
import FilterPopUp from "../popUp/FilterPopUp/FilterPopUp";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { setIsChatOpen, unreadTotal } = useChat();
  const { unreadCount: notificationUnreadCount, openDrawer: openNotificationDrawer } = useNotifications();
  const { profile: loyaltyProfile, openPassportModal } = useLoyalty();
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const pathName = location.pathname;
  const inUserProfile = pathName?.includes("/users/show/");
  const inUserDashboard = pathName?.includes("/users/dashboard/");
  const inHostHomesLandingPage = pathName?.includes("/host/homes");
  const inListingDetailsPage = pathName?.includes("/listing") || pathName?.includes("/rooms/");
  const inBookingPage = pathName?.includes("/book/stays");
  const inTripsPage = pathName?.includes("/trips");
  const isSmallDevice = window.innerWidth < 768;

  const [popup, setPopup] = useState(false);

  // Active filters count
  const activeFilters = {
    price: searchParams.get("price") || "all",
    rating: searchParams.get("rating") || "all",
    amenities: searchParams.get("amenities") ? searchParams.get("amenities").split(",").filter(Boolean) : [],
  };

  const activeFilterCount =
    (activeFilters.price !== "all" ? 1 : 0) +
    (activeFilters.rating !== "all" ? 1 : 0) +
    activeFilters.amenities.length;

  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    if (newFilters.price && newFilters.price !== "all") {
      params.set("price", newFilters.price);
    } else {
      params.delete("price");
    }

    if (newFilters.rating && newFilters.rating !== "all") {
      params.set("rating", newFilters.rating);
    } else {
      params.delete("rating");
    }

    if (newFilters.amenities && newFilters.amenities.length > 0) {
      params.set("amenities", newFilters.amenities.join(","));
    } else {
      params.delete("amenities");
    }

    navigate(`/?${params.toString()}`);
  };

  // Sync search input with URL params
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }
    navigate(`/?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    navigate(`/?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleOpenAuth = () => {
      setPopup(true);
    };
    const handleForceLogout = () => {
      logout();
      setPopup(true);
    };

    window.addEventListener("open-auth-popup", handleOpenAuth);
    window.addEventListener("force-logout", handleForceLogout);
    return () => {
      window.removeEventListener("open-auth-popup", handleOpenAuth);
      window.removeEventListener("force-logout", handleForceLogout);
    };
  }, [logout]);

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`border-b-[1.4px] border-[#f1f1f1] dark:border-neutral-800 sticky top-0 z-[99] bg-white dark:bg-[#121212] transition-colors ${inBookingPage && "hidden md:block"
        }`}
    >
      <div
        className={`xl:px-10 py-3.5 xl:mx-auto px-5 relative flex flex-row justify-between items-center ${
          inUserProfile ||
          inUserDashboard ||
          inHostHomesLandingPage ||
          inListingDetailsPage
            ? "max-w-screen-xl"
            : "max-w-screen-2xl"
        } ${inHostHomesLandingPage ? "xl:px-20" : ""}`}
      >
        {/* logo */}
        <div className="shrink-0">
          <span className="flex flex-row gap-2 items-center">
            <img
              src={motelLogo}
              alt="Logo"
              className="w-9 sm:w-10 cursor-pointer"
              onClick={() => {
                JSON.stringify(localStorage.setItem("category", "House"));
                navigate("/");
              }}
            />
            {inHostHomesLandingPage || isSmallDevice ? null : (
              <p className="text-xl text-[#ff385c] font-bold">Journey Cuisine</p>
            )}
          </span>
        </div>
        {/* if not in the booking page then show the options */}
        {inBookingPage ? (
          <div> </div>
        ) : (
          <>
            {/* searchbar (desktop) */}
            {inUserProfile || inUserDashboard || inHostHomesLandingPage || inTripsPage ? (
              <div>{inUserDashboard && <MiniNavbar />} </div>
            ) : (
              <div className="mx-auto lg:block hidden">
                <div className="flex items-center gap-2">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="border-[1.5px] border-[#dddddd] dark:border-[#444444] rounded-full px-3 py-1.5 flex items-center shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#222222]"
                  >
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="focus:outline-none border-0 focus:ring-0 shadow-none pl-3 pr-2 text-sm text-[#222222] dark:text-white bg-transparent w-[200px] xl:w-[260px]"
                      placeholder="Search by city, country, motel..."
                    />
                    <AnimatePresence>
                      {searchValue && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          type="button"
                          onClick={handleClearSearch}
                          className="text-[#888888] hover:text-[#222222] dark:hover:text-white p-1 mr-1 cursor-pointer"
                          title="Clear search"
                        >
                          <FiX size={15} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <Button
                      type="submit"
                      variant="journey"
                      size="icon"
                      className="rounded-full w-8 h-8"
                      title="Search"
                    >
                      <img src={searchIcon} alt="Search motel" className="w-3.5 h-3.5" />
                    </Button>
                  </form>

                  {/* Filters Button */}
                  <Button
                    type="button"
                    onClick={() => setShowFilterPopup(true)}
                    variant="outline"
                    size="sm"
                    className={`rounded-full gap-2 text-xs font-bold ${
                      activeFilterCount > 0
                        ? "border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] ring-1 ring-[#ff385c] hover:bg-[#ff385c]/15"
                        : ""
                    }`}
                  >
                    <FiSliders size={14} className={activeFilterCount > 0 ? "text-[#ff385c]" : "text-[#717171] dark:text-[#a0a0a0]"} />
                    <span>Filters</span>
                    <AnimatePresence>
                      {activeFilterCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-5 h-5 rounded-full bg-[#ff385c] text-white text-[10px] font-extrabold flex items-center justify-center"
                        >
                          {activeFilterCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        {/* if in the booking page don't show any option */}
        {inBookingPage ? (
          <div> </div>
        ) : (
          <>
            {/* if user is in the hosting house landing page we want to show different button */}
            {inHostHomesLandingPage ? (
              <div className=" flex flex-row items-center justify-between gap-4">
                <p className=" text-[#222222] text-sm font-medium hidden sm:block">
                  Ready to Motel it?
                </p>
                {user ? (
                  <Link
                    to="/become-a-host"
                    className=" flex flex-row justify-between items-center gap-2 bg-[#ff385c] hover:bg-[#d90b63] transition-all duration-300 px-3 py-2 rounded-lg"
                  >
                    <img src={house} alt="House setup" className=" w-4 md:w-5" />
                    <p className=" font-semibold text-sm md:text-base text-white">
                      Motel setup
                    </p>
                  </Link>
                ) : (
                  <Button
                    onClick={() => setPopup(true)}
                    variant="journey"
                    className="gap-2"
                  >
                    <img src={house} alt="House setup" className=" w-4 md:w-5" />
                    <span className="font-semibold text-sm md:text-base">
                      Motel setup
                    </span>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* user bar */}
                <div className="flex justify-end items-center gap-2.5 shrink-0 ml-auto lg:ml-0">
                  {user && !inUserDashboard && (
                    <Link
                      to="/host/homes"
                      className="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all rounded-full px-4 py-2 cursor-pointer mr-1 md:block hidden text-sm font-semibold text-[#111827] dark:text-white"
                    >
                      Motel your home
                    </Link>
                  )}

                  {/* Foodie Passport pill button */}
                  {user && (
                    <button
                      type="button"
                      onClick={openPassportModal}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition shadow-2xs text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer"
                      title="Foodie Passport & Rewards"
                    >
                      <span>🏆</span>
                      <span>{loyaltyProfile?.points ?? 200} pts</span>
                    </button>
                  )}

                  {/* Notifications bell button */}
                  {user && (
                    <Button
                      type="button"
                      onClick={openNotificationDrawer}
                      variant="outline"
                      size="icon"
                      className="rounded-full shrink-0 relative"
                      title="Notifications & Alerts"
                    >
                      <FiBell size={15} />
                      {notificationUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff385c] text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                          {notificationUnreadCount}
                        </span>
                      )}
                    </Button>
                  )}

                  {/* Messages / Inquiries button */}
                  {user && (
                    <Button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      variant="outline"
                      size="icon"
                      className="rounded-full shrink-0 relative"
                      title="Host-Guest Messages"
                    >
                      <FiMessageSquare size={15} />
                      {unreadTotal > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff385c] text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                          {unreadTotal}
                        </span>
                      )}
                    </Button>
                  )}

                  {/* Theme toggle button */}
                  <Button
                    type="button"
                    onClick={toggleTheme}
                    variant="outline"
                    size="icon"
                    className="rounded-full shrink-0"
                    title={theme === "light" ? "Switch to Dark mode" : "Switch to Light mode"}
                  >
                    {theme === "light" ? <BsMoonStars size={16} /> : <BsSun size={16} className="text-yellow-400" />}
                  </Button>

                  {/* User menu dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="border-[1px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#222222] rounded-full py-1 px-2.5 flex flex-row gap-2.5 items-center hover:shadow-md transition-all cursor-pointer relative shrink-0 outline-none">
                        <Menu className="w-3.5 h-3.5 text-[#222222] dark:text-white" />
                        {user ? (
                          user?.profileImg ? (
                            <img
                              src={user.profileImg}
                              alt={user?.name?.firstName || "User profile"}
                              className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                            />
                          ) : (
                            <span className="bg-[#222222] dark:bg-[#444444] text-[#efefef] w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center">
                              {user.name?.firstName?.slice(0, 1) || "U"}
                            </span>
                          )
                        ) : (
                          <User className="w-7 h-7 text-[#717171] dark:text-[#a0a0a0] p-0.5" />
                        )}
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-[230px]">
                      {!user ? (
                        <>
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() => setPopup(true)}
                          >
                            Sign up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPopup(true)}>
                            Login
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setPopup(true)}>
                            Motel your home
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/contact")}>
                            Contact the team
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          {user?.role === "host" || user?.role === "admin" ? (
                            !inUserDashboard ? (
                              <DropdownMenuItem
                                className="font-medium"
                                onClick={() => {
                                  JSON.stringify(sessionStorage.setItem("activePage", 1));
                                  navigate(`/users/dashboard/${user._id}/overview=true`);
                                }}
                              >
                                Dashboard
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="font-medium"
                                onClick={() => navigate("/")}
                              >
                                Home
                              </DropdownMenuItem>
                            )
                          ) : null}
                          <DropdownMenuItem
                            className="font-medium flex items-center justify-between"
                            onClick={openPassportModal}
                          >
                            <span>🏆 Foodie Passport</span>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              {loyaltyProfile?.points ?? 200} pts
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium flex items-center justify-between"
                            onClick={openNotificationDrawer}
                          >
                            <span>Notifications</span>
                            {notificationUnreadCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#ff385c] text-white text-[10px] font-bold">
                                {notificationUnreadCount}
                              </span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium flex items-center justify-between"
                            onClick={() => setIsChatOpen(true)}
                          >
                            <span>Messages &amp; Inquiries</span>
                            {unreadTotal > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#ff385c] text-white text-[10px] font-bold">
                                {unreadTotal}
                              </span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() => navigate("/trips")}
                          >
                            Trips
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() => navigate("/wishlists")}
                          >
                            Wishlists
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/host/homes")}>
                            Motel your home
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/users/show/${user._id}`)}>
                            Account
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/contact")}>
                            Contact the team
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleLogout}>
                            Log out
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile search bar and filter button row */}
      {!inUserProfile &&
        !inUserDashboard &&
        !inHostHomesLandingPage &&
        !inBookingPage &&
        !inTripsPage && (
          <div className="lg:hidden px-5 pb-3.5 pt-0.5 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-2">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 border-[1.5px] border-[#dddddd] dark:border-[#444444] rounded-full px-3.5 py-2 flex items-center shadow-sm bg-white dark:bg-[#222222]"
              >
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="focus:outline-none pl-1 pr-1 text-xs sm:text-sm text-[#222222] dark:text-white bg-transparent w-full"
                  placeholder="Search city, country, motel..."
                />
                <AnimatePresence>
                  {searchValue && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      onClick={handleClearSearch}
                      className="text-[#888888] hover:text-[#222222] dark:hover:text-white p-1 cursor-pointer"
                      title="Clear search"
                    >
                      <FiX size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
                <Button
                  type="submit"
                  variant="journey"
                  size="icon"
                  className="rounded-full w-7 h-7 ml-1"
                  title="Search"
                >
                  <img src={searchIcon} alt="Search" className="w-3 h-3" />
                </Button>
              </form>

              {/* Mobile Filters Button */}
              <Button
                type="button"
                onClick={() => setShowFilterPopup(true)}
                variant="outline"
                size="sm"
                className={`rounded-full gap-1.5 text-xs font-bold shrink-0 ${
                  activeFilterCount > 0
                    ? "border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] ring-1 ring-[#ff385c]"
                    : ""
                }`}
              >
                <FiSliders
                  size={13}
                  className={activeFilterCount > 0 ? "text-[#ff385c]" : "text-[#717171] dark:text-[#a0a0a0]"}
                />
                <span>Filters</span>
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-4 h-4 rounded-full bg-[#ff385c] text-white text-[9px] font-extrabold flex items-center justify-center"
                    >
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        )}

      <AuthenticationPopUp popup={popup} setPopup={setPopup} />
      <FilterPopUp
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
      />
    </motion.nav>
  );
};

export default Navbar;
