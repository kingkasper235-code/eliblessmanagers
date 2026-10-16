export const PROPERTY_VIDEO_BUCKET = "property-videos";
export const PROPERTY_VIDEO_MAX_SIZE_MB = 50;

export function getPropertyVideoMaxSizeBytes() {
  const configuredSize = Number(process.env.NEXT_PUBLIC_PROPERTY_VIDEO_MAX_SIZE_MB);
  const sizeInMb =
    Number.isFinite(configuredSize) && configuredSize >= 1
      ? Math.min(Math.floor(configuredSize), PROPERTY_VIDEO_MAX_SIZE_MB)
      : PROPERTY_VIDEO_MAX_SIZE_MB;

  return sizeInMb * 1024 * 1024;
}

export function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null;
    }

    if (host === "youtu.be" || host === "www.youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com" ||
      host === "www.youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [, format, pathVideoId] = url.pathname.split("/");
        if (format === "embed" || format === "shorts" || format === "live") {
          videoId = pathVideoId ?? null;
        }
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
