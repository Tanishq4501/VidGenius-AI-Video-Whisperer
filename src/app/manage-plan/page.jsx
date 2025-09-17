"use client"
import React, { useState } from 'react';
import { useUserPlan } from '../../hooks/useUserPlan';
import PlanUsage from '../../components/plan-usage';
import UploadHeader from '../../components/upload-header';

const ManagePlanPage = () => {
  const { userPlan, isLoading, isPro, updateUserPlan } = useUserPlan();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const handlePlanChange = async (planType) => {
    setIsUpdating(true);
    setMessage('');
    try {
      await updateUserPlan(planType);
      setMessage(`Successfully switched to ${planType === 'pro' ? 'Pro' : 'Free'} plan.`);
    } catch (err) {
      setMessage('Failed to update plan. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentPlan = userPlan?.plan_type || 'free';

  return (
    <>
      <UploadHeader hideManagePlanButton currentPage="manage-plan" />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Plan</h1>
        <PlanUsage />
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Change Plan</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Free Plan Card */}
            <div className={`flex-1 border rounded-lg p-5 text-center ${currentPlan === 'free' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="text-2xl font-bold mb-2">$0<span className="text-base text-gray-600">/month</span></div>
              <ul className="text-left text-sm mb-4 space-y-1">
                <li>✔️ 3 explanations/month</li>
                <li>✔️ Basic plot mode</li>
                <li>✔️ YouTube links only</li>
                <li>✔️ Related resources</li>
              </ul>
              <button
                className={`w-full py-2 rounded-lg ${currentPlan === 'free' ? 'bg-indigo-500 text-white cursor-default' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                disabled={isUpdating || currentPlan === 'free'}
                onClick={() => handlePlanChange('free')}
              >
                {isUpdating && currentPlan !== 'free' ? 'Processing...' : currentPlan === 'free' ? 'Current Plan' : 'Switch to Free'}
              </button>
            </div>
            {/* Pro Plan Card */}
            <div className={`flex-1 border rounded-lg p-5 text-center ${currentPlan === 'pro' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="text-2xl font-bold mb-2">$19<span className="text-base text-gray-600">/month</span></div>
              <ul className="text-left text-sm mb-4 space-y-1">
                <li>✔️ Unlimited explanations</li>
                <li>✔️ All explanation modes</li>
                <li>✔️ File uploads</li>
                <li>✔️ Priority support</li>
                <li>✔️ Advanced AI features</li>
              </ul>
              <button
                className={`w-full py-2 rounded-lg ${currentPlan === 'pro' ? 'bg-indigo-500 text-white cursor-default' : 'bg-white text-indigo-500 border border-indigo-500 hover:bg-indigo-50'}`}
                disabled={isUpdating || currentPlan === 'pro'}
                onClick={() => handlePlanChange('pro')}
              >
                {isUpdating && currentPlan !== 'pro' ? 'Processing...' : currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
          {message && <div className="mt-4 text-center text-sm text-green-600">{message}</div>}
        </div>
      </div>
    </>
  );
};

export default ManagePlanPage; 