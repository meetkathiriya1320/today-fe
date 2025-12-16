import { ChevronLeft, ChevronRight, X, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
const no_image = "/assets/no_image_banner.png";

const ImageCarousel = ({ images, alt = "carousel image", interval = 2000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isAdmin = useIsAdmin();

  // Filter out null/undefined images and create fallback for missing images
  const validImages = (images || []).filter(img => img && typeof img === 'object' && img.image);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  // 🕒 Auto-scroll logic
  useEffect(() => {
    if (validImages.length <= 1) return;

    const autoSlide = setInterval(() => {
      nextImage();
    }, interval);

    return () => clearInterval(autoSlide);
  }, [validImages.length, interval]);

  if (!validImages.length) {
    return (
      <img
        src={no_image}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-700 ease-in-out"
      />
    );
  }

  // Handle image click - only works for admin users
  const handleImageClick = () => {
    if (isAdmin) {
      setIsFullscreen(true);
    }
  };

  return (
    <>
      {/* Normal Carousel */}
      <div
        className={`relative h-[200px] overflow-hidden rounded-xl ${isAdmin ? 'cursor-pointer group' : 'cursor-default'}`}
        onClick={handleImageClick}
      >
        <img
          src={validImages[currentIndex].image}
          alt={alt}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />

        {/* Left Arrow */}
        {validImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-20 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Arrow */}
        {validImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-20 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Dots Indicator */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
            {validImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white scale-110" : "bg-gray-400"
                  }`}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal - Only render for admin users */}
      {isFullscreen && isAdmin && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Fullscreen Carousel */}
          <div className="relative w-[90%] md:w-[70%] lg:w-[60%] h-[70vh] rounded-xl overflow-hidden">
            <img
              src={validImages[currentIndex].image}
              alt={alt}
              className="w-full h-full object-contain transition-all duration-700 ease-in-out"
            />

            {/* Left Arrow */}
            {validImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-md z-20 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Arrow */}
            {validImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-md z-20 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Dots Indicator */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {validImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                      ? "bg-white scale-125"
                      : "bg-gray-500"
                      }`}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
