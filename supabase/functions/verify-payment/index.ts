
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
  reference: string;
  plan_id: string;
  amount: number;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is an admin first
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (adminRole) {
      // Admin users bypass payment completely
      console.log(`Admin user detected: ${user.email}, bypassing payment`);
      
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: 'lifetime',
          status: 'active',
          payment_reference: 'admin_bypass',
          amount: 0,
          currency: 'NGN',
          expires_at: null
        });

      if (subscriptionError) {
        console.error('Subscription error for admin:', subscriptionError);
        throw subscriptionError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          payment_status: 'paid',
          subscription_expires_at: null
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error for admin:', profileError);
        throw profileError;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin user activated with lifetime access',
        subscription_type: 'lifetime',
        bypass_payment: true,
        admin_bypass: true
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Check if this user was created by an admin (existing functionality)
    const { data: inviteData } = await supabase
      .from('admin_user_invites')
      .select('*')
      .eq('email', user.email)
      .single();

    if (inviteData) {
      console.log(`Admin-invited user detected: ${user.email}, bypassing payment`);
      
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: 'lifetime',
          status: 'active',
          payment_reference: 'admin_invite',
          amount: 0,
          currency: 'NGN',
          expires_at: null
        });

      if (subscriptionError) {
        console.error('Subscription error for admin invite:', subscriptionError);
        throw subscriptionError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          payment_status: 'paid',
          subscription_expires_at: null
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error for admin invite:', profileError);
        throw profileError;
      }

      await supabase
        .from('admin_user_invites')
        .update({ status: 'completed' })
        .eq('email', user.email);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin-invited user activated with lifetime access',
        subscription_type: 'lifetime',
        bypass_payment: true
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Regular user signup - require payment verification
    const { reference, plan_id, amount, currency }: PaymentVerificationRequest = await req.json();

    // Verify payment with Paystack
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const verificationResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verificationResponse.ok) {
      throw new Error('Payment verification failed');
    }

    const verificationData = await verificationResponse.json();

    if (verificationData.status !== true || verificationData.data.status !== 'success') {
      throw new Error('Payment was not successful');
    }

    // Validate amount and currency
    const expectedAmount = amount * 100; // Convert to kobo
    if (verificationData.data.amount !== expectedAmount || verificationData.data.currency !== currency) {
      throw new Error('Payment amount or currency mismatch');
    }

    // For one-time payment, set no expiry (lifetime access)
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        subscription_type: 'lifetime',
        status: 'active',
        payment_reference: reference,
        amount: amount,
        currency: currency,
        expires_at: null
      });

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        payment_status: 'paid',
        subscription_expires_at: null
      })
      .eq('id', user.id);

    if (profileError) {
      throw profileError;
    }

    console.log(`Payment verified for user: ${user.email}, Reference: ${reference}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified and lifetime access activated',
      subscription_type: 'lifetime'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in verify-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
