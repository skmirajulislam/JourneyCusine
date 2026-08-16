import { useState } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { FiGrid } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import ImageGalleryModal from "./ImageGalleryModal";

 
const ListingsPhotos = ({ listingData }) => {
  const navigate = useNavigate();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const photos = listingData?.photos || [];

  const handleOpenGallery = (index = 0) => {
    setSelectedPhotoIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <div className="flex flex-col md:block gap-5 relative">
      {/* Back to Home for small devices */}
      <div className="flex flex-row gap-1 items-center md:hidden ml-[-12px]">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="p-2 rounded-full hover:bg-[#f1f1f1] dark:hover:bg-[#2a2a2a] cursor-pointer transition duration-200 ease-in"
        >
          <MdKeyboardArrowLeft size={28} className="dark:text-white" />
        </div>
        <Link to={"/"} className="font-medium dark:text-white">
          Home
        </Link>
      </div>

      {/* photos data grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-2 max-h-[420px] min-h-[300px] rounded-2xl overflow-hidden group">
        {/* Main large image */}
        <div
          onClick={() => handleOpenGallery(0)}
          className="md:rounded-tl-2xl md:rounded-bl-2xl md:col-span-2 overflow-hidden cursor-pointer relative group/img"
        >
          <img
            src={photos[0]}
            alt="Listing main photo"
            className="md:rounded-tl-2xl md:rounded-bl-2xl aspect-video object-cover w-full h-[240px] md:h-full group-hover/img:scale-105 group-hover/img:brightness-95 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* Sub grid for secondary photos */}
        <div className="grid grid-cols-2 md:grid-cols-none md:grid-rows-2 gap-2 max-h-[420px] min-h-[300px] md:col-span-1">
          <div
            onClick={() => handleOpenGallery(1)}
            className="overflow-hidden cursor-pointer relative group/img2 rounded-md md:rounded-tr-2xl"
          >
            <img
              src={photos[1] || photos[0]}
              alt="Listing secondary photo 1"
              className="aspect-video object-cover w-full h-full group-hover/img2:scale-105 group-hover/img2:brightness-95 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/img2:bg-black/10 transition-colors pointer-events-none" />
          </div>

          <div
            onClick={() => handleOpenGallery(2)}
            className="overflow-hidden cursor-pointer relative group/img3 rounded-md md:rounded-br-2xl"
          >
            <img
              src={photos[2] || photos[0]}
              alt="Listing secondary photo 2"
              className="aspect-video object-cover w-full h-full group-hover/img3:scale-105 group-hover/img3:brightness-95 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/img3:bg-black/10 transition-colors pointer-events-none" />
          </div>
        </div>

        {/* "Show all photos" floating pill button */}
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => handleOpenGallery(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 dark:bg-black/85 hover:bg-white dark:hover:bg-black text-[#111827] dark:text-white border border-neutral-300 dark:border-neutral-700 text-xs font-bold shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer z-10"
          >
            <FiGrid size={14} className="text-[#ff385c]" />
            <span>Show all {photos.length} photos</span>
          </button>
        )}
      </div>

      {/* Fullscreen Popup Image Gallery Modal with Side Strip */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={photos}
        initialIndex={selectedPhotoIndex}
        title={listingData?.title}
      />
    </div>
  );
};

export default ListingsPhotos;
