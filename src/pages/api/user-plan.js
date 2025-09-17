import { supabase } from '../../lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  const { method } = req;

  // Check authentication using Clerk cookies (align with other routes)
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (method === 'GET') {
    // Get user's current plan
    try {
      const { data: plan, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching user plan:', error);
        return res.status(500).json({ error: 'Failed to fetch user plan', details: error.message });
      }

      // If no plan found, user is on free plan
      const currentPlan = plan || {
        plan_type: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: null
      };

      return res.status(200).json({
        plan: currentPlan,
        isPro: currentPlan.plan_type === 'pro',
        isActive: currentPlan.status === 'active'
      });

    } catch (error) {
      console.error('Error in GET /api/user-plan:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'POST') {
    // Upgrade user to Pro plan
    try {
      const { planType } = req.body;

      if (!planType || !['free', 'pro'].includes(planType)) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      // For now, we'll just create/update the plan in database
      // In a real implementation, you'd integrate with Stripe here
      
      const { data: existingPlan, error: fetchError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing plan:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch existing plan' });
      }

      if (existingPlan) {
        // Update existing plan
        const { data: updatedPlan, error: updateError } = await supabase
          .from('user_plans')
          .update({
            plan_type: planType,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPlan.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating plan:', updateError);
          return res.status(500).json({ error: 'Failed to update plan' });
        }

        return res.status(200).json({
          success: true,
          plan: updatedPlan,
          message: `Successfully updated to ${planType} plan`
        });
      } else {
        // Create new plan
        const { data: newPlan, error: insertError } = await supabase
          .from('user_plans')
          .insert([{
            user_id: userId,
            plan_type: planType,
            status: 'active',
            current_period_start: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating plan:', insertError);
          return res.status(500).json({ error: 'Failed to create plan' });
        }

        return res.status(200).json({
          success: true,
          plan: newPlan,
          message: `Successfully created ${planType} plan`
        });
      }

    } catch (error) {
      console.error('Error in POST /api/user-plan:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 