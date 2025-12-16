"use client";

import QuillEditor from '@/components/quillEditor'
import SectionHeader from '@/components/sectionHeader'
import Button from '@/components/button'
import { postResponse, getResponse, putResponse } from '@/lib/response'
import toast from 'react-hot-toast'
import React, { useState, useEffect } from 'react'

const Settings = () => {
    const options = [
        { value: "privacy_policy", label: "Privacy Policy" },
        { value: "terms_and_condition", label: "Terms and Condition" },
        { value: "about_us", label: "About Us" },
    ];

    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [data, setData] = useState(null);
    const [keyId, setKeyId] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchSetting = async () => {
            setLoading(true);
            setData("");
            setKeyId(null);
            try {
                const response = await getResponse({
                    apiEndPoint: `settings`,
                    queryString: `key=${selectedOption.value}`,
                });
                if (response.successType) {
                    setData(response.response.data?.value || "");
                    setKeyId(response.response.data?.id || null);
                } else {
                    setData("");
                    setKeyId(null);
                }
            } catch (error) {
                setData("");
                setKeyId(null);
            } finally {
                setLoading(false);
            }
        };
        fetchSetting();
    }, [selectedOption]);

    const handleOnchange = (value) => {
        setData(value)
    }

    const handleSubmitSetting = async () => {
        try {
            setLoading(true);
            let response;
            if (keyId) {
                response = await putResponse({
                    apiEndPoint: `settings/${keyId}`,
                    payload: {
                        value: data,
                    },
                });
            } else {
                response = await postResponse({
                    apiEndPoint: "settings",
                    payload: {
                        key: selectedOption.value,
                        value: data,
                    },
                });
            }

            if (response.successType) {
                if (!keyId && response.response?.data?.id) {
                    setKeyId(response.response.data.id);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="p-4 bg-gray-50 ">
            <SectionHeader title="Settings" mainHeader />

            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Horizontal Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedOption(option)}
                                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 ${selectedOption.value === option.value
                                    ? "text-[var(--color-secondary)] border-[var(--color-secondary)]"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedOption.label}</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage content for {selectedOption.label.toLowerCase()}</p>
                        </div>
                        <Button
                            label={loading ? "Saving..." : "Save Changes"}
                            onClick={handleSubmitSetting}
                            disabled={loading}
                            className="px-6 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium"
                        />
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <QuillEditor
                            value={data}
                            onChange={handleOnchange}
                            height="600px"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings