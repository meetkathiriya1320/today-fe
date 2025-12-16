"use client";

import SafeHtml from "@/components/safeHtml";
import SectionHeader from "@/components/sectionHeader";
import { getRequest } from "@/lib/axiosClient";
import { getResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { useEffect, useState } from "react";

const AboutUs = () => {

    const [aboutUsContent, setAboutUsContent] = useState(null)


    const handleGetAboutUs = async () => {
        try {
            const query = {
                key: "about_us"
            }
            const queryString = constructQueryParams(query);
            const res = await getResponse({ apiEndPoint: "/settings", queryString })
            if (res.successType) {
                setAboutUsContent(res.response.data.value)
            }

        } catch (error) {

        }
    }


    useEffect(() => {
        handleGetAboutUs();
    }, []);


    return (
        <div className="p-4">
            <SectionHeader title="About Us" mainHeader />
            <div className="mt-4">
                <SafeHtml html={aboutUsContent} />
            </div>
        </div>
    )
}

export default AboutUs