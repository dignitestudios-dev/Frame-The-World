import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function PUT(req: NextRequest) {
  try {
    const uploadUrl =
      req.headers.get("x-upload-url") ||
      req.nextUrl.searchParams.get("uploadUrl");
    const contentType =
      req.headers.get("content-type") || "application/octet-stream";

    if (!uploadUrl) {
      return NextResponse.json(
        { success: false, message: "Missing target upload URL" },
        { status: 400 }
      );
    }

    // Stream the body directly to S3 without buffering entire payload into memory
    let s3Response: Response;

    if (req.body) {
      s3Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: req.body,
        // @ts-expect-error duplex is required for streaming request bodies in Node.js
        duplex: "half",
      });
    } else {
      const buffer = await req.arrayBuffer();
      s3Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: Buffer.from(buffer),
      });
    }

    if (!s3Response.ok) {
      const errorText = await s3Response.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          message: `S3 storage returned status ${s3Response.status}: ${
            errorText || s3Response.statusText
          }`,
        },
        { status: s3Response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Uploaded to S3 successfully",
    });
  } catch (error: any) {
    console.error("Error in upload-s3 route:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error during upload",
      },
      { status: 500 }
    );
  }
}
