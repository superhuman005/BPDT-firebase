
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get users with incomplete plans
    const { data: incompleteUsers, error } = await supabase
      .rpc('get_users_with_incomplete_plans');

    if (error) throw error;

    let emailsSent = 0;

    for (const user of incompleteUsers || []) {
      try {
        // Check if we've already sent a reminder in the last week
        const { data: recentNotifications } = await supabase
          .from('email_notifications')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('notification_type', 'incomplete_plan_reminder')
          .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (recentNotifications && recentNotifications.length > 0) {
          continue; // Skip if we've sent a reminder recently
        }

        // Send reminder email
        const reminderHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Complete Your Business Plan</h2>
            <p>Hi there!</p>
            <p>We noticed you started creating a business plan but haven't finished it yet. Don't let your great ideas go to waste!</p>
            <p>Complete your business plan to:</p>
            <ul>
              <li>Clarify your business vision</li>
              <li>Attract potential investors</li>
              <li>Guide your business decisions</li>
              <li>Download your professional PDF</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://localhost:3000'}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Your Plan
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you're no longer interested in completing your business plan, you can safely ignore this email.
            </p>
          </div>
        `;

        const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            to: user.user_email,
            subject: '📝 Complete Your Business Plan - Don\'t Miss Out!',
            html: reminderHtml,
            type: 'incomplete_plan_reminder',
            userId: user.user_id
          })
        });

        if (emailResponse.ok) {
          emailsSent++;
        }
      } catch (error) {
        console.error(`Failed to send reminder to ${user.user_email}:`, error);
      }
    }

    return new Response(JSON.stringify({ 
      message: `Sent ${emailsSent} reminder emails`,
      processed: incompleteUsers?.length || 0
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-incomplete-plan-reminder function:", error);
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
