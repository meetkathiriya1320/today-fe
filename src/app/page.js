"use client";

import { CategoryList } from "@/app/(user)/home/CategoryList";
import { OfferCards } from "@/app/(user)/home/OfferCards";
import HomePageCarousel from "@/components/carousel/HomePageCarousel";
import { getResponse } from "@/lib/response";
import { setBreeadCrumb } from "@/store/slices/userSlice";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const HomePage = () => {

    // const [openModel, setOpenModel] = useState(!user_location_data)
    const [banners, setBanners] = useState([]);
    const userLocation = useSelector((state) => state.user.location);
    const dispatch = useDispatch();


    useEffect(() => {
        const fetchBanners = async () => {
            try {
                if (userLocation?.city) {
                    const query = {
                        city: userLocation.city
                    }
                    const queryString = constructQueryParams(query);
                    const res = await getResponse({ apiEndPoint: "/advertise-requests/banners", queryString });
                    if (res.successType && res.response.data.banners) {
                        setBanners(res.response.data.banners);
                    }
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        fetchBanners();

        const data = [
            { icon: "House", name: "Home", navigation: "/" }
        ]
        dispatch(setBreeadCrumb(data))
    }, [userLocation, dispatch]);



    return (
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-24">
            {banners.length > 0 && (
                <div className="mb-8">
                    <HomePageCarousel images={banners} interval={7000} alt="Home Banner" />
                </div>
            )}
            <CategoryList />
            <OfferCards />



        </div>
    )
}

export default HomePage
