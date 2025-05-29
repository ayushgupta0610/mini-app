import { NextRequest, NextResponse } from 'next/server';

// Define the structure of a Farcaster Frame message
interface FrameMessage {
  untrustedData: {
    buttonIndex?: number;
    inputText?: string;
    // fid is used for identification but we're not using it in this demo
    // keeping it in the type for documentation purposes
    fid?: number;
    url?: string;
  };
  trustedData?: {
    messageBytes?: string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the incoming request
    const body = await req.json() as FrameMessage;
    const { buttonIndex, inputText } = body.untrustedData;
    // We're not using fid in this implementation, but it would be used
    // to identify the user in a real-world implementation

    // Default frame response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-deployment-url.com';
    
    // Handle different button actions
    if (buttonIndex === 1) {
      // Start quiz button was clicked
      return NextResponse.json({
        frames: {
          version: 'vNext',
          image: `${baseUrl}/og-image.png`,
          buttons: [
            {
              label: 'Take the Quiz',
              action: 'post'
            }
          ],
          postUrl: `${baseUrl}/api/frame`,
        }
      });
    } else if (inputText) {
      // Handle shared result from the quiz
      return NextResponse.json({
        frames: {
          version: 'vNext',
          image: `${baseUrl}/og-image.png`,
          buttons: [
            {
              label: 'Take the Quiz',
              action: 'post'
            }
          ],
          postUrl: `${baseUrl}/api/frame`,
        }
      });
    }

    // Default response
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/og-image.png`,
        buttons: [
          {
            label: 'Start Quiz',
            action: 'post'
          }
        ],
        postUrl: `${baseUrl}/api/frame`,
      }
    });
  } catch (error) {
    console.error('Error processing frame request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
