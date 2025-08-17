// app/api/auth/google/callback/route.js
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import dbConnect from "../../../../../lib/dbConnect";
import { User } from "../../../../../models";
import { exchangeCodeForTokens, getUserInfo } from "../../../../../lib/googleAuth";

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
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('Google callback received:', { 
      code: !!code, 
      error, 
      state: state ? 'present' : 'missing' 
    });

    if (error) {
      console.log('OAuth error received:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_failed`
      );
    }

    if (!code) {
      console.log('No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_auth_code`
      );
    }

    // Parse state parameter to get redirect URL
    let redirectPath = '/dashboard'; // Default to path only
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        console.log('Decoded state:', stateData);
        
        if (stateData.redirect) {
          // If redirect is a full URL, extract just the path
          if (stateData.redirect.startsWith('http')) {
            const url = new URL(stateData.redirect);
            redirectPath = url.pathname + url.search + url.hash;
          } else {
            // If it's already a path, use it as is
            redirectPath = stateData.redirect;
          }
        }
      } catch (e) {
        console.warn('Failed to parse state parameter:', e);
        redirectPath = '/dashboard'; // Fallback
      }
    }

    console.log('Redirect path extracted:', redirectPath);

    await dbConnect();

    try {
      // Exchange authorization code for access token
      console.log('Exchanging code for tokens...');
      const tokens = await exchangeCodeForTokens(code);
      console.log('Tokens received:', { 
        access_token: tokens.access_token ? '***' : 'undefined', 
        token_type: tokens.token_type 
      });
      
      // Get user information from Google
      console.log('Fetching user info from Google...');
      const userInfo = await getUserInfo(tokens.access_token);
      console.log('User info received:', { 
        id: userInfo.id, 
        name: userInfo.name, 
        email: userInfo.email, 
        picture: userInfo.picture ? '***' : 'undefined' 
      });

      // Check if user already exists
      console.log('Checking if user exists in database...');
      let user = await User.findOne({ 
        $or: [
          { email: userInfo.email },
          { googleId: userInfo.id }
        ]
      });
      
      if (user) {
        console.log('Existing user found:', { 
          _id: user._id, 
          name: user.name, 
          username: user.username, 
          email: user.email,
          authMethod: user.authMethod 
        });
        
        // Update existing user's Google info if needed
        let needsUpdate = false;
        const updateData = {};
        
        if (!user.googleId && userInfo.id) {
          updateData.googleId = userInfo.id;
          needsUpdate = true;
        }
        
        if (!user.profilePicture && userInfo.picture) {
          updateData.profilePicture = userInfo.picture;
          needsUpdate = true;
        }
        
        if (user.authMethod === 'local') {
          updateData.authMethod = 'google';
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log('Updating user with Google info:', updateData);
          user = await User.findByIdAndUpdate(user._id, updateData, { new: true });
        }
      } else {
        // Create new user if they don't exist
        console.log('Creating new user...');
        
        // Generate unique username
        let baseUsername = userInfo.email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        
        // Check if username exists and make it unique
        while (await User.findOne({ username })) {
          username = `${baseUsername}_${counter}`;
          counter++;
        }
        
        const userData = {
          name: userInfo.name,
          username,
          email: userInfo.email,
          address: '',
          queries: [],
          googleId: userInfo.id,
          profilePicture: userInfo.picture,
          authMethod: 'google'
        };
        
        console.log('Creating user with data:', { 
          ...userData, 
          profilePicture: userData.profilePicture ? '***' : 'undefined' 
        });
        
        user = await User.create(userData);
        
        console.log('New user created:', { 
          _id: user._id, 
          name: user.name, 
          username: user.username, 
          email: user.email,
          authMethod: user.authMethod
        });
      }

      // Create JWT token for session
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        username: user.username,
        name: user.name
      };

      const jwtToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'your-jwt-secret-key',
        { expiresIn: '7d' }
      );

      // Build the final redirect URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const finalRedirectUrl = `${baseUrl}${redirectPath}`;
      
      console.log('Final redirect URL:', finalRedirectUrl);
      console.log('User successfully authenticated:', user._id);



      // Create HTML response with script to set localStorage and redirect
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redirecting...</title>
        </head>
        <body>
          <script>
            // Set localStorage for authentication
            localStorage.setItem('userId', '${user._id}');
            console.log('Google callback: Set localStorage userId:', '${user._id}');
            
            // Set HTTP-only cookie for session
            document.cookie = 'auth-token=${jwtToken}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}samesite=lax';
            
            // Set simple backup cookie
            document.cookie = 'google-auth-user-id=${user._id}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}samesite=lax';
            
            // Redirect to dashboard
            window.location.href = '${finalRedirectUrl}';
          </script>
          <p>Redirecting to dashboard...</p>
        </body>
        </html>
      `;

      return new NextResponse(htmlResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });

      return response;

    } catch (authError) {
      console.error('Google auth error:', authError);
      console.error('Auth error stack:', authError.stack);
      
      // More specific error handling
      let errorType = 'google_auth_failed';
      if (authError.message.includes('invalid_grant')) {
        errorType = 'oauth_init_failed';
      } else if (authError.message.includes('access_denied')) {
        errorType = 'oauth_init_failed';
      }
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${errorType}`
      );
    }

  } catch (error) {
    console.error('Google callback error:', error);
    console.error('Callback error stack:', error.stack);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`
    );
  }
}