import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { navItem } from "./NavItem";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useRef } from "react";
import { useOutsideClick } from "../../hooks/useOutsideClick";

const DashboardMenu = () => {
  const { user } = useAuth();
  const userDashboardMenu = useRef();
  const { state: showDashboardMenu, setState: setShowDashboardMenu } =
    useOutsideClick(userDashboardMenu);

  const activePage = JSON.parse(sessionStorage.getItem("activePage"));

  const handleItemClick = (id) => {
    if (id === 4) return;
    sessionStorage.setItem("activePage", JSON.stringify(id));
    if (id === 2) {
      sessionStorage.setItem("reservationsPage", JSON.stringify(1));
    }
  };

  return (
    <>
      {/* Mobile & Tablet Responsive Dropdown Button */}
      <div className="relative lg:hidden">
        <button
          type="button"
          onClick={() => {
            setShowDashboardMenu((preValue) => !preValue);
          }}
          className="flex flex-row items-center gap-1 font-semibold text-xs border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#222222] rounded-full py-1.5 px-2.5 text-gray-800 dark:text-gray-200 cursor-pointer shadow-xs"
        >
          <span>Menu</span>
          {showDashboardMenu ? (
            <MdKeyboardArrowUp size={16} />
          ) : (
            <MdKeyboardArrowDown size={16} />
          )}
        </button>

        {showDashboardMenu && (
          <div
            ref={userDashboardMenu}
            className="shadow-xl absolute left-0 top-10 bg-white dark:bg-[#222222] border border-[#dddddd] dark:border-[#444444] rounded-2xl flex flex-col py-1.5 w-[200px] z-[100] animate-in fade-in zoom-in-95 duration-150"
          >
            {navItem.map((item, i) => (
              <div key={i} className="px-3 py-2 hover:bg-[#f1f1f1] dark:hover:bg-[#333333]">
                <Link
                  className={`text-xs font-semibold block ${
                    activePage === item.id
                      ? "text-[#ff385c] font-bold"
                      : "text-gray-700 dark:text-gray-300 opacity-90"
                  }`}
                  to={item.id === 4 ? `${item.to}` : `/users/dashboard/${user?._id}${item.to}`}
                  onClick={() => {
                    handleItemClick(item.id);
                    setShowDashboardMenu(false);
                  }}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Horizontal Nav */}
      <div className="hidden lg:flex flex-row gap-2 xl:gap-6 items-center justify-between">
        {navItem.map((item, i) => (
          <div key={i}>
            <Link
              to={item.id === 4 ? `${item.to}` : `/users/dashboard/${user?._id}${item.to}`}
              onClick={() => handleItemClick(item.id)}
            >
              <p
                className={`cursor-pointer px-3 py-1.5 text-xs lg:text-sm font-medium whitespace-nowrap rounded-full hover:bg-[#f0f0f0] dark:hover:bg-[#333333] transition duration-200 ${
                  activePage === item.id
                    ? "font-bold text-[#ff385c] bg-rose-50 dark:bg-rose-950/40"
                    : "text-gray-600 dark:text-gray-300 opacity-90"
                }`}
              >
                {item.name}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardMenu;
