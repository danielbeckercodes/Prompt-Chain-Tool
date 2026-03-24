import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_BASE_URL = "https://api.almostcrackd.ai/pipeline/generate-captions";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { humor_flavor_id, image_id } = body;

    if (!humor_flavor_id || !image_id) {
      return NextResponse.json(
        { error: "humor_flavor_id and image_id are required" },
        { status: 400 }
      );
    }

    // Forward request to the REST API with user's Bearer token
    const apiResponse = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        humorFlavorId: humor_flavor_id,
        imageId: image_id,
      }),
    });

    // If the API returns an error, try to parse and forward it
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText || `API returned status ${apiResponse.status}` };
      }
      return NextResponse.json(errorJson, { status: apiResponse.status });
    }

    // Parse and return the successful response
    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}
