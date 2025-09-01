
// import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { Resend } from "npm:resend@2.0.0";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
// };

// interface EmailRequest {
//   to: string;
//   subject: string;
//   html: string;
//   type: 'welcome' | 'password_reset' | 'incomplete_plan_reminder' | 'user_invitation';
//   userId?: string;
//   inviteData?: {
//     inviterName?: string;
//     organizationName?: string;
//     loginUrl?: string;
//     tempPassword?: string;
//   };
// }

// const getEmailTemplate = (type: string, data: any) => {
//   switch (type) {
//     case 'user_invitation':
//       return {
//         subject: 'Welcome to Business Plan Generator Tool',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//             <div style="text-align: center; margin-bottom: 30px;">
//               <img src="https://msmehub.org/wp-content/uploads/2025/01/cropped-msme_logo-1-300x84.png" alt="MSME Hub Logo" style="height: 60px;">
//             </div>
            
//             <h1 style="color: #364693; text-align: center; margin-bottom: 30px;">Welcome to Business Plan Generator Tool</h1>
            
//             <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
//               <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
//                 Hello ${data.fullName || 'there'},
//               </p>
              
//               <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
//                 You've been invited to join the Business Plan Generator Tool by ${data.inviterName || 'an administrator'}. 
//                 This professional platform will help you create comprehensive, investor-ready business plans.
//               </p>
              
//               <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
//                 To get started, please click the button below to access your account:
//               </p>
              
//               <div style="text-align: center; margin: 25px 0;">
//                 <a href="${data.loginUrl || 'https://businessdevelopertool.fatefoundation.org/auth'}" 
//                    style="background: linear-gradient(to right, #364693, #a43579); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                   Access Your Account
//                 </a>
//               </div>
//             </div>
            
//             <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
//               <h3 style="color: #364693; margin: 0 0 15px 0;">What you can do:</h3>
//               <ul style="margin: 0; padding-left: 20px;">
//                 <li style="margin-bottom: 8px;">Create comprehensive business plans with 16 key sections</li>
//                 <li style="margin-bottom: 8px;">Get AI-powered suggestions and guidance</li>
//                 <li style="margin-bottom: 8px;">Download professional PDF documents</li>
//                 <li style="margin-bottom: 8px;">Save and manage multiple business plans</li>
//               </ul>
//             </div>
            
//             <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
//               If you have any questions, please don't hesitate to reach out to our support team.
//             </p>
            
//             <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//               <p style="font-size: 12px; color: #999; margin: 0;">
//                 © 2025 FATE Foundation. All rights reserved.
//               </p>
//             </div>
//           </div>
//         `
//       };
      
//     case 'password_reset':
//       return {
//         subject: 'Reset Your Password - Business Plan Generator',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//             <div style="text-align: center; margin-bottom: 30px;">
//               <img src="https://msmehub.org/wp-content/uploads/2025/01/cropped-msme_logo-1-300x84.png" alt="MSME Hub Logo" style="height: 60px;">
//             </div>
            
//             <h1 style="color: #364693; text-align: center; margin-bottom: 30px;">Reset Your Password</h1>
            
//             <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
//               <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
//                 Hello,
//               </p>
              
//               <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
//                 We received a request to reset your password for your Business Plan Generator Tool account.
//               </p>
              
//               <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
//                 Click the button below to reset your password. This link will expire in 60 minutes for security reasons.
//               </p>
              
//               <div style="text-align: center; margin: 25px 0;">
//                 <a href="${data.resetUrl}" 
//                    style="background: linear-gradient(to right, #364693, #a43579); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//                   Reset Password
//                 </a>
//               </div>
//             </div>
            
//             <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
//               <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #856404;">
//                 <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. 
//                 Your password will remain unchanged.
//               </p>
//             </div>
            
//             <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
//               If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
//               <span style="word-break: break-all; color: #364693;">${data.resetUrl}</span>
//             </p>
            
//             <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//               <p style="font-size: 12px; color: #999; margin: 0;">
//                 © 2025 FATE Foundation. All rights reserved.
//               </p>
//             </div>
//           </div>
//         `
//       };
      
//     default:
//       return { subject: data.subject || 'Notification', html: data.html || '' };
//   }
// };

// const handler = async (req: Request): Promise<Response> => {
//   // Handle CORS preflight requests
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     const requestData: EmailRequest = await req.json();
//     const { to, type, userId, inviteData } = requestData;

//     let emailContent;
    
//     if (type === 'user_invitation' || type === 'password_reset') {
//       emailContent = getEmailTemplate(type, inviteData || requestData);
//     } else {
//       emailContent = {
//         subject: requestData.subject,
//         html: requestData.html
//       };
//     }

//     const emailResponse = await resend.emails.send({
//       from: "Business Plan Generator <onboarding@resend.dev>",
//       to: [to],
//       subject: emailContent.subject,
//       html: emailContent.html,
//     });

//     // Log the email notification
//     if (userId) {
//       const supabase = createClient(
//         Deno.env.get('SUPABASE_URL') ?? '',
//         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
//       );

//       await supabase
//         .from('email_notifications')
//         .insert({
//           user_id: userId,
//           user_email: to,
//           notification_type: type,
//           status: 'sent'
//         });
//     }

//     console.log("Email sent successfully:", emailResponse);

//     return new Response(JSON.stringify(emailResponse), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         ...corsHeaders,
//       },
//     });
//   } catch (error: any) {
//     console.error("Error in send-email function:", error);
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json", ...corsHeaders },
//       }
//     );
//   }
// };

// serve(handler);
