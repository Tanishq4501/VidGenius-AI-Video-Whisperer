'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Hero = () => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const phrases = [
        "What Did I Just Watch?",
        "Get AI-Powered Explanations",
        "Understand Any Video",
        "Decode Hidden Meanings",
        "Unlock Movie Mysteries"
    ];

    useEffect(() => {
        const typeSpeed = isDeleting ? 50 : 100;
        const deleteSpeed = 30;
        const pauseTime = 2000;

        const typeWriter = () => {
            const currentPhrase = phrases[currentTextIndex];
            
            if (isDeleting) {
                // Deleting effect
                setCurrentText(currentPhrase.substring(0, currentText.length - 1));
                if (currentText === '') {
                    setIsDeleting(false);
                    setCurrentTextIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                }
            } else {
                // Typing effect
                if (currentText === currentPhrase) {
                    // Pause at the end before deleting
                    setTimeout(() => setIsDeleting(true), pauseTime);
                    return;
                }
                setCurrentText(currentPhrase.substring(0, currentText.length + 1));
            }
        };

        const timer = setTimeout(typeWriter, isDeleting ? deleteSpeed : typeSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentTextIndex, phrases]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    }

    const buttonVariants = {
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        },
        tap: {
            scale: 0.95
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotateY: -15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateY: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        },
        hover: {
            y: -10,
            rotateY: 5,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    }

    return (
        <section id="hero"
                 className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/5 py-20 h-[700px] flex items-center overflow-hidden">
            <div className="container mx-auto px-6 ml-15">
                <motion.div 
                    className="grid lg:grid-cols-2 gap-12 items-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <motion.h1 
                            className="text-5xl font-bold text-gray-900 mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            <span className="inline-block min-h-[1.2em]">
                                {currentText}
                                <motion.span 
                                    className="inline-block w-1 h-8 bg-indigo-500 ml-1"
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </span>
                            <motion.span 
                                className="text-indigo-500 block"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                Get AI-Powered Explanations
                            </motion.span>
                        </motion.h1>
                        <motion.p 
                            className="text-xl text-gray-600 mb-8 leading-relaxed"
                            variants={itemVariants}
                        >
                            Upload any movie clip, TV show scene, or music video and get detailed explanations like a
                            friend would give - from basic plot to deep symbolism and fan theories.
                        </motion.p>
                        <motion.div 
                            className="flex flex-col sm:flex-row gap-4"
                            variants={itemVariants}
                        >
                            <motion.button
                                className="bg-indigo-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-500/90 transition-colors flex items-center justify-center shadow-lg"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <motion.svg 
                                    className="w-5 h-5 mr-3" 
                                    aria-hidden="true" 
                                    focusable="false"
                                    data-prefix="fas" 
                                    data-icon="upload" 
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 512 512"
                                    animate={{ y: [0, -2, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <path fill="currentColor"
                                          d="M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"></path>
                                </motion.svg>
                                Upload Video
                            </motion.button>
                            <motion.button
                                className="border-2 border-indigo-500 text-indigo-500 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-500 hover:text-white transition-colors shadow-lg"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                Try Demo
                            </motion.button>
                        </motion.div>
                    </motion.div>
                    <motion.div 
                        className="relative"
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <motion.div 
                            className="bg-white rounded-2xl shadow-2xl p-6"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)",
                                backdropFilter: "blur(10px)"
                            }}
                        >
                            <motion.div 
                                className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.svg 
                                    className="w-8 h-8" 
                                    aria-hidden="true" 
                                    focusable="false"
                                    data-prefix="fas" 
                                    data-icon="play" 
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 384 512"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <path fill="#9ca3af"
                                          d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"></path>
                                </motion.svg>
                            </motion.div>
                            <motion.div 
                                className="space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            >
                                <motion.div 
                                    className="h-3 bg-gray-200 rounded w-3/4"
                                    initial={{ width: 0 }}
                                    animate={{ width: "75%" }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                ></motion.div>
                                <motion.div 
                                    className="h-3 bg-gray-200 rounded w-1/2"
                                    initial={{ width: 0 }}
                                    animate={{ width: "50%" }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                ></motion.div>
                                <motion.div 
                                    className="h-3 bg-indigo-500/20 rounded w-2/3"
                                    initial={{ width: 0 }}
                                    animate={{ width: "66.666667%" }}
                                    transition={{ delay: 1.4, duration: 0.8 }}
                                ></motion.div>
                            </motion.div>
                        </motion.div>
                        {/* Floating elements for extra visual appeal */}
                        <motion.div
                            className="absolute -top-4 -right-4 w-8 h-8 bg-indigo-500/20 rounded-full"
                            animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, 180, 360]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                        />
                        <motion.div
                            className="absolute -bottom-4 -left-4 w-6 h-6 bg-indigo-300/30 rounded-full"
                            animate={{ 
                                y: [0, 8, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                                duration: 3, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                delay: 1
                            }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
export default Hero
