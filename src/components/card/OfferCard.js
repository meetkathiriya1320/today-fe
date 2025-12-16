"use client";
import { MapPin } from "lucide-react";
import Button from "../button";
import ImageCarousel from "../carousel";
import AnalyticsCount from "../analyticsCount";

const OfferCard = ({ offer }) => {
  const { offer_title, short_description, OfferImage, address, locationUrl, images, views } = offer;

  // Prepare valid images array for ImageCarousel
  const validImages = [];

  if (images && Array.isArray(images)) {
    validImages.push(...images.filter(img => img && typeof img === 'object' && img.image));
  }

  if (OfferImage && typeof OfferImage === 'object' && OfferImage.image) {
    validImages.push(OfferImage);
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl duration-300 max-w-sm w-full flex flex-col">
      {/* Left and Right Parts */}
      <div className="flex flex-row">
        {/* Left: Content */}
        <div className="flex-1 p-4">
          {/* Offer Title */}
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🏷️ <span className="line-clamp-1">{offer_title}</span>
          </h2>

          {/* Short Description */}
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{short_description}</p>

          {/* Address if available */}
          {address && (
            <div className="flex items-start gap-2 mt-2 text-gray-600 text-sm">
              <MapPin size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
              <p className="line-clamp-2">{address}</p>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-200 my-3"></div>

          {/* Button */}
          <Button
            label="View Offer"
            fullWidth
            startIcon={<MapPin size={18} />}
            onClick={() => locationUrl && window.open(locationUrl, "_blank")}
          />
        </div>

        {/* Right: Image */}
        <div className="flex-1 relative">
          <ImageCarousel images={validImages} alt={offer_title} interval={2500} />
        </div>
      </div>

      {/* After Left and Right: AnalyticsCount */}
      <div className="p-4">
        <AnalyticsCount icon={MapPin} label="Views" count={views || 0} />
      </div>
    </div>
  );
};

export default OfferCard;