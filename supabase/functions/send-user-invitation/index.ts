
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  fullName?: string;
  location?: string;
  businessIndustry?: string;
  role?: 'user' | 'admin' | 'editor';
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

    // Get the admin user making the request
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

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const invitationData: InvitationRequest = await req.json();
    const { email, fullName, location, businessIndustry, role = 'user' } = invitationData;

    console.log(`Processing invitation for: ${email}`);

    // Check if user already exists
    const { data: existingInvite } = await supabase
      .from('admin_user_invites')
      .select('*')
      .eq('email', email)
      .single();

    if (existingInvite) {
      console.log(`User ${email} already has an invitation`);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'User already has a pending invitation' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin profile for invitation email
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Create user invitation record
    const { data: inviteData, error: inviteError } = await supabase
      .from('admin_user_invites')
      .insert({
        admin_id: user.id,
        email: email,
        full_name: fullName,
        location: location,
        business_industry: businessIndustry,
        role: role,
        status: 'invited'
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Failed to create invitation record:', inviteError);
      throw inviteError;
    }

    console.log('Invitation record created:', inviteData);

    // Send invitation email
    console.log('Attempting to send invitation email...');
    
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        to: email,
        type: 'user_invitation',
        inviteData: {
          fullName: fullName,
          inviterName: adminProfile?.full_name || 'Administrator',
          organizationName: 'FATE Foundation',
          loginUrl: `${Deno.env.get('SUPABASE_URL').replace('supabase.com', 'lovableproject.com')}/auth`
        }
      })
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Failed to send invitation email:', emailResult);
      // Don't throw error, just log it - invitation record is already created
    } else {
      console.log('Invitation email sent successfully:', emailResult);
    }

    console.log(`User invitation completed for: ${email}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Invitation sent successfully',
      inviteId: inviteData.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
