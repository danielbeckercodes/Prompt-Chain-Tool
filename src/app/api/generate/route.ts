import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const API_URL = "https://api.almostcrackd.ai/pipeline/generate-captions";

export async function POST(request: Request) {
  // Parse request body first (before touching cookies)
  let body: { humor_flavor_id?: number; image_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { humor_flavor_id, image_id } = body;

  if (!humor_flavor_id || !image_id) {
    return NextResponse.json(
      { error: "humor_flavor_id and image_id are required" },
      { status: 400 }
    );
  }

  // Get session for auth token
  let accessToken: string;
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    accessToken = session.access_token;
  } catch (err) {
    console.error("Auth error in /api/generate:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  // Forward to external API
  try {
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        humorFlavorId: humor_flavor_id,
        imageId: image_id,
      }),
    });

    const responseText = await apiResponse.text();

    if (!apiResponse.ok) {
      console.error(
        `External API error: ${apiResponse.status} ${apiResponse.statusText}`,
        responseText
      );
      let errorJson;
      try {
        errorJson = JSON.parse(responseText);
      } catch {
        errorJson = {
          error: responseText || `API returned status ${apiResponse.status}`,
        };
      }
      return NextResponse.json(errorJson, { status: apiResponse.status });
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data);
  } catch (err) {
    console.error("External API fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach caption generation API" },
      { status: 502 }
    );
  }
}
