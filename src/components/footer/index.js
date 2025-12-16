import React from 'react'
import logo from "../../assets/logo.png";
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
    return (
        <div className="mt-[25px] sm:mt-[70px] bg-[url('/assets/footer_patten.png')] bg-cover bg-center h-auto pb-[20px] w-full">
            <div className="mx-[20px] sm:mx-[50px] relative bottom-[0px] sm:bottom-[20px]">
                <div className='bg-[var(--color-primary)] border border-[1px] rounded-[20px] border-[var(--muted-green)]'>
                    <div className='p-[20px] md:p-[30px] lg:p-[50px]'>

                        <Link href="/">
                            <Image src={logo} width={140} height={40} alt="logo" className="cursor-pointer hover:opacity-80 transition-opacity" />
                        </Link>
                        <div className='block md:flex  justify-between my-5'>
                            <span className=' text-[14px] md:text-[16px] lg:text-[20px]'>Discover nearby deals and shop offers around you instantly.</span>
                            <div className='flex mt-3 md:mt-0 '>
                                <span className='text-[16px] sm:text-[18px] font-[500]'><Link href="/about-us">About Us </Link></span>
                                <div className='bg-[var(--color-text-muted)] mx-3 w-[1px]' />
                                <span className='text-[16px] sm:text-[18px] font-[500]'><Link href="/contact-us">Contact Us</Link></span>
                            </div>
                        </div>
                        <div className='bg-[var(--divider-line)] my-5 w-[100%] h-[1px]' />
                        <div className='flex justify-between'>
                            <Link href="/terms-and-conditions" className='text-[13px] md:text-[16px] font-[400] hover:underline cursor-pointer'>Terms of Conditions</Link>
                            <div className='hidden sm:flex'>
                                <span className='text-[13px] md:text-[16px] font-[600]'>SchemeToday </span>
                                <span className='text-[13px] md:text-[16px] font-[400]'> ©{new Date().getFullYear()}. All rights reserved.</span>
                            </div>
                            <Link href="/privacy-policy" className='text-[13px] md:text-[16px] font-[400] hover:underline cursor-pointer'>Privacy Policy</Link>
                        </div>
                        <div className='flex sm:hidden justify-center mt-2'>
                            <span className='text-[13px] md:text-[16px] font-[600]'>SchemeToday</span>
                            <span className='text-[13px] md:text-[16px] font-[400]'> ©{new Date().getFullYear()}. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer