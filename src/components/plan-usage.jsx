import React from 'react';
import { useUserPlan } from '../hooks/useUserPlan';

const PlanUsage = () => {
  const { userPlan, isPro, getExplanationCount } = useUserPlan();
  const explanationCount = getExplanationCount();
  const currentPlan = userPlan?.plan_type || 'free';

  if (isPro) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Pro Plan</h3>
            <p className="text-indigo-100">Unlimited explanations</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">∞</div>
            <div className="text-indigo-100 text-sm">remaining</div>
          </div>
        </div>
      </div>
    );
  }

  // If limit is 'unlimited', show ∞
  const limit = explanationCount.limit === 'unlimited' ? '∞' : explanationCount.limit;
  const used = explanationCount.used;
  const remaining = explanationCount.remaining === 'unlimited' ? '∞' : explanationCount.remaining;
  const percent = limit === '∞' ? 100 : Math.min(100, (used / limit) * 100);

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Free Plan Usage</h3>
        <span className="text-sm text-gray-600">
          {used}/{limit} used
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {remaining} explanations remaining
        </span>
        <button 
          onClick={() => window.location.href = '#pricing'}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
};

export default PlanUsage; 