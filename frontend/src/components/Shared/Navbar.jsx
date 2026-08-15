import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthenticationPopUp from "../popUp/authentication/AuthenticationPopUp";
import MiniNavbar from "./DashboardMenu";
import { getUser, userLogOut } from "../../redux/actions/userActions";
import hamburgerMenu from "../../assets/basicIcon/hamburgerMenu.svg";
import motelLogo from "../../assets/Travel_Logo.png";
import userProfile from "../../assets/basicIcon/user-profile.png";
import searchIcon from "../../assets/basicIcon/search.svg";
import house from "../../assets/basicIcon/houseWhite.png";

import { useTheme } from "../../context/ThemeContext.jsx";
import { BsSun, BsMoonStars } from "react-icons/bs";
import { FiX, FiSliders } from "react-icons/fi";
import FilterPopUp from "../popUp/FilterPopUp/FilterPopUp";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const user = useSelector((state) => state.user.userDetails);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const pathName = location.pathname;
  const inUserProfile = pathName?.includes("/users/show/");
  const inUserDashboard = pathName?.includes("/users/dashboard/");
  const inHostHomesLandingPage = pathName?.includes("/host/homes");
  const inListingDetailsPage = pathName?.includes("/listing");
  const inBookingPage = pathName?.includes("/book/stays");
  const isSmallDevice = window.innerWidth < 768;

  const [popup, setPopup] = useState(false);

  const dispatch = useDispatch();

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

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchValue.trim();
    const newParams = new URLSearchParams(searchParams);
    if (trimmed) {
      newParams.set("search", trimmed);
    } else {
      newParams.delete("search");
    }
    navigate(`/?${newParams.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    navigate(`/?${newParams.toString()}`);
  };

  const handleLogout = () => {
    dispatch(userLogOut());
  };

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    const handleOpenAuth = () => {
      setPopup(true);
    };
    window.addEventListener("open-auth-popup", handleOpenAuth);
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mouseup", handleOutsideClick);
    return () => {
      window.removeEventListener("open-auth-popup", handleOpenAuth);
      document.removeEventListener("mouseup", handleOutsideClick);
    };
  }, []);

  return (
    <nav
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
                // setting cat to house for listing data fetching
                JSON.stringify(localStorage.setItem("category", "House"));
                // manually navigating bcz of avoiding asyncrounous nature and on click show default listing data
                navigate("/");
              }}
            />
            {/* if user is in hosting homes page we want only logo */}
            {inHostHomesLandingPage || isSmallDevice ? null : (
              <p className="text-xl text-[#ff385c] font-bold">Journey Cuisine</p>
            )}
          </span>
        </div>
        {/* if not in the booking page then show the options 👇 */}
        {inBookingPage ? (
          <div> </div>
        ) : (
          <>
            {/* searchbar (desktop) */}
            {inUserProfile || inUserDashboard || inHostHomesLandingPage ? (
              // if user is in dahsboard
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
                    {searchValue && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-[#888888] hover:text-[#222222] dark:hover:text-white p-1 mr-1"
                        title="Clear search"
                      >
                        <FiX size={15} />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-[#ff385c] hover:bg-[#d90b63] rounded-full p-2 text-white transition-colors cursor-pointer shadow-sm"
                      title="Search"
                    >
                      <img src={searchIcon} alt="Search motel" className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Filters Button */}
                  <button
                    type="button"
                    onClick={() => setShowFilterPopup(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer ${
                      activeFilterCount > 0
                        ? "border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] ring-1 ring-[#ff385c]"
                        : "border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#222222] text-[#222222] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <FiSliders size={14} className={activeFilterCount > 0 ? "text-[#ff385c]" : "text-[#717171] dark:text-[#a0a0a0]"} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#ff385c] text-white text-[10px] font-extrabold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {/* if in the booking page don't show any option 👇  */}
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
                  <button
                    onClick={() => setPopup(true)}
                    className=" flex flex-row justify-between items-center gap-2 bg-[#ff385c] hover:bg-[#d90b63] transition-all duration-300 px-3 py-2 rounded-lg"
                  >
                    <img src={house} alt="House setup" className=" w-4 md:w-5" />
                    <p className=" font-semibold text-sm md:text-base text-white">
                      Motel setup
                    </p>
                  </button>
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

                  {/* Theme toggle button */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 rounded-full border border-[#dddddd] dark:border-[#444444] hover:bg-[#f1f1f1] dark:hover:bg-[#333333] transition-all cursor-pointer text-[#222222] dark:text-white flex items-center justify-center shrink-0"
                    title={theme === "light" ? "Switch to Dark mode" : "Switch to Light mode"}
                  >
                    {theme === "light" ? <BsMoonStars size={16} /> : <BsSun size={16} className="text-yellow-400" />}
                  </button>

                  <div
                    className="border-[1px] border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#222222] rounded-full py-1 px-2.5 flex flex-row gap-2.5 items-center hover:shadow-md transition-all cursor-pointer relative shrink-0"
                    onClick={() => {
                      setShowUserMenu((prevValue) => !prevValue);
                    }}
                  >
                    <img
                      src={hamburgerMenu}
                      alt="Motel user menu"
                      className="w-3.5 dark:invert"
                    />
                    {user ? (
                      user?.profileImg ? (
                        <img
                          src={user.profileImg}
                          alt={user?.name?.firstName || "User profile"}
                          className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                        />
                      ) : (
                        <p className="bg-[#222222] dark:bg-[#444444] text-[#efefef] w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center">
                          {user.name?.firstName?.slice(0, 1) || "U"}
                        </p>
                      )
                    ) : (
                      <img
                        src={userProfile}
                        alt="user profile icon"
                        className="w-7 h-7"
                      />
                    )}
                  </div>

                  {/* menu items code  */}

                  {showUserMenu ? (
                    <>
                      {!user ? (
                        <div
                          ref={userMenuRef}
                          className="shadow-md absolute right-9 top-[74px] bg-[#ffffff] border-[1px] border-[#dddddd] rounded-lg flex flex-col py-2 w-[230px] transition-all user__menu"
                        >
                          <Link
                            className="font-medium"
                            onClick={() => {
                              setShowUserMenu(false);
                              setPopup(true);
                            }}
                          >
                            Sign up
                          </Link>
                          <Link
                            onClick={() => {
                              setShowUserMenu(false);
                              setPopup(true);
                            }}
                          >
                            Login
                          </Link>
                          <hr className="h-[1.5px] bg-[#dddddd] my-1" />
                          <Link
                            onClick={() => {
                              setShowUserMenu(false);
                              setPopup(true);
                            }}
                          >
                            Motel your home
                          </Link>
                          <Link to="/contact">Contact the team</Link>
                        </div>
                      ) : (
                        // logged in user menu
                        <div
                          ref={userMenuRef}
                          className="shadow-md absolute right-9 top-[70px] bg-[#ffffff] border-[1px] border-[#dddddd] rounded-lg flex flex-col py-2 w-[230px] transition-all user__menu"
                          onClick={() => {
                            setShowUserMenu((prev) => !prev);
                          }}
                        >
                          {user?.role === "host" || user?.role === "admin" ? (
                            <>
                              {!inUserDashboard ? (
                                <Link
                                  to={`/users/dashboard/${user._id}/overview=true`}
                                  onClick={() => {
                                    JSON.stringify(
                                      sessionStorage.setItem("activePage", 1)
                                    );
                                  }}
                                  className="font-medium"
                                >
                                  Dashboard
                                </Link>
                              ) : (
                                <Link className="font-medium" to={"/"}>
                                  Home
                                </Link>
                              )}
                            </>
                          ) : (
                            <Link className="font-medium">Notifications</Link>
                          )}
                          <Link to="/trips" className="font-medium">
                            Trips
                          </Link>
                          <Link to="/wishlists" className="font-medium">
                            Wishlists
                          </Link>
                          <hr className="h-[1.5px] bg-[#dddddd] my-1" />
                          <Link to={"/host/homes"}>Motel your home</Link>
                          <Link to={`/users/show/${user._id}`}>Account</Link>
                          <hr className="h-[1.5px] bg-[#dddddd] my-1" />
                          <Link to="/contact">Contact the team</Link>
                          <Link
                            onClick={() => {
                              handleLogout();
                            }}
                          >
                            Log out
                          </Link>
                        </div>
                      )}
                    </>
                  ) : null}
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
        !inBookingPage && (
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
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-[#888888] hover:text-[#222222] dark:hover:text-white p-1"
                    title="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#ff385c] hover:bg-[#d90b63] rounded-full p-1.5 text-white shrink-0 ml-1 cursor-pointer transition-colors shadow-xs"
                  title="Search"
                >
                  <img src={searchIcon} alt="Search" className="w-3 h-3" />
                </button>
              </form>

              {/* Mobile Filters Button */}
              <button
                type="button"
                onClick={() => setShowFilterPopup(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold shrink-0 shadow-xs cursor-pointer transition-all ${
                  activeFilterCount > 0
                    ? "border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] ring-1 ring-[#ff385c]"
                    : "border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#222222] text-[#222222] dark:text-white"
                }`}
              >
                <FiSliders
                  size={13}
                  className={activeFilterCount > 0 ? "text-[#ff385c]" : "text-[#717171] dark:text-[#a0a0a0]"}
                />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#ff385c] text-white text-[9px] font-extrabold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
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
    </nav>
  );
};

export default Navbar;
