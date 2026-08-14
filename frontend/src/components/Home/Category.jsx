import { useRef } from "react";
import PropTypes from "prop-types";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { categoryApi } from "./categoryApi";

const Category = ({ styleGrid = "" }) => {
  const category = localStorage.getItem("category");
  const navigate = useNavigate();
  const categoryListRef = useRef(null);

  const handleSelectedCat = (cat) => {
    localStorage.setItem("category", cat.name);
    navigate(`/?category=${cat.name}`);
  };

  const scrollCategories = (direction) => {
    const categoryList = categoryListRef.current;
    if (!categoryList) return;

    categoryList.scrollBy({
      left: direction * Math.max(categoryList.clientWidth * 0.7, 240),
      behavior: "smooth",
    });
  };

  return (
    <div className={`flex items-center gap-2 ${styleGrid}`}>
      <button
        type="button"
        aria-label="Show previous categories"
        className="shrink-0 rounded-full border border-neutral-400 bg-white p-1 hover:shadow-lg"
        onClick={() => scrollCategories(-1)}
      >
        <MdKeyboardArrowLeft size={18} />
      </button>
      <div
        ref={categoryListRef}
        className="flex min-w-0 flex-1 gap-4 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categoryApi.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => handleSelectedCat(cat)}
            className={`relative flex min-w-16 shrink-0 flex-col-reverse items-center gap-1 pb-4 text-left transition duration-200 ease-in ${
              category === cat.name ? "opacity-100" : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="text-xs font-medium">{cat.name}</span>
            <cat.svg size={28} />
            {category === cat.name && <span className="absolute bottom-0 h-0.5 w-9 bg-[#222222]" />}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="Show next categories"
        className="shrink-0 rounded-full border border-neutral-400 bg-white p-1 hover:shadow-lg"
        onClick={() => scrollCategories(1)}
      >
        <MdKeyboardArrowRight size={18} />
      </button>
    </div>
  );
};

export default Category;

Category.propTypes = {
  styleGrid: PropTypes.string,
};
