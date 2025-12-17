import { useEffect, useState } from "react";

const HomePageCarousel = ({ images, alt = "carousel image", interval = 3000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    useEffect(() => {
        const auto = setInterval(nextImage, interval);
        return () => clearInterval(auto);
    }, [images.length, interval]);

    return (
        <div
            className="relative w-full h-[420px] md:h-[594px]
                       bg-[var(--color-primary)] rounded-3xl
                       px-4 md:px-8 py-4 shadow-lg  flex flex-col justify-between
                       overflow-hidden"
        >
            {/* INNER SLIDE IMAGE BOX */}
            <div
                className="w-full h-[90%] rounded-2xl overflow-hidden
                           relative cursor-pointer"
                onClick={() => window.open(images[currentIndex].redirect_url, "_blank")}
            >
                {/* SLIDE ANIMATION */}
                <img
                    key={images[currentIndex].image}
                    src={images[currentIndex].image}
                    alt={alt}
                    className="w-full h-full object-cover
                               transition-all duration-700 ease-in-out
                               animate-slideFade"
                />
            </div>
            {/* DOTS */}
            <div className="flex justify-center space-x-2">
                {images.map((_, i) => (
                    <div
                        key={i}
                        className={`
            transition-all duration-300 rounded-full
            ${i === currentIndex
                                ? "w-6 h-2 bg-[var(--color-secondary)]"
                                : "w-2 h-2 bg-gray-400"
                            }
        `}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default HomePageCarousel;
