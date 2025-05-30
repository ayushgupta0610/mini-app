import { NextRequest, NextResponse } from "next/server";

interface CastScoreRequest {
  score: number;
  totalQuestions: number;
  entryYear: number | null;
  fid: string;
  username: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = (await req.json()) as CastScoreRequest;
    const { score, totalQuestions, entryYear, fid, username } = body;

    // Validate required fields
    if (!fid || score === undefined || totalQuestions === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct the cast message
    const percentage = Math.round((score / totalQuestions) * 100);
    const message = `I scored ${score}/${totalQuestions} (${percentage}%) on the Crypto Trivia Quiz! ${
      entryYear ? `According to my knowledge, I should have entered crypto in ${entryYear}.` : ""
    } Play now!`;

    // In a real implementation, you would use the Farcaster API to cast the message
    // For now, we'll just simulate a successful cast
    console.log(`Cast message for user ${fid} (${username}): ${message}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Score cast successfully",
      castText: message,
    });
  } catch (error) {
    console.error("Error casting score:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
