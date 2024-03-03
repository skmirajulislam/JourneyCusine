import { Outlet } from "react-router-dom";
import ListingNavbar from "../components/Shared/ListingNavbar";
import ListingFooter from "../components/Shared/ListingFooter";

const CreateNewListLayout = () => {
  return (
    <>
      <ListingNavbar />
      <div className=" max-w-screen-xl mx-auto px-4 sm:px-8 md:px-10 xl:px-20">
        <Outlet />
      </div>
      <ListingFooter />
    </>
  );
};

export default CreateNewListLayout;
