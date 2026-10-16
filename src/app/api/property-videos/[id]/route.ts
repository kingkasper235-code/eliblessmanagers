import { createServerSupabaseClient } from "@/lib/supabase-server";
import { PROPERTY_VIDEO_BUCKET } from "@/lib/property-videos";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const videoId = Number(rawId);

  if (!Number.isSafeInteger(videoId) || videoId <= 0) {
    return new Response("Video not found.", { status: 404 });
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return new Response("Video playback is not configured.", { status: 503 });
  }

  const { data: video, error: videoError } = await supabase
    .from("property_videos")
    .select("storage_path")
    .eq("id", videoId)
    .eq("source_type", "upload")
    .eq("upload_status", "ready")
    .maybeSingle();

  if (videoError) {
    console.error("[Property video playback] Database lookup failed", {
      videoId,
      errorMessage: videoError.message,
    });
    return new Response("Unable to load this video.", { status: 503 });
  }

  if (!video?.storage_path) {
    return new Response("Video not found.", { status: 404 });
  }

  const { data: signedVideo, error: signingError } = await supabase.storage
    .from(PROPERTY_VIDEO_BUCKET)
    .createSignedUrl(video.storage_path, 60);

  if (signingError || !signedVideo) {
    console.error("[Property video playback] Storage authorization failed", {
      videoId,
      errorMessage: signingError?.message ?? "Unable to sign the video request.",
    });
    return new Response("Unable to load this video.", { status: 503 });
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("range");
  const ifRange = request.headers.get("if-range");

  if (range) {
    upstreamHeaders.set("range", range);
  }
  if (ifRange) {
    upstreamHeaders.set("if-range", ifRange);
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(signedVideo.signedUrl, {
      headers: upstreamHeaders,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[Property video playback] Storage request failed", {
      videoId,
      reason: error instanceof Error ? error.message : "Unknown network error.",
    });
    return new Response("Unable to load this video.", { status: 502 });
  }

  if (!upstreamResponse.ok && upstreamResponse.status !== 416) {
    console.error("[Property video playback] Storage returned an error", {
      videoId,
      status: upstreamResponse.status,
    });
    return new Response("Unable to load this video.", {
      status: upstreamResponse.status === 404 ? 404 : 502,
    });
  }

  const responseHeaders = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });

  for (const header of [
    "accept-ranges",
    "content-length",
    "content-range",
    "content-type",
    "etag",
    "last-modified",
  ]) {
    const value = upstreamResponse.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
