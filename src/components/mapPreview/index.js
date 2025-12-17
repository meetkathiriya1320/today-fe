
import { getCookieItem } from '@/utils/cookieUtils';
import React from 'react'

const MapPreview = ({ business_lat, business_lng }) => {

    const embedUrl = `https://www.google.com/maps?q=${business_lat},${business_lng}&z=15&output=embed`;
    return (
        <div className="w-full h-48 rounded-lg overflow-hidden border">
            <iframe
                title="Business Location"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={embedUrl}
            />
        </div>
    )
}

export default MapPreview
