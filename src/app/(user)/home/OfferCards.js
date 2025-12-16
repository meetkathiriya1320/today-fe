"use client";

import ShopCard from "@/components/card";
import { getRequest } from "@/lib/axiosClient";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const OfferCards = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const userLocation = useSelector((state) => state.user.location);

    useEffect(() => {
        const fetchNearbyOffers = async () => {
            try {

                const params = {
                    city: userLocation.city
                };

                const res = await getRequest(`/offers/user-offers`, params);
                if (res.successType && res.response.data) {

                    setOffers(res.response.data);
                }
            } catch (error) {
                console.error("Error fetching nearby offers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyOffers();
    }, [userLocation]);

    if (loading) {
        return <div>Loading offers...</div>;
    }



    return (
        <div className="my-8">
            <div className="text-center text-[20px] md:text-[30px] lg:text-[40px] font-[700] mb-8">
                <span className="uppercase">Trending</span>
                <span className="uppercase text-[var(--color-secondary)]"> Offers</span>
            </div>
            {offers.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">No offer available</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap:2 sm:gap-3 md:gap-4 xl:gap-6">
                    {offers.map((offer, index) => (
                        <ShopCard key={offer.id || index} shop={offer} />
                    ))}
                </div>
            )}

        </div>
    );
};

export { OfferCards };
