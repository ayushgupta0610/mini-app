import { NextRequest, NextResponse } from "next/server";

interface CastScoreRequest {
  score: number;
  totalQuestions: number;
  entryYear: number | null;
  fid: string;
  username: string | null;
  displayName?: string | null; // Optional: For a more complete name on the image
  pfpUrl?: string | null;      // Optional: For displaying user's PFP on the image
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = (await req.json()) as CastScoreRequest;
    const { score, totalQuestions, entryYear, fid, username, displayName, pfpUrl } = body;

    // Validate required fields
    if (fid === undefined || score === undefined || totalQuestions === undefined || username === undefined || entryYear === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const castText = `I scored ${score}/${totalQuestions} (${percentage}%) on Crypto Trivia! My crypto entry year est: ${entryYear}. Can you beat my score?`;

    // Construct the URL for the scorecard image generator
    // Ensure NEXT_PUBLIC_BASE_URL is set in your environment variables and includes the protocol (e.g., https://your-app-url.vercel.app)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Fallback for local dev
    const imageUrlParams = new URLSearchParams({
      score: score.toString(),
      totalQuestions: totalQuestions.toString(),
      username: username || 'anon',
      entryYear: entryYear?.toString() || 'N/A',
      ...(displayName && { displayName }),
      ...(pfpUrl && { pfpUrl }),
    });
    const imageUrl = `${baseUrl}/api/scorecard-image-generator?${imageUrlParams.toString()}`;

    // Define the "Play Again!" button for the frame
    // This should link to your app's main page or quiz start page
    const playAgainUrl = `${baseUrl}/`; // Adjust if your app's quiz page is different

    console.log(`Generated scorecard image URL for user ${fid} (${username}): ${imageUrl}`);
    console.log(`Cast text for user ${fid} (${username}): ${castText}`);

    // Return Farcaster Frame metadata
    return NextResponse.json({
      success: true,
      message: "Frame data prepared successfully for casting.",
      frame: {
        version: "vNext", // Or your specific frame version
        image: imageUrl,
        image_aspect_ratio: "1.91:1",
        post_url: playAgainUrl, // URL to post to when a button is clicked (can also be used for state)
        buttons: [
          {
            label: "Play Again!",
            action: "post_redirect", // Redirects user after clicking
          },
          // You can add more buttons, e.g., a share button if your frame client supports it
          // {
          //   label: "Share",
          //   action: "share", // This action type might depend on the client (e.g., Warpcast)
          //   target: `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(imageUrl)}`
          // }
        ],
        input: {
          text: "Tell your frens!" // Optional input field
        },
        // You might need to set the state if your frame interactions are more complex
        // state: JSON.stringify({ score, totalQuestions, userFid: fid }), 
      },
      castText: castText, // The text that will accompany the frame in the cast
    });
  } catch (error) {
    console.error("Error casting score:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
