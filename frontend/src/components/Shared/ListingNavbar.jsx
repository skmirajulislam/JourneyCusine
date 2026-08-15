import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/motelLogoBlack.png";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../redux/actions/userActions";

const ListingNavbar = () => {
  const user = useSelector((state) => state.user.userDetails);
  const [isSticky, setIsSticky] = useState(false);

  const dispatch = useDispatch();

  const handleSticky = () => {
    if (window.scrollY > 0) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("scroll", handleSticky);

    return () => {
      window.removeEventListener("scroll", handleSticky);
    };
  }, []);

  return (
    <header
      className={`w-full top-0 z-20 bg-white dark:bg-[#121212] transition-colors ${
        isSticky ? "border-b border-neutral-200 dark:border-neutral-800 sticky top-0" : ""
      }`}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-8 md:px-10 xl:px-20 pt-6 pb-4 flex flex-row justify-between items-center">
        <Link to={"/"} className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-9 dark:invert dark:brightness-200 transition-all" />
        </Link>
        <div className="flex flex-row items-center gap-4 text-sm text-[#111827] dark:text-white font-medium">
          <Link
            to={`/users/dashboard/${user?._id}/overview=true`}
            className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 rounded-full hover:border-[#111827] dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            Dashboard
          </Link>
          <Link
            to={"/"}
            className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 rounded-full hover:border-[#111827] dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            Exit
          </Link>
        </div>
      </div>
    </header>
  );
};

export default ListingNavbar;
