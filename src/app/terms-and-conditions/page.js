"use client";

import React, { useEffect, useState } from 'react';
import { getResponse } from '@/lib/response';
import SectionHeader from '@/components/sectionHeader';

const TermsAndConditions = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await getResponse({
                    apiEndPoint: 'settings',
                    queryString: 'key=terms_and_condition',
                });
                if (response.successType) {
                    setContent(response.response.data?.value || '');
                }
            } catch (error) {
                console.error('Error fetching terms and conditions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="p-4">
                <SectionHeader title="Terms and Conditions" mainHeader />
                <div className="mt-4">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <SectionHeader title="Terms and Conditions" mainHeader />
            <div
                className="prose prose-base sm:prose-lg max-w-none policy-content"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default TermsAndConditions;