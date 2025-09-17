import { supabase } from '../lib/supabase';

export const checkPlanLimits = async (userId, action) => {
  try {
    // Get user's current plan
    const { data: plan, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user plan:', error);
      return { allowed: false, reason: 'Failed to fetch plan' };
    }

    const currentPlan = plan || { plan_type: 'free', status: 'active' };
    const isPro = currentPlan.plan_type === 'pro' && currentPlan.status === 'active';

    // Check if user can perform the action
    switch (action) {
      case 'create_explanation':
        if (isPro) {
          return { allowed: true };
        }
        
        // For free users, check explanation count
        const { data: explanationCount, error: countError } = await supabase
          .from('videos')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        if (countError) {
          console.error('Error counting explanations:', countError);
          return { allowed: false, reason: 'Failed to check usage' };
        }

        const monthlyCount = explanationCount?.length || 0;
        const freeLimit = 3;

        if (monthlyCount >= freeLimit) {
          return { 
            allowed: false, 
            reason: 'Monthly limit reached',
            details: {
              used: monthlyCount,
              limit: freeLimit,
              remaining: 0
            }
          };
        }

        return { 
          allowed: true,
          details: {
            used: monthlyCount,
            limit: freeLimit,
            remaining: freeLimit - monthlyCount
          }
        };

      case 'file_upload':
        return { allowed: isPro, reason: isPro ? null : 'File uploads require Pro plan' };

      case 'advanced_features':
        return { allowed: isPro, reason: isPro ? null : 'Advanced features require Pro plan' };

      default:
        return { allowed: false, reason: 'Unknown action' };
    }
  } catch (error) {
    console.error('Error in checkPlanLimits:', error);
    return { allowed: false, reason: 'Internal error' };
  }
};

export const incrementUsage = async (userId, action) => {
  // This would typically update usage tracking
  // For now, we'll just log the action
  console.log(`User ${userId} performed action: ${action}`);
  return true;
}; 