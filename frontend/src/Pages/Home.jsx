import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Category from "../components/Home/Category";
import PriceWithTaxCard from "../components/Home/PriceWithTaxCard";
import { useQuery } from "@tanstack/react-query";
import api from "../backend";
import HomePageSkeleton from "../components/skeletonLoading/HomePageSkeleton";
import ListingPreviewCard from "../components/Home/ListingPreviewCard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useGetSubCatListing } from "../hooks/useGetSubCatListing";
import SkeletonLoadingCards from "../components/skeletonLoading/SkeletonLoadingCards";
import { FadeLoader } from "react-spinners";
import { fuzzySearchListings } from "../utils/fuzzySearch";
import { FiSearch, FiX, FiSliders } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import FilterPopUp, {
  PRICE_OPTIONS,
  RATING_OPTIONS,
} from "../components/popUp/FilterPopUp/FilterPopUp";
import AiChatWidget from "../components/AiAssistant/AiChatWidget";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasScroll, setHasScroll] = useState(false);
  const [showBeforeTaxPrice, setShowBeforeTaxPrice] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Extract search and filter parameters from URL
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "House";
  const priceFilter = searchParams.get("price") || "all";
  const ratingFilter = searchParams.get("rating") || "all";
  const amenitiesFilter = useMemo(
    () => (searchParams.get("amenities") ? searchParams.get("amenities").split(",").filter(Boolean) : []),
    [searchParams]
  );

  const activeFilterCount =
    (priceFilter !== "all" ? 1 : 0) +
    (ratingFilter !== "all" ? 1 : 0) +
    amenitiesFilter.length;

  // TanStack Queries in fixed top-level order
  const allListingData = useQuery({
    queryKey: ["allListing"],
    queryFn: async () => {
      const res = await api.get("/house/get_all_listing");
      return res.data?.allListingData || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { isLoading: isCategoryLoading, data: categoryData = [] } = useGetSubCatListing(categoryParam);

  const handleScrollTracking = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition >= 20) {
      setHasScroll(true);
    } else if (scrollPosition <= 10) {
      setHasScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollTracking);
    return () => {
      window.removeEventListener("scroll", handleScrollTracking);
    };
  }, []);

  useEffect(() => {
    if (location.search.includes("category")) {
      const catParam = searchParams.get("category");
      if (catParam) {
        localStorage.setItem("category", catParam);
      }
    } else if (!searchQuery) {
      localStorage.setItem("category", "House");
    }
  }, [location.search, searchParams, searchQuery]);

  // Compute displayed listings based on fuzzy search, category, and price/rating/amenities filters
  const displayedListings = useMemo(() => {
    const rawListings = allListingData.data || [];
    let candidates = rawListings;

    // 1. If user entered a search query, perform fuzzy search
    if (searchQuery.trim()) {
      candidates = fuzzySearchListings(rawListings, searchQuery);
    } else {
      // If viewing specific category and not default House
      const currentCat = searchParams.get("category");
      if (currentCat && currentCat !== "House" && Array.isArray(categoryData)) {
        candidates = categoryData;
      }
    }

    // 2. Apply Price Filter (Radio Basis)
    if (priceFilter && priceFilter !== "all") {
      const priceOpt = PRICE_OPTIONS.find((p) => p.id === priceFilter);
      if (priceOpt) {
        candidates = candidates.filter((item) => {
          const price = Number(item.basePrice) || 0;
          return price >= priceOpt.min && price <= priceOpt.max;
        });
      }
    }

    // 3. Apply Rating Filter (Radio Basis)
    if (ratingFilter && ratingFilter !== "all") {
      const minRate = parseFloat(ratingFilter);
      if (!isNaN(minRate)) {
        candidates = candidates.filter((item) => {
          const r = parseFloat(item.ratings);
          return !isNaN(r) && r >= minRate;
        });
      }
    }

    // 4. Apply Amenities / Accessories Filter (Checkmark Basis)
    if (amenitiesFilter.length > 0) {
      candidates = candidates.filter((item) => {
        const itemAmenities = (item.amenities || []).map((a) =>
          typeof a === "object" ? a.name?.toLowerCase() : String(a).toLowerCase()
        );
        const desc = (item.description || "").toLowerCase();
        const title = (item.title || "").toLowerCase();
        const hasCuisineOfferings = (item.cuisineOfferings || []).length > 0;

        // Must match all selected amenities
        return amenitiesFilter.every((reqAmenity) => {
          const lowerReq = reqAmenity.toLowerCase();
          if (lowerReq.includes("host meal") || lowerReq.includes("cuisine")) {
            return hasCuisineOfferings || desc.includes("meal") || desc.includes("breakfast") || desc.includes("dinner") || desc.includes("chef");
          }
          if (lowerReq.includes("speedtest") || lowerReq.includes("100+ mbps")) {
            return itemAmenities.some((a) => a?.includes("wifi") || a?.includes("speed")) || desc.includes("mbps") || desc.includes("high-speed") || desc.includes("wifi");
          }
          return (
            itemAmenities.some((a) => a?.includes(lowerReq)) ||
            desc.includes(lowerReq) ||
            title.includes(lowerReq)
          );
        });
      });
    }

    return candidates;
  }, [searchQuery, allListingData.data, categoryData, searchParams, priceFilter, ratingFilter, amenitiesFilter]);

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    navigate(`/?${newParams.toString()}`);
  };

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

  const handleRemoveSingleFilter = (type, value) => {
    const params = new URLSearchParams(searchParams);
    if (type === "price") {
      params.delete("price");
    } else if (type === "rating") {
      params.delete("rating");
    } else if (type === "amenity") {
      const remaining = amenitiesFilter.filter((a) => a !== value);
      if (remaining.length > 0) {
        params.set("amenities", remaining.join(","));
      } else {
        params.delete("amenities");
      }
    }
    navigate(`/?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("price");
    params.delete("rating");
    params.delete("amenities");
    params.delete("search");
    const queryStr = params.toString();
    navigate(queryStr ? `/?${queryStr}` : "/");
  };

  const handleResetAll = () => {
    localStorage.setItem("category", "House");
    navigate("/");
  };

  if (allListingData.isLoading) {
    if (window.innerWidth <= 1080) {
      return (
        <div className="flex justify-center items-center h-[80dvh]">
          <FadeLoader color="#ff385c" />
        </div>
      );
    } else {
      return <HomePageSkeleton />;
    }
  }

  const selectedPriceLabel = PRICE_OPTIONS.find((p) => p.id === priceFilter)?.label;
  const selectedRatingLabel = RATING_OPTIONS.find((r) => r.id === ratingFilter)?.label;

  return (
    <main className="max-w-screen-2xl xl:px-10 px-5 sm:px-16 mx-auto pb-16">
      {/* Categories & Tax Bar */}
      <section
        className={`pt-6 grid md:grid-cols-12 gap-5 bg-white dark:bg-[#121212] sticky top-16 z-30 transition-all ${
          hasScroll ? "shadow-sm" : "shadow-none"
        }`}
      >
        <Category styleGrid={"md:col-span-8 lg:col-span-9"} />
        <PriceWithTaxCard
          style={
            "md:col-span-4 lg:col-span-3 border-[#e2e2e2] dark:border-[#333333] border rounded-xl h-14 md:flex justify-around items-center hidden"
          }
          setShowBeforeTaxPrice={setShowBeforeTaxPrice}
        />
      </section>

      {/* Active Search & Filters Pill Banner */}
      <AnimatePresence>
        {(searchQuery || activeFilterCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6 mb-2 p-4 rounded-2xl bg-neutral-100 dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#2a2a2a] text-xs font-bold text-[#111827] dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-xs">
                  <FiSearch size={12} className="text-[#ff385c]" />
                  &ldquo;{searchQuery}&rdquo;
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              )}

              {priceFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#2a2a2a] text-xs font-bold text-[#111827] dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-xs">
                  Price: {selectedPriceLabel}
                  <button
                    type="button"
                    onClick={() => handleRemoveSingleFilter("price")}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              )}

              {ratingFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#2a2a2a] text-xs font-bold text-[#111827] dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-xs">
                  <AiFillStar className="text-amber-500" size={13} />
                  {selectedRatingLabel}
                  <button
                    type="button"
                    onClick={() => handleRemoveSingleFilter("rating")}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              )}

              {amenitiesFilter.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#2a2a2a] text-xs font-bold text-[#111827] dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-xs"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveSingleFilter("amenity", amenity)}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              ))}

              <span className="text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af] ml-1">
                ({displayedListings.length} {displayedListings.length === 1 ? "stay" : "stays"} found)
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
              className="gap-1.5 rounded-xl text-xs font-bold shrink-0"
            >
              <FiX size={14} /> Clear all filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* House Listings Grid */}
      {isCategoryLoading && !searchQuery ? (
        <>
          {window.innerWidth <= 1080 ? (
            <div className="flex justify-center items-center h-[80dvh]">
              <FadeLoader color="#ff385c" />
            </div>
          ) : (
            <SkeletonLoadingCards />
          )}
        </>
      ) : (
        <>
          {displayedListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="my-16 py-16 px-6 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#181818] max-w-lg mx-auto"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#ff385c] flex items-center justify-center mx-auto mb-4">
                <FiSliders size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                No stays match your criteria
              </h3>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                Try loosening your price, rating, or amenities filters, or explore all available stays.
              </p>
              <Button
                type="button"
                variant="journey"
                onClick={handleResetAll}
                className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
              >
                Reset all filters &amp; search
              </Button>
            </motion.div>
          ) : (
            <motion.section
              key={`${categoryParam}-${searchQuery}-${priceFilter}-${ratingFilter}-${amenitiesFilter.join(",")}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mx-auto gap-x-7 gap-y-10"
            >
              {displayedListings.map((listing) => (
                <motion.div key={listing._id} variants={itemVariants}>
                  <Link
                    to={`/rooms/${listing?._id}`}
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        window.dispatchEvent(new Event("open-auth-popup"));
                      }
                    }}
                    className="flex flex-col gap-3 rounded-xl w-full sm:max-w-[300px] md:w-full mx-auto group block"
                  >
                    <ListingPreviewCard
                      listingData={listing}
                      showBeforeTaxPrice={showBeforeTaxPrice}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.section>
          )}
        </>
      )}

      {/* Filter Modal Popup */}
      <FilterPopUp
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        activeFilters={{
          price: priceFilter,
          rating: ratingFilter,
          amenities: amenitiesFilter,
        }}
        onApplyFilters={handleApplyFilters}
        totalMatchingCount={displayedListings.length}
      />

      {/* AI Assistant Concierge Widget */}
      <AiChatWidget />
    </main>
  );
};

export default Home;
