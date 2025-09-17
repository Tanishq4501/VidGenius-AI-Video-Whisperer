import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get user's current plan
    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError && planError.code !== 'PGRST116') {
      console.error('Error fetching user plan:', planError);
      return res.status(500).json({ error: 'Failed to fetch user plan', details: planError.message });
    }

    const currentPlan = plan || { plan_type: 'free', status: 'active' };
    const isPro = currentPlan.plan_type === 'pro' && currentPlan.status === 'active';
    const freeLimit = 3;

    // For free users, check explanation count for this month
    let used = 0;
    if (!isPro) {
      const { data: videos, error: countError } = await supabase
        .from('videos')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('uploaded_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      if (countError) {
        console.error('Error counting explanations:', countError);
        return res.status(500).json({ error: 'Failed to check usage' });
      }
      used = videos?.length || 0;
    }

    res.status(200).json({
      plan: currentPlan.plan_type,
      isPro,
      used: isPro ? 0 : used,
      limit: isPro ? 'unlimited' : freeLimit,
      remaining: isPro ? 'unlimited' : Math.max(0, freeLimit - used)
    });
  } catch (error) {
    console.error('Error in GET /api/plan-usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 