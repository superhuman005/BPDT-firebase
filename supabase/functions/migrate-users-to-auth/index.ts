
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MigrationRequest {
  userId?: number;
  migrateAll?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Migration function started');

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client for checking user permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Invalid authorization:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('User authenticated:', user.email);

    // Check if user is admin using a simpler approach
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error checking user role:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify admin permissions' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isAdmin = roleData?.some(role => role.role === 'admin');
    if (!isAdmin) {
      console.log('User is not admin:', user.email);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Admin access confirmed');

    // Parse request body
    let requestBody: MigrationRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { userId, migrateAll } = requestBody;

    let usersToMigrate = [];

    if (userId) {
      console.log('Migrating specific user:', userId);
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch user:', error);
        return new Response(JSON.stringify({ error: `User not found: ${error.message}` }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      usersToMigrate = [data];
    } else if (migrateAll) {
      console.log('Migrating all users');
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('id');

      if (error) {
        console.error('Failed to fetch users:', error);
        return new Response(JSON.stringify({ error: `Failed to fetch users: ${error.message}` }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      usersToMigrate = data || [];
    } else {
      return new Response(JSON.stringify({ error: 'Please specify userId or set migrateAll to true' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    const results = [];

    for (const legacyUser of usersToMigrate) {
      try {
        console.log(`Processing user: ${legacyUser.email}`);

        // Check if user already exists in auth
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('Failed to list existing users:', listError);
          results.push({
            email: legacyUser.email,
            status: 'failed',
            error: `Failed to check existing users: ${listError.message}`
          });
          continue;
        }

        const existingUser = existingUsers.users?.find(u => u.email === legacyUser.email);
        
        if (existingUser) {
          console.log(`User ${legacyUser.email} already exists in auth`);
          results.push({
            email: legacyUser.email,
            status: 'skipped',
            reason: 'Already exists in auth'
          });
          continue;
        }

        // Generate temporary password
        const tempPassword = `temp_${Math.random().toString(36).substring(2, 15)}`;

        // Create user in Supabase Auth
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: legacyUser.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: `${legacyUser.firstname || ''} ${legacyUser.lastname || ''}`.trim(),
            username: legacyUser.username,
            migrated_from_legacy: true,
            legacy_user_id: legacyUser.id,
            requires_password_reset: true
          }
        });

        if (createError) {
          console.error(`Failed to create auth user for ${legacyUser.email}:`, createError);
          results.push({
            email: legacyUser.email,
            status: 'failed',
            error: createError.message
          });
          continue;
        }

        console.log(`Created auth user for: ${legacyUser.email}`);

        // Update profiles table
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: authUser.user.id,
            email: legacyUser.email,
            full_name: `${legacyUser.firstname || ''} ${legacyUser.lastname || ''}`.trim(),
            location: legacyUser.location,
            payment_status: 'active'
          });

        if (profileError) {
          console.error(`Failed to create profile for ${legacyUser.email}:`, profileError);
        }

        // Create user profile entry
        const { error: userProfileError } = await supabaseAdmin
          .from('user_profiles')
          .upsert({
            user_id: authUser.user.id,
            email: legacyUser.email,
            full_name: `${legacyUser.firstname || ''} ${legacyUser.lastname || ''}`.trim(),
            username: legacyUser.username,
            location: legacyUser.location,
            gender: legacyUser.gender,
            profile_completed: true
          });

        if (userProfileError) {
          console.error(`Failed to create user profile for ${legacyUser.email}:`, userProfileError);
        }

        // Set user role
        const userRole = legacyUser.role === 'admin' ? 'admin' : 'user';
        const { error: roleInsertError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authUser.user.id,
            role: userRole
          });

        if (roleInsertError) {
          console.error(`Failed to set role for ${legacyUser.email}:`, roleInsertError);
        }

        // Initialize download limits
        const { error: downloadLimitError } = await supabaseAdmin
          .from('user_download_limits')
          .insert({
            user_id: authUser.user.id,
            downloads_remaining: 3,
            downloads_used: legacyUser.downloads || 0
          });

        if (downloadLimitError) {
          console.error(`Failed to set download limits for ${legacyUser.email}:`, downloadLimitError);
        }

        results.push({
          email: legacyUser.email,
          status: 'success',
          authUserId: authUser.user.id,
          tempPassword: tempPassword,
          role: userRole
        });

      } catch (error: any) {
        console.error(`Error migrating user ${legacyUser.email}:`, error);
        results.push({
          email: legacyUser.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    console.log(`Migration completed: ${successCount} successful, ${failedCount} failed, ${skippedCount} skipped`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failedCount,
        skipped: skippedCount
      },
      results: results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Unexpected error in migrate-users-to-auth function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
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
