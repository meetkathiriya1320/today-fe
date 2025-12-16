"use client";

import { getResponse } from "@/lib/response";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, Home, House } from "lucide-react";
import { setBreeadCrumb } from "@/store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { constructQueryParams } from "@/utils/constructQueryParams";

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const userLocation = useSelector((state) => state.user.location);

    const router = useRouter();
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const query = {
                    city: userLocation.city
                }
                const queryString = constructQueryParams(query);

                const apiEndPoint = "/categories";
                const res = await getResponse({ apiEndPoint, queryString });
                if (res.successType) {
                    setCategories(res.response.data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();

        const data = [
            { icon: "House", name: "Home", navigation: "/home" },
            { name: "Categories", navigation: "/categories" }

        ]
        dispatch(setBreeadCrumb(data))
    }, [userLocation]);

    const handleCategoryClick = (categoryId) => {
        router.push(`/user/offers/${categoryId}`);
    };

    if (loading) {
        return <div className="text-center py-8">Loading categories...</div>;
    }

    return (
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-24 py-8">

            {/* Categories Grid */}
            <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {categories.map((category) => (
                    <div key={category.id} className="cursor-pointer rounded-[20px] border border-[#377355B2] border-[1px]" onClick={() => parseInt(category.offer_count) > 0 ? handleCategoryClick(category.id) : null}>
                        <div className="p-3">
                            <img src={category.image} width="100%" className="h-[200px] sm:h-[250px] md:h-[280px] lg:h-[290px] rounded-[20px] object-cover shadow-[0_6px_10px_rgba(0,0,0,0.25)]" />
                            <div className="flex justify-between items-center pt-3 sm:pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-[600]">{category.name}</span>
                                    <span className="text-[var(--color-text-muted)] text-sm sm:text-base">{category.offer_count || 0} Offers</span>
                                </div>
                                <div className="border border-[1.5px] border-[#00000099] flex justify-center items-center p-2 rounded-[8px]">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesPage;