"use client"
import React, { useState } from 'react'
import { useUserPlan } from '../hooks/useUserPlan'

const Pricing = () => {
    const { userPlan, isLoading, isPro, updateUserPlan } = useUserPlan();
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePlanSelect = async (plan) => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        try {
            if (plan === 'pro') {
                // In a real implementation, you'd redirect to Stripe checkout here
                // For now, we'll just update the plan in the database
                await updateUserPlan('pro');
                console.log('Successfully upgraded to Pro plan');
            } else {
                await updateUserPlan('free');
                console.log('Successfully selected Free plan');
            }
        } catch (error) {
            console.error('Error selecting plan:', error);
            alert('Failed to update plan. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const currentPlan = userPlan?.plan_type || 'free';

    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
                    <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div 
                        id="plan-free" 
                        className={`bg-gray-50 rounded-xl p-8 text-center transition-all duration-300 relative ${
                            currentPlan === 'free' ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'
                        }`}
                    >
                        {currentPlan === 'free' && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">
                                    Current Plan
                                </span>
                            </div>
                        )}
                        <h3 className="text-xl font-semibold mb-4">Free</h3>
                        <div className="text-3xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></div>
                        <ul className="space-y-3 mb-8 text-left">
                            <li className="flex items-center">
                                <i className="text-green-500 mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                3 explanations/month
                            </li>
                            <li className="flex items-center">
                                <i className="text-green-500 mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                Basic plot mode
                            </li>
                            <li className="flex items-center">
                                <i className="text-green-500 mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                YouTube links only
                            </li>
                            <li className="flex items-center">
                                <i className="text-green-500 mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                Related resources
                            </li>
                        </ul>
                        <button 
                            onClick={() => handlePlanSelect('free')}
                            disabled={isLoading || isUpdating || currentPlan === 'free'}
                            className={`w-full py-3 rounded-lg transition-all duration-300 ${
                                currentPlan === 'free' 
                                    ? 'bg-indigo-500 text-white cursor-default' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {isLoading || isUpdating ? 'Processing...' : currentPlan === 'free' ? 'Current Plan' : 'Select Free Plan'}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div 
                        id="plan-pro"
                        className={`bg-indigo-500 text-white rounded-xl p-8 text-center transform scale-105 shadow-xl transition-all duration-300 relative ${
                            currentPlan === 'pro' ? 'ring-2 ring-white' : ''
                        }`}
                    >
                        {currentPlan === 'pro' ? (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">
                                    Current Plan
                                </span>
                            </div>
                        ) : (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </span>
                            </div>
                        )}
                        <h3 className="text-xl font-semibold mb-4">Pro</h3>
                        <div className="text-3xl font-bold mb-6">$19<span className="text-lg opacity-80">/month</span></div>
                        <ul className="space-y-3 mb-8 text-left">
                            <li className="flex items-center">
                                <i className="mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                Unlimited explanations
                            </li>
                            <li className="flex items-center">
                                <i className="mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                All explanation modes
                            </li>
                            <li className="flex items-center">
                                <i className="mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                File uploads
                            </li>
                            <li className="flex items-center">
                                <i className="mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                Priority support
                            </li>
                            <li className="flex items-center">
                                <i className="mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                </i>
                                Advanced AI features
                            </li>
                        </ul>
                        <button 
                            onClick={() => handlePlanSelect('pro')}
                            disabled={isLoading || isUpdating || currentPlan === 'pro'}
                            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                                currentPlan === 'pro'
                                    ? 'bg-white text-indigo-500 cursor-default'
                                    : 'bg-white text-indigo-500 hover:bg-gray-100'
                            }`}
                        >
                            {isLoading || isUpdating ? 'Processing...' : currentPlan === 'pro' ? 'Current Plan' : 'Start Free Trial'}
                        </button>
                    </div>
                </div>
                {/* Manage Plan Button */}
                <div className="text-center mt-10">
                    <a href="/manage-plan" className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-all duration-200">
                        Manage Plan
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Pricing
