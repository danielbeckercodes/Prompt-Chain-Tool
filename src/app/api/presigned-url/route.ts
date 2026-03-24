import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const API_URL =
  "https://api.almostcrackd.ai/pipeline/generate-presigned-url";

export async function POST(request: Request) {
  let body: { contentType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { contentType } = body;

  if (!contentType || !contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "contentType is required and must be an image type" },
      { status: 400 }
    );
  }

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
    console.error("Auth error in /api/presigned-url:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  try {
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ contentType }),
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
      { error: "Failed to reach presigned URL API" },
      { status: 502 }
    );
  }
}
