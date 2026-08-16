import { useEffect, useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiGrid } from "react-icons/fi";

 
const ImageGalleryModal = ({ isOpen, onClose, photos = [], initialIndex = 0, title = "Property Photos" }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, photos]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-black/95 text-white backdrop-blur-md animate-fadeIn select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FiX size={16} />
            <span>Close</span>
          </button>
          <span className="text-xs text-neutral-400 font-medium hidden sm:inline-block truncate max-w-xs">
            {title}
          </span>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300">
          {activeIndex + 1} / {photos.length}
        </div>
      </header>

      {/* Main Gallery Area: Stage + Side Gallery Strip */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Center: Main Active Image Viewport */}
        <main className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {/* Navigation arrow Left */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-neutral-700 flex items-center justify-center shadow-xl transition-all hover:scale-105 z-20 cursor-pointer"
              title="Previous photo (Left arrow)"
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          {/* Active Image */}
          <div className="w-full h-full flex items-center justify-center max-w-5xl max-h-[75vh]">
            <img
              src={photos[activeIndex]}
              alt={`Photo ${activeIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-200"
            />
          </div>

          {/* Navigation arrow Right */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-neutral-700 flex items-center justify-center shadow-xl transition-all hover:scale-105 z-20 cursor-pointer"
              title="Next photo (Right arrow)"
            >
              <FiChevronRight size={24} />
            </button>
          )}
        </main>

        {/* Right: Side Gallery Thumbnails Strip */}
        <aside className="lg:w-80 border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-950/70 p-4 shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold text-neutral-300 uppercase tracking-wider">
            <FiGrid size={14} className="text-[#ff385c]" />
            <span>All Photos ({photos.length})</span>
          </div>

          {/* Thumbnails Container (Horizontal scroll on mobile, Vertical scroll on desktop) */}
          <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-32 lg:max-h-full pr-1 pb-1 scrollbar-thin">
            {photos.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer group ${
                  idx === activeIndex
                    ? "border-[#ff385c] scale-[1.02] shadow-lg shadow-rose-900/30"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-600"
                }`}
              >
                <div className="w-24 h-16 sm:w-28 sm:h-20 lg:w-full lg:h-32 bg-neutral-900">
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                {idx === activeIndex && (
                  <span className="absolute bottom-1 right-1.5 bg-black/70 backdrop-blur-xs text-[10px] font-bold px-1.5 py-0.5 rounded text-white">
                    {idx + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
