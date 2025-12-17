"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import LoadingSpinner from "@/components/loadingSpinner";
import MapPreview from "@/components/mapPreview";
import Modal from "@/components/modal";
import { getRequest, postRequest } from "@/lib/axiosClient";
import { setBreeadCrumb } from "@/store/slices/userSlice";
import { getCookieItem, getCurrentUserCookie } from "@/utils/cookieUtils";
import { Calendar, House } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const no_image = "/assets/no_image_banner.png";


const OfferDetails = ({ params }) => {

    const { id } = React.use(params)

    const isLoggedIn = getCurrentUserCookie()
    // const user_lat_lon = getCookieItem("user_lat_lon");

    const [isModelOpen, setIsModelOpen] = useState("");
    const [reportNote, setReportNote] = useState("")

    const router = useRouter();
    const dispatch = useDispatch()


    const [loading, setLoading] = useState(true);
    const [offerItem, setOfferItem] = useState(null)

    const handleGetOfferDeatils = async () => {
        try {
            const apiEndPoint = `/offers/${id}`
            const res = await getRequest(apiEndPoint);
            console.log(res, "RESSS");

            if (res.successType) {
                setOfferItem(res.response.data)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        if (id) {
            handleGetOfferDeatils()
        }

        const data = [
            { icon: "House", name: "Home", navigation: "/home" },
            { name: "Offer Details" },

        ]
        dispatch(setBreeadCrumb(data))
    }, [id]);


    const {
        offer_title,
        short_description,
        full_description,
        start_date,
        end_date,
        keywords,
        Category,
        Branch,
        OfferImage,
    } = offerItem || {};

    // open map funcation
    const handleOpenMap = () => {

        const business_latitude = Branch.latitude;
        const business_longitude = Branch.longitude;
        openGoogleMapUsingLocData({ business_latitude, business_longitude });
    }

    // report offer funcation 
    const handleReportOffer = () => {
        if (!isLoggedIn) {
            router.push("/login")
        }

        setIsModelOpen("report")

    }


    const handleClose = () => {
        setIsModelOpen("")
    }

    const handleSubmitReport = async () => {
        if (!reportNote.trim()) {
            // Note is required, but since Input has required, maybe add toast or something
            return;
        }

        try {
            const apiEndPoint = "/offer-report/create";
            const payload = { offer_id: id, note: reportNote.trim() };
            const res = await postRequest(apiEndPoint, payload, router);

            if (res.successType) {
                setIsModelOpen("");
                setReportNote("");
            }
        } catch (error) {
            console.log(error);
        }
    }



    return (
        <div>
            {
                loading ? <div className="flex justify-center h-[40vh] items-center"> <LoadingSpinner /> </div> :
                    <div className="max-w-7xl mx-auto p-4">

                        {/* Title */}
                        <div className="flex my-5">
                            <div className="w-[5px] rounded-[3px] bg-[var(--color-secondary)] me-2" />
                            <div>
                                <h2 className="text-2xl font-semibold">{`${Branch?.Business?.business_name} (${Branch?.branch_name})`}</h2>
                                <p className="text-gray-500 mb-2 sm:mb-4">{Branch?.location}</p>
                            </div>
                        </div>

                        {/* Banner Image */}
                        <img
                            src={OfferImage?.image || no_image}
                            alt="offer banner"
                            className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[512px] rounded-[20px] object-cover"
                        />

                        {/* Section: Category + Duration */}
                        <div className="flex flex-col lg:flex-row justify-between mt-5 gap-6">

                            {/* Left Side */}
                            <div className="w-full lg:w-[70%]">
                                {/* Category Tag */}
                                <span className="bg-[var(--color-primary)] text-[var(--color-secondary)] px-4 py-2 
                        rounded-[10px] text-[18px] md:text-[22px] font-medium">
                                    {Category?.name}
                                </span>

                                {/* Offer Title */}
                                <h3 className="text-xl md:text-2xl font-bold mt-3">{offer_title}</h3>

                                <p className="text-[var(--color-text-muted)] text-[14px] md:text-[16px] mt-2">
                                    {short_description}
                                </p>
                            </div>

                            {/* Valid Offer Duration */}
                            <div className="w-full lg:w-auto">
                                <h4 className="text-[18px] sm:text-[20px] md:text-[22px] font-[600] mb-2 sm:mb-4">Valid Offer Duration</h4>

                                <div className="p-5 bg-[var(--color-primary)] rounded-[20px] 
                        border border-[var(--muted-green)]">

                                    <div className="flex flex-row md:items-center mb-5">

                                        {/* Calendar Icon + Start Date */}
                                        <div className="flex items-center mb-2 sm:mb-4 md:mb-0">
                                            <div className="bg-[var(--muted-green)] flex justify-center items-center 
                                    rounded-[10px] p-1 sm:p-3 me-2 sm:me-3">
                                                <Calendar className="text-[var(--color-secondary)]" />
                                            </div>

                                            <div>
                                                <p className="text-[14px] text-[var(--color-text-muted)]">Start Date</p>
                                                <p className="font-medium text-[12px] sm:text-[16px] md:text-[18px]">
                                                    {new Date(start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-[50px] w-[1px] bg-[var(--color-text-muted)] mx-5" />

                                        {/* End Date */}
                                        <div>
                                            <p className="text-[14px] text-[var(--color-text-muted)]">End Date</p>
                                            <p className="font-medium text-[12px] sm:text-[16px] md:text-[18px]">
                                                {new Date(end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <Button label="View Location" className="w-full" onClick={(e) => handleOpenMap(e)} />
                                    <Button label="Report Offer" className="w-full mt-3" variant="outline" onClick={handleReportOffer} />

                                </div>
                                <MapPreview business_lat={Branch.latitude} business_lng={Branch.longitude} />
                            </div>

                        </div>

                        {/* Divider */}
                        <div className="h-[1px] bg-[var(--divider-line)] w-full lg:w-[70%] my-5" />

                        {/* Business Details + Tags */}
                        <div className="mt-4 sm:mt-8 flex flex-col lg:flex-row gap-4 sm:gap-10">

                            {/* Business Details */}
                            <div className="w-full lg:w-[70%]">
                                <h3 className="text-xl font-semibold mb-3">Business Details</h3>

                                <div className="flex flex-wrap gap-3">

                                    {Branch.Business.business_images.map((item) => (
                                        <img
                                            key={item.id}
                                            className="w-[100px]  md:w-[150px] lg:w-[200px] 
                                    h-[100px]  md:h-[150px] lg:h-[203px] 
                                    rounded-[15px] object-cover"
                                            src={item.image_url}
                                        />
                                    ))}

                                </div>

                                <p className="text-[var(--color-text-muted)] break-all text-[14px] md:text-[16px] mt-2 sm:mt-4">
                                    {full_description}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="w-full lg:w-auto">
                                <h4 className="text-[20px] md:text-[22px] font-[600] mb-2 sm:mb-4">Tags</h4>
                                <div className="flex flex-wrap gap-1 md:gap-2">

                                    {keywords.map((item, index) => (
                                        <div
                                            key={index}
                                            className="text-[14px] md:text-[16px] text-[var(--color-text-muted)] 
                                    rounded-[10px] p-2 border border-[var(--color-text-muted)]"
                                        >
                                            {item}
                                        </div>
                                    ))}

                                </div>
                            </div>

                        </div>

                    </div>

            }

            <Modal title="Report Offer" open={isModelOpen === "report"} closeModal={handleClose}>

                <Input
                    label="Note"
                    required
                    isTextarea
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Enter your report note..."
                />
                <div className="flex mt-2 justify-end">
                    <Button label="Submit" onClick={handleSubmitReport} />
                    <Button label="Cancel" className="ml-2" variant="outline" onClick={handleClose} />
                </div>
            </Modal>
        </div>

    );
};

export default OfferDetails;

export function openGoogleMapUsingLocData({
    business_latitude,
    business_longitude
}) {
    if (!navigator.geolocation) {
        // Geolocation not supported
        const url = `https://www.google.com/maps/dir/?api=1&destination=${business_latitude},${business_longitude}`;
        window.open(url, "_blank");
        return;
    }

    navigator.permissions.query({ name: "geolocation" })
        .then(({ state }) => {

            // ❌ Permission blocked
            if (state === "denied") {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${business_latitude},${business_longitude}`;
                window.open(url, "_blank");
                return;
            }

            // ✅ Allowed or first-time → get user location
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const url = `https://maps.google.com/?saddr=${pos.coords.latitude},${pos.coords.longitude}&daddr=${business_latitude},${business_longitude}`;
                    window.open(url, "_blank");
                },
                (err) => {
                    // ⚠️ Any error → fallback to business location
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${business_latitude},${business_longitude}`;
                    window.open(url, "_blank");
                    console.error("Location error:", err.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }

            );
        })
        .catch((err) => {
            // Permissions API failed → fallback
            const url = `https://www.google.com/maps/dir/?api=1&destination=${business_latitude},${business_longitude}`;
            window.open(url, "_blank");
            console.error("Permission check error:", err);
        });
}

