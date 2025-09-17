'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from 'framer-motion';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.header 
            className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
                isScrolled ? 'top-2' : 'top-4'
            }`}
            variants={navVariants}
            initial="hidden"
            animate="visible"
        >
            <nav className="w-full">
                <div 
                    className="mx-auto px-6 py-3 rounded-2xl"
                    style={{
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(4, 1, 40, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: 'rgba(255, 255, 255, 0.05) 0px 0px 10px 0px inset, rgba(0, 0, 0, 0.1) 0px 4px 20px 0px'
                    }}
                >
                    <div className="flex items-center justify-between">
                        {/* Logo & Brand */}
                        <motion.div 
                            className="flex items-center space-x-3"
                            variants={itemVariants}
                        >
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                    <svg className="w-5 h-5" aria-hidden="true" focusable="false"
                                         data-prefix="fas" data-icon="brain" role="img" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 512 512">
                                        <path fill="white"
                                              d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z"></path>
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold text-white">
                                    <span className="text-white">VidGenius</span>
                                </h4>
                            </Link>
                        </motion.div>

                        {/* Navigation Links */}
                        <motion.nav 
                            className="hidden md:flex items-center space-x-8"
                            variants={itemVariants}
                        >
                            <motion.span
                                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Features
                            </motion.span>
                            <motion.span
                                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Pricing
                            </motion.span>
                            <motion.span
                                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Examples
                            </motion.span>
                            <motion.span
                                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Contact
                            </motion.span>
                        </motion.nav>

                        {/* Auth Buttons */}
                        <motion.div 
                            className="flex items-center space-x-4"
                            variants={itemVariants}
                        >
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <motion.button 
                                        className="text-gray-300 hover:text-white transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Sign In
                                    </motion.button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <motion.button 
                                        className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: 'white',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            boxShadow: 'rgba(255, 255, 255, 0.2) 0px 0px 20px 0px inset'
                                        }}
                                        whileHover={{ 
                                            scale: 1.05,
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)'
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Start Free
                                    </motion.button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link 
                                    href="/upload" 
                                    className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Upload Video
                                </Link>
                                <UserButton 
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8"
                                        }
                                    }}
                                />
                            </SignedIn>
                        </motion.div>
                    </div>
                </div>
            </nav>
        </motion.header>
    )
}
export default Header
