"use client";
import { MapPin } from "lucide-react";
import Button from "../button";
import ImageCarousel from "../carousel";
import AnalyticsCount from "../analyticsCount";
import { useRouter } from "next/navigation";

const ShopCard = ({ shop }) => {

  const { id, offer_title, short_description, Branch, OfferImage } = shop;

  const handleOpenMap = () => {
    if (!Branch || !Branch.latitude || !Branch.longitude) return;

    const latitude = Branch.latitude;
    const longitude = Branch.longitude;

    const googleMapsUrl = `https://www.google.com/maps/dir/Current+Location/${latitude},${longitude}`;

    window.open(googleMapsUrl, "_blank");
  }

  const router = useRouter()

  // Only pass valid OfferImage to ImageCarousel
  const validImages = OfferImage && typeof OfferImage === 'object' && OfferImage.image ? [OfferImage] : [];

  return (
    <div className="shadow-lg bg-[var(--color-primary)] justify-between border border-[#69937C33] border-[1px] p-4 rounded-[20px] overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl duration-300 w-full flex flex-col">
      {/* Image Slider */}
      <div>
        <div className="relative">
          <ImageCarousel images={validImages} alt={offer_title} interval={2500} />
        </div>

        {/* Content */}
        <div className="mt-3">
          <div className="">
            {/* Offer Title */}
            <h2 className="text-[18px] sm:text-xl xl:text-2xl font-semibold text-[--color-text-primary]">
              {offer_title}
            </h2>

            {/* Short Description */}
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              {short_description}
            </p>
          </div>
        </div>
      </div>
      {/* View Details Button and Location Icon */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          label="View Details"
          fullWidth
          onClick={() => router.push(`/user/offer-details/${id}`)}
        />
        <div className="bg-white border border-[var(--color-secondary)] cursor-pointer p-2 rounded" onClick={handleOpenMap} >
          <MapPin size={18} className="text-[var(--color-secondary)]" />
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
