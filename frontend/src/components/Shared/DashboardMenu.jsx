/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { navItem } from "./NavItem";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useRef } from "react";
import { useOutsideClick } from "../../hooks/useOutsideClick";

const DashboardMenu = () => {
  const user = useSelector((state) => state.user.userDetails);
  // const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const isSmallDevice = window.innerWidth < 768;
  const userDashboardMenu = useRef();
  const { state: showDashboardMenu, setState: setShowDashboardMenu } =
    useOutsideClick(userDashboardMenu);

  const activePage = JSON.parse(sessionStorage.getItem("activePage"));

  const handleItemClick = (id) => {
    // checking if we're going into the create new list page. If yes then we don't have to set item
    if (id === 4) return;

    JSON.stringify(sessionStorage.setItem("activePage", id));

    // for reservations initial active sub menu is 1
    if (id === 2) {
      JSON.stringify(sessionStorage.setItem("reservationsPage", 1));
    }
  };

  return (
    <>
      {isSmallDevice ? (
        <div className="sm:relative">
          {/* menu btn */}
          <button
            onClick={() => {
              setShowDashboardMenu((preValue) => !preValue);
            }}
            className=" flex flex-row gap-1 font-medium border-[1px] border-[#dddddd] rounded-full py-2 px-3 cursor-pointer relative user__menu"
          >
            Menu
            <span>
              {showDashboardMenu ? (
                <MdKeyboardArrowUp size={24} />
              ) : (
                <MdKeyboardArrowDown size={24} />
              )}
            </span>
          </button>
          {/* menu options */}
          {showDashboardMenu && (
            <div
              ref={userDashboardMenu}
              className="shadow-md absolute right-28 top-16 sm:-right-12 sm:top-12 bg-[#ffffff] border-[1px] border-[#dddddd] rounded-lg flex flex-col py-2 w-[230px] transition-all user__menu"
            >
              {/* dashboard nav menu options */}
              {navItem.map((item, i) => {
                return (
                  <div key={i} className=" px-4 py-3 hover:bg-[#f1f1f1]">
                    <Link
                      className={`text-sm font-medium ${
                        activePage === item.id
                          ? "font-medium text-[#ff3f62ff] hover:bg-white transition duration-200"
                          : " opacity-80"
                      }`}
                      to={`${
                        item.id === 4
                          ? `${item.to}`
                          : `/users/dashboard/${user?._id}${item.to}`
                      }`}
                      onClick={() => {
                        handleItemClick(item.id);
                        setShowDashboardMenu(false);
                      }}
                    >
                      {item.name}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className=" flex flex-row gap-4 md:gap-8 items-center justify-between">
          {navItem.map((item, i) => (
            <div key={i}>
              {/* We are checking if the menu is "create a new list" or not. if it is then we are redirecting to create new list layout page */}
              <Link
                to={`${
                  item.id === 4
                    ? `${item.to}`
                    : `/users/dashboard/${user?._id}${item.to}`
                }`}
              >
                <p
                  className={` cursor-pointer p-2 text-sm whitespace-nowrap rounded-full hover:bg-[#f0f0f0] transition duration-300 ${
                    activePage === item.id
                      ? "font-medium text-[#ff3f62ff] hover:bg-white transition duration-200"
                      : " opacity-80"
                  }`}
                  onClick={() => {
                    handleItemClick(item.id);
                  }}
                >
                  {item.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DashboardMenu;
