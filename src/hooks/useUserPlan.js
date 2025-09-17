'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

export const useUserPlan = () => {
  const { user, isLoaded } = useUser();
  const { getToken, signOut } = useAuth();
  const [userPlan, setUserPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState({ used: 0, limit: 3, remaining: 3, isPro: false });

  // Force refresh session by signing out and redirecting to sign-in
  const forceRefreshSession = async () => {
    console.log('Forcing session refresh...');
    await signOut();
    window.location.href = '/sign-in';
  };

  // Fetch user's current plan
  const fetchUserPlan = async () => {
    if (!isLoaded || !user) {
      console.log('Clerk not ready or user not signed in:', { isLoaded, isSignedIn: !!user });
      setUserPlan({ plan_type: 'free', status: 'active' });
      setIsLoading(false);
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        console.log('Token status:', { hasToken: !!token, tokenLength: token?.length });
        
        if (!token) {
          console.error('No token found');
          setUserPlan({ plan_type: 'free', status: 'active' });
          setError('Authentication failed. Please sign in again.');
          break;
        }

        const response = await fetch('/api/user-plan', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('API response status:', response.status);

        if (response.status === 401) {
          // Authentication error - might be Clerk refreshing
          retryCount++;
          if (retryCount < maxRetries) {
            console.log('User plan: Auth error, retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            console.error('User plan: Authentication failed after retries');
            setUserPlan({ plan_type: 'free', status: 'active' });
            setError('Authentication failed. Please refresh the page.');
            // Force session refresh on persistent auth failures
            await forceRefreshSession();
            break;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('User plan API error:', response.status, errorData);
          throw new Error(`Failed to fetch user plan: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('User plan data received:', data);
        setUserPlan(data.plan);
        break; // Success, exit retry loop

      } catch (err) {
        console.error('Error fetching user plan:', err);
        retryCount++;
        if (retryCount < maxRetries) {
          console.log('User plan: Fetch error, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          setError(err.message);
          // Default to free plan on error
          setUserPlan({ plan_type: 'free', status: 'active' });
        }
      }
    }
    
    setIsLoading(false);
  };

  // Fetch user's usage (real count)
  const fetchUsage = async () => {
    if (!isLoaded || !user) {
      setUsage({ used: 0, limit: 3, remaining: 3, isPro: false });
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const token = await getToken();
        if (!token) {
          console.error('No token found');
          setUsage({ used: 0, limit: 3, remaining: 3, isPro: false });
          break;
        }

        const response = await fetch('/api/plan-usage', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          // Authentication error - might be Clerk refreshing
          retryCount++;
          if (retryCount < maxRetries) {
            console.log('Plan usage: Auth error, retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            console.error('Plan usage: Authentication failed after retries');
            setUsage({ used: 0, limit: 3, remaining: 3, isPro: false });
            // Force session refresh on persistent auth failures
            await forceRefreshSession();
            break;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Plan usage API error:', response.status, errorData);
          throw new Error(`Failed to fetch plan usage: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        setUsage({
          used: data.used,
          limit: data.limit,
          remaining: data.remaining,
          isPro: data.isPro
        });
        break; // Success, exit retry loop

      } catch (err) {
        console.error('Error fetching plan usage:', err);
        retryCount++;
        if (retryCount < maxRetries) {
          console.log('Plan usage: Fetch error, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          setUsage({ used: 0, limit: 3, remaining: 3, isPro: false });
        }
      }
    }
  };

  // Update user's plan
  const updateUserPlan = async (planType) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const data = await response.json();
      setUserPlan(data.plan);
      // Refetch usage after plan change
      fetchUsage();
      return data;
    } catch (err) {
      console.error('Error updating user plan:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has Pro plan
  const isPro = userPlan?.plan_type === 'pro' && userPlan?.status === 'active';
  
  // Check if user has active plan
  const isActive = userPlan?.status === 'active';

  // Check if user can perform action based on plan
  const canPerformAction = (action) => {
    if (!isActive) return false;
    
    switch (action) {
      case 'unlimited_explanations':
        return isPro;
      case 'file_uploads':
        return isPro;
      case 'advanced_features':
        return isPro;
      case 'basic_explanations':
        return true; // Both plans can do basic explanations
      default:
        return false;
    }
  };

  // Get explanation count for free users (now real)
  const getExplanationCount = () => usage;

  useEffect(() => {
    if (isLoaded && user) {
      // Add a small delay to ensure Clerk session is fully established
      const timer = setTimeout(() => {
        console.log('useUserPlan: Clerk loaded, session established, fetching plan data');
        fetchUserPlan();
        fetchUsage();
      }, 1000); // 1 second delay to ensure session is fully ready
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [isLoaded, user]);

  return {
    userPlan,
    isLoading,
    error,
    isPro,
    isActive,
    canPerformAction,
    getExplanationCount,
    updateUserPlan,
    fetchUserPlan,
    fetchUsage,
  };
}; 