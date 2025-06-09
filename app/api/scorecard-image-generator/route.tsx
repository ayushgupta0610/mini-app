import { ImageResponse } from '@vercel/og';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Recommended for @vercel/og

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // --- Get query parameters ---
    const score = searchParams.get('score');
    const totalQuestions = searchParams.get('totalQuestions');
    const username = searchParams.get('username');
    const pfpUrl = searchParams.get('pfpUrl'); // Optional
    const entryYear = searchParams.get('entryYear');
    const displayName = searchParams.get('displayName') || username; // Fallback to username

    if (!score || !totalQuestions || !username || !entryYear) {
      return new NextResponse(
        `Missing required query parameters. Received: score=${score}, totalQuestions=${totalQuestions}, username=${username}, entryYear=${entryYear}`,
        { status: 400 }
      );
    }

    const scoreNum = parseInt(score);
    const totalQuestionsNum = parseInt(totalQuestions);

    if (isNaN(scoreNum) || isNaN(totalQuestionsNum) || totalQuestionsNum === 0) {
      return new NextResponse('Invalid score or totalQuestions', { status: 400 });
    }
    const percentage = Math.round((scoreNum / totalQuestionsNum) * 100);

    // --- Font fetching (optional, but good for custom fonts) ---
    // For local fonts, place them in the `public` directory or alongside this route file.
    // Example: const interRegular = await fetch(new URL('../../../../public/fonts/Inter-Regular.otf', import.meta.url)).then(res => res.arrayBuffer());
    // Example: const interBold = await fetch(new URL('../../../../public/fonts/Inter-Bold.otf', import.meta.url)).then(res => res.arrayBuffer());

    // --- JSX for the image ---
    const imageJsx = (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1A1A',
          color: '#FFFFFF',
          fontFamily: 'sans-serif', // Using a generic sans-serif for broader compatibility without custom fonts
          padding: '40px',
          border: '3px solid #333333',
          borderRadius: '20px',
          position: 'relative', 
        }}
      >
        {pfpUrl && pfpUrl !== 'null' && pfpUrl !== 'undefined' && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pfpUrl}
              width={100}
              height={100}
              style={{
                borderRadius: '50%',
                marginBottom: '25px',
                border: '4px solid #4A4A4A',
              }}
              alt={displayName ? `${displayName}'s PFP` : 'User PFP'}
            />
          </>
        )}
        <h1 style={{ fontSize: '52px', margin: '0 0 15px 0', color: '#00E5FF', fontWeight: 700, textShadow: '2px 2px 4px #00000030' }}>
          Crypto Trivia Score!
        </h1>
        <p style={{ fontSize: '36px', margin: '0 0 25px 0', color: '#E0E0E0' }}>
          @{username} {displayName && displayName !== username ? `(${displayName})` : ''}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #2A2A2A, #1E1E1E)',
          padding: '20px 35px',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
          border: '1px solid #404040',
        }}>
          <p style={{ fontSize: '80px', fontWeight: 'bold', margin: '0', color: '#7FFF00', textShadow: '3px 3px 5px #00000050' }}>
            {scoreNum}
          </p>
          <p style={{ fontSize: '40px', margin: '0 0 0 12px', alignSelf: 'flex-end', paddingBottom: '12px', color: '#B0B0B0' }}>
            / {totalQuestionsNum}
          </p>
          <p style={{ fontSize: '36px', margin: '0 0 0 25px', color: '#FFD700', fontWeight: 'bold' }}>
            ({percentage}%)
          </p>
        </div>
        <p style={{ fontSize: '30px', margin: '0', textAlign: 'center', color: '#F0F0F0' }}>
          Crypto Entry Year Est: <span style={{ color: '#FF69B4', fontWeight: 'bold' }}>{entryYear}</span>
        </p>
        <p style={{ fontSize: '22px', marginTop: '35px', color: '#999999', position: 'absolute', bottom: '25px' }}>
          Play Crypto Trivia on Farcaster!
        </p>
      </div>
    );

    return new ImageResponse(imageJsx, {
      width: 1200,
      height: 630,
      // fonts: [
      //   { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      //   { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      // ],
      // debug: true, // Uncomment for debugging layout issues with @vercel/og
    });

  } catch (e: unknown) {
    let errorMessage = 'Failed to generate image';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error(`Error generating image: ${errorMessage}`, e);
    return new NextResponse(`Failed to generate image: ${errorMessage}`, { status: 500 });
  }
}
