import { Outlet } from "react-router-dom";
import ListingNavbar from "../components/Shared/ListingNavbar";
import ListingFooter from "../components/Shared/ListingFooter";

const CreateNewListLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#121212] transition-colors w-full">
      <ListingNavbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-8 md:px-10 xl:px-20">
        <Outlet />
      </main>
      <ListingFooter />
    </div>
  );
};

export default CreateNewListLayout;
