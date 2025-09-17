import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Test Auth API: Request received');
  console.log('Test Auth API: Request headers:', {
    authorization: req.headers.authorization ? 'present' : 'missing',
    'x-clerk-auth-token': req.headers['x-clerk-auth-token'] ? 'present' : 'missing',
    cookie: req.headers.cookie ? 'present' : 'missing',
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
  });

  try {
    const auth = getAuth(req);
    
    console.log('Test Auth API: Auth object:', {
      userId: auth.userId,
      sessionId: auth.sessionId,
      actor: auth.actor,
      sessionClaims: auth.sessionClaims ? 'present' : 'missing',
      session: auth.session ? 'present' : 'missing',
      user: auth.user ? 'present' : 'missing'
    });

    if (auth.userId) {
      console.log('Test Auth API: Authentication successful');
      return res.status(200).json({
        success: true,
        userId: auth.userId,
        sessionId: auth.sessionId,
        message: 'Authentication successful'
      });
    } else {
      console.log('Test Auth API: No userId found');
      console.log('Test Auth API: Full auth object:', JSON.stringify(auth, null, 2));
      
      return res.status(401).json({
        success: false,
        error: 'No userId found',
        authObject: {
          hasUserId: !!auth.userId,
          hasSessionId: !!auth.sessionId,
          hasSession: !!auth.session,
          hasUser: !!auth.user,
          hasSessionClaims: !!auth.sessionClaims
        },
        suggestion: 'Please refresh the page and try again'
      });
    }
  } catch (error) {
    console.error('Test Auth API: Error:', error);
    console.error('Test Auth API: Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error.message,
      stack: error.stack,
      suggestion: 'Please refresh the page and try again'
    });
  }
} 