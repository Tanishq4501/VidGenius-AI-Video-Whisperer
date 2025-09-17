'use client'

import React from 'react'
import { motion } from 'framer-motion'

const Explanation = () => {
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

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
        hover: {
            y: -10,
            scale: 1.02,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    }

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                duration: 0.6,
                ease: "backOut"
            }
        },
        hover: {
            scale: 1.1,
            rotate: 5,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        }
    }

    const explanationModes = [
        {
            id: "mode-basic",
            title: "Explain Like I'm 5",
            description: "Simple, easy-to-understand explanations perfect for beginners.",
            icon: (
                <svg className="w-6 h-6" aria-hidden="true" focusable="false"
                     data-prefix="fas" data-icon="child" role="img" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 320 512">
                    <path fill="green"
                          d="M96 64a64 64 0 1 1 128 0A64 64 0 1 1 96 64zm48 320v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V287.8L59.1 321c-9.4 15-29.2 19.4-44.1 10S-4.5 301.9 4.9 287l39.9-63.3C69.7 184 113.2 160 160 160s90.3 24 115.2 63.6L315.1 287c9.4 15 4.9 34.7-10 44.1s-34.7 4.9-44.1-10L240 287.8V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V384H144z"></path>
                </svg>
            ),
            bgColor: "bg-green-100"
        },
        {
            id: "mode-plot",
            title: "Basic Plot",
            description: "Clear breakdown of what's happening in the scene.",
            icon: (
                <svg className="w-6 h-6" aria-hidden="true" focusable="false"
                     data-prefix="fas" data-icon="book" role="img" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 448 512">
                    <path fill="blue"
                          d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                </svg>
            ),
            bgColor: "bg-blue-100"
        },
        {
            id: "mode-deep",
            title: "Deep Symbolism",
            description: "Hidden meanings, metaphors, and cultural references.",
            icon: (
                <svg className="w-6 h-6" aria-hidden="true" focusable="false"
                     data-prefix="fas" data-icon="magnifying-glass" role="img"
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="purple"
                          d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
                </svg>
            ),
            bgColor: "bg-purple-100"
        },
        {
            id: "mode-theories",
            title: "Fan Theories",
            description: "Community theories and Reddit-style discussions.",
            icon: (
                <svg className="w-6 h-6" aria-hidden="true" focusable="false"
                     data-prefix="fas" data-icon="comments" role="img"
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path fill="darkorange"
                          d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2 0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.3-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9l0 0 0 0-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z"></path>
                </svg>
            ),
            bgColor: "bg-orange-100"
        }
    ]

    return (
        <section id="explanation-modes" className="py-20 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div 
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <motion.h2 
                        className="text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Multiple Explanation Modes
                    </motion.h2>
                    <motion.p 
                        className="text-xl text-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Choose how deep you want to go
                    </motion.p>
                </motion.div>
                
                <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {explanationModes.map((mode, index) => (
                        <motion.div 
                            key={mode.id}
                            id={mode.id}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative group"
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <motion.div 
                                className={`w-12 h-12 ${mode.bgColor} rounded-lg flex items-center justify-center mb-4`}
                                variants={iconVariants}
                                whileHover="hover"
                            >
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ 
                                        duration: 4, 
                                        repeat: Infinity, 
                                        ease: "easeInOut",
                                        delay: index * 0.3
                                    }}
                                >
                                    {mode.icon}
                                </motion.div>
                            </motion.div>
                            <motion.h3 
                                className="text-lg font-semibold mb-3 text-gray-900"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                {mode.title}
                            </motion.h3>
                            <motion.p 
                                className="text-gray-600 text-sm leading-relaxed"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                viewport={{ once: true }}
                            >
                                {mode.description}
                            </motion.p>
                            
                            {/* Animated border on hover */}
                            <motion.div
                                className="absolute inset-0 border-2 border-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileHover={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
export default Explanation
