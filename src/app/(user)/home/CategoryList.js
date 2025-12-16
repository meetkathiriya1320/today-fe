"use client"

import Button from "@/components/button";
import { getResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"

const CategoryList = () => {

    const [categoryList, setCategoryList] = useState([])
    const [isOverflow, setIsOverflow] = useState(false)
    const containerRef = useRef(null)
    const router = useRouter()
    const userLocation = useSelector((state) => state.user.location)

    // Handle category click to navigate to offers page
    const handleCategoryClick = (categoryId) => {
        router.push(`/user/offers/${categoryId}`);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const query = {
                    city: userLocation.city
                }
                const queryString = constructQueryParams(query);

                const res = await getResponse({
                    apiEndPoint: "/categories", queryString
                });
                if (res.successType) {
                    setCategoryList(res.response.data);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, [userLocation]);

    useEffect(() => {
        if (containerRef.current && categoryList.length > 0) {
            const containerWidth = containerRef.current.offsetWidth;
            const contentWidth = containerRef.current.scrollWidth;
            setIsOverflow(contentWidth > containerWidth);
        } else {
            setIsOverflow(false);
        }
    }, [categoryList]);

    return (
        <>
            <div className="flex justify-between md:justify-center items-center">
                <div className="text-center text-[20px] md:text-[30px] lg:text-[40px] font-[700]">
                    <span className="uppercase">Shop By</span>
                    <span className="uppercase text-[var(--color-secondary)]"> Categories</span>
                </div>
                <div className="flex md:hidden underline text-[var(--color-text-muted)]" onClick={() => router.push('/categories')}>View All</div>
            </div>
            <div className="overflow-hidden my-[50px]" ref={containerRef}>
                <div className={`flex ${isOverflow ? 'marquee' : ''}`}>
                    {/* Duplicate the list for seamless loop */}
                    {[...categoryList].map((item, index) => {
                        return <div
                            key={`${item.id}-${index}`}
                            className="mx-1 w-[90px] md:w-[130px] md:mx-3 md:mx-5 flex flex-col items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleCategoryClick(item.id)}
                        >
                            <div className="
        h-[80px]   md:h-[120px] w-[80px] md:w-[120px]
            rounded-full
            border-2 border-dashed
            border-[var(--color-secondary)]
            flex items-center justify-center
        ">
                                <div className="h-[70px] md:h-[100px] w-[70px] md:w-[100px] rounded-full overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-[16px] text-wrap md:text-[18px] font-[500] text-center">{item.name}</span>
                        </div>

                    })}
                </div>
            </div>
            <div className="hidden md:block text-center my-5"> <Button label="View All" onClick={() => router.push('/categories')} /></div>
        </>
    )
}

export { CategoryList }