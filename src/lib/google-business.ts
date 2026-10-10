import "server-only";

type GoogleText = {
  text?: string;
};

type GoogleAuthorAttribution = {
  displayName?: string;
  uri?: string;
};

type GooglePlacePhoto = {
  name?: string;
  authorAttributions?: GoogleAuthorAttribution[];
};

export type GoogleBusinessPhoto = {
  uri: string;
  authorAttributions: GoogleAuthorAttribution[];
};

type GoogleReview = {
  rating?: number;
  text?: GoogleText;
  authorAttribution?: GoogleAuthorAttribution;
  googleMapsUri?: string;
};

type GoogleOpeningHours = {
  weekdayDescriptions?: string[];
  openNow?: boolean;
};

type GooglePlaceResponse = {
  displayName?: GoogleText;
  primaryTypeDisplayName?: GoogleText;
  rating?: number;
  userRatingCount?: number;
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: GoogleOpeningHours;
  currentOpeningHours?: GoogleOpeningHours;
  reviews?: GoogleReview[];
  photos?: GooglePlacePhoto[];
  googleMapsUri?: string;
};

export type GoogleBusinessProfile = GooglePlaceResponse;

export type GoogleBusinessResult = {
  placeId: string | null;
  profile: GoogleBusinessProfile | null;
  photos: GoogleBusinessPhoto[];
  requestFailed: boolean;
};

const PLACE_DETAILS_FIELD_MASK = [
  "displayName",
  "primaryTypeDisplayName",
  "rating",
  "userRatingCount",
  "formattedAddress",
  "nationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours.weekdayDescriptions",
  "currentOpeningHours.openNow",
  "googleMapsUri",
  "reviews.rating",
  "reviews.text",
  "reviews.authorAttribution",
  "reviews.googleMapsUri",
  "photos.name",
  "photos.authorAttributions",
].join(",");

export async function getGoogleBusinessProfile(
  placeId: string | null,
): Promise<GoogleBusinessResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (!placeId || !apiKey) {
    return { placeId, profile: null, photos: [], requestFailed: false };
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": PLACE_DETAILS_FIELD_MASK,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      console.error("[google-business] Place Details request failed", {
        status: response.status,
      });
      return { placeId, profile: null, photos: [], requestFailed: true };
    }

    const profile = (await response.json()) as GooglePlaceResponse;
    const photos = await getPlacePhotos(profile.photos ?? [], placeId, apiKey);
    return { placeId, profile, photos, requestFailed: false };
  } catch (error) {
    console.error("[google-business] Place Details request failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return { placeId, profile: null, photos: [], requestFailed: true };
  }
}

async function getPlacePhotos(
  photos: GooglePlacePhoto[],
  placeId: string,
  apiKey: string,
): Promise<GoogleBusinessPhoto[]> {
  const names = photos
    .map((photo) => photo.name)
    .filter((name): name is string => Boolean(name))
    .filter((name) => {
      const segments = name.split("/");
      return segments.length === 4 &&
        segments[0] === "places" &&
        segments[1] === placeId &&
        segments[2] === "photos" &&
        Boolean(segments[3]);
    })
    .slice(0, 3);

  const results = await Promise.all(names.map(async (name) => {
    try {
      const path = name.split("/").map(encodeURIComponent).join("/");
      const response = await fetch(
        `https://places.googleapis.com/v1/${path}/media?maxWidthPx=800&skipHttpRedirect=true`,
        {
          headers: { "X-Goog-Api-Key": apiKey },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok) {
        console.error("[google-business] Place Photo request failed", {
          status: response.status,
        });
        return null;
      }

      const media = (await response.json()) as { photoUri?: string };
      const uri = getSafeGooglePhotoUri(media.photoUri);
      if (!uri) {
        console.error("[google-business] Place Photo response rejected", {
          reason: "invalid_photo_uri",
        });
        return null;
      }

      const source = photos.find((photo) => photo.name === name);
      return {
        uri,
        authorAttributions: (source?.authorAttributions ?? []).filter(
          (attribution) => Boolean(attribution.displayName),
        ),
      };
    } catch (error) {
      console.error("[google-business] Place Photo request failed", {
        reason: error instanceof Error ? error.name : "unknown",
      });
      return null;
    }
  }));

  return results.filter((photo): photo is GoogleBusinessPhoto => photo !== null);
}

export function getSafeGoogleUrl(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getSafeGooglePhotoUri(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const isGoogleusercontentHost =
      url.hostname === "googleusercontent.com" ||
      url.hostname.endsWith(".googleusercontent.com");
    if (
      url.protocol !== "https:" ||
      !isGoogleusercontentHost ||
      Boolean(url.port) ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
