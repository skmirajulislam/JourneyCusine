import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FadeLoader } from "react-spinners";
import { AiFillStar, AiFillHeart } from "react-icons/ai";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../backend";
import { updateWishlist } from "../redux/actions/userActions";
import { useCurrency } from "../context/CurrencyContext";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.user?.userDetails);
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get("/auth/wishlist");
        if (res.data?.success === 1) {
          setWishlistItems(res.data.wishlist || []);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        toast.error("Could not load your wishlist.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (e, houseId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await api.post(
        "/auth/wishlist/toggle",
        { houseId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data?.success === 1) {
        dispatch(updateWishlist(res.data.wishlist));
        setWishlistItems((prev) => prev.filter((item) => item._id !== houseId));
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[60vh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10 py-10 min-h-[75vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#222222] dark:text-white">
            Wishlists
          </h1>
          <p className="text-sm sm:text-base text-[#717171] dark:text-[#a0a0a0] mt-1">
            {wishlistItems.length === 1
              ? "1 saved motel"
              : `${wishlistItems.length} saved motels`}
          </p>
        </div>
        <Link
          to="/trips"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#222222] dark:bg-neutral-800 text-white dark:text-white hover:bg-black dark:hover:bg-neutral-700 font-semibold text-sm transition-colors self-start sm:self-auto shadow-sm border border-transparent dark:border-neutral-700"
        >
          🗺️ Open Trips Map Planner
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[#dddddd] dark:border-[#333333] bg-[#fafafa] dark:bg-[#1a1a1a] px-4">
          <div className="p-4 rounded-full bg-[#ff385c]/10 text-[#ff385c] mb-4">
            <FiHeart size={40} />
          </div>
          <h2 className="text-xl font-semibold text-[#222222] dark:text-white">
            Your wishlist is empty
          </h2>
          <p className="text-sm text-[#717171] dark:text-[#a0a0a0] max-w-sm mt-2 mb-6">
            As you search, tap the heart icon on any motel to save your favorite
            stays and experiences here.
          </p>
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-[#ff385c] hover:bg-[#d90b63] text-white font-medium transition-colors shadow-sm"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((house) => (
            <Link
              key={house._id}
              to={`/rooms/${house._id}`}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative h-[280px] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={house.photos?.[0]}
                  alt={house.title || "Motel image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemoveFromWishlist(e, house._id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all z-10"
                >
                  <AiFillHeart size={20} className="text-[#ff385c]" />
                </button>
              </div>

              <div className="flex flex-row justify-between items-start mt-3">
                <div className="flex flex-col gap-0.5 max-w-[75%]">
                  <p className="font-semibold text-sm text-[#222222] dark:text-white truncate">
                    {house.location?.city?.name || house.title || "Motel stay"}
                    {house.location?.country?.name
                      ? `, ${house.location.country.name}`
                      : ""}
                  </p>
                  <p className="text-xs text-[#717171] dark:text-[#a0a0a0] truncate">
                    {house.houseType || "Entire place"}
                  </p>
                  <p className="text-sm font-semibold text-[#222222] dark:text-white mt-1">
                    {formatPrice(house.basePrice)}{" "}
                    <span className="font-normal text-xs text-[#717171] dark:text-[#a0a0a0]">
                      night
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium">
                  <AiFillStar size={14} className="text-amber-500" />
                  <span>{house.ratings || "New"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
