"use client";

import ShopCard from "@/components/card";
import { getRequest } from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronRight, Home, House } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setBreeadCrumb } from "@/store/slices/userSlice";

const CategoryOffersPage = ({ params }) => {

    const { category_id } = React.use(params);
    const [offers, setOffers] = useState([]);
    const [categoryName, setCategoryName] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const userLocation = useSelector((state) => state.user.location);
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const params = { city: userLocation.city, category_id: category_id };
                const res = await getRequest("/offers/user-offers", params);
                if (res.successType && res.response.data) {
                    setOffers(res.response.data);
                    setCategoryName(res.response.data[0]?.Category?.name)
                    const data = [
                        { icon: "House", name: "Home", navigation: "/home" },
                        { name: "Categories", navigation: "/categories" },
                        { name: res.response.data.data[0]?.Category?.name },

                    ]
                    dispatch(setBreeadCrumb(data))
                }
            } catch (error) {
                console.error("Error fetching offers:", error);
            } finally {
                setLoading(false);
            }
        };
        if (category_id) {
            fetchOffers();
        }
    }, [category_id]);

    if (loading) {
        return <div className="text-center py-8">Loading offers...</div>;
    }

    return (
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-24 py-8">


            {/* Offers Grid */}
            {offers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {offers.map((offer, index) => (
                        <ShopCard key={offer.id || index} shop={offer} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">No offers available for this category.</div>
            )}
        </div>
    );
};

export default CategoryOffersPage;