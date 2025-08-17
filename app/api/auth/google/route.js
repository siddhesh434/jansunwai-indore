// app/api/auth/google/route.js
import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "../../../../lib/googleAuth";

export async function GET(request) {
  try {
    // Check if Google OAuth is properly configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth not configured - missing environment variables');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=oauth_init_failed`
      );
    }
    
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get('redirect') || '/dashboard';

    // Store redirect URL in session or pass as state parameter
    const state = Buffer.from(JSON.stringify({ redirect })).toString('base64');
    
    // Get Google OAuth URL
    const authUrl = getGoogleAuthUrl() + `&state=${state}`;
    console.log('Redirecting to Google OAuth:', authUrl);
    
    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_init_failed`
    );
  }
}
