"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  beginPropertyVideoUploadAction,
  completePropertyVideoUploadAction,
  createPropertyVideoUploadAction,
  createYouTubePropertyVideoAction,
  deletePropertyVideoAction,
  failPropertyVideoUploadAction,
  savePropertyAction,
  updatePropertyVideoAction,
} from "@/lib/admin-actions";
import {
  getPropertyVideoMaxSizeBytes,
  getYouTubeEmbedUrl,
  PROPERTY_VIDEO_BUCKET,
} from "@/lib/property-videos";
import { getSupabaseConfig } from "@/lib/supabase";
import { supabaseBrowser } from "@/lib/supabase-browser";

type GalleryImage = {
  id: string;
  url: string;
  display_order: number;
  is_primary: boolean;
};

type ManagedVideo = {
  id: number;
  property_id: number;
  storage_path: string | null;
  source_type: "upload" | "youtube";
  video_url: string | null;
  title: string;
  display_order: number;
  upload_status: "pending" | "ready" | "failed";
  replaces_video_id: number | null;
  created_at: string;
};

type PendingVideo = {
  localId: string;
  file: File;
  previewUrl: string;
  title: string;
  replacesVideoId: number | null;
  videoId: number | null;
  storagePath: string | null;
  progress: number;
  status: "queued" | "uploading" | "saving" | "failed";
  error: string | null;
};

function normalizePropertyVideos(defaultValues?: Record<string, unknown>): ManagedVideo[] {
  const videos = Array.isArray(defaultValues?.property_videos)
    ? defaultValues.property_videos as Array<Record<string, unknown>>
    : [];

  return videos
    .map((video) => ({
      id: Number(video.id),
      property_id: Number(video.property_id ?? defaultValues?.id),
      storage_path: typeof video.storage_path === "string" ? video.storage_path : null,
      source_type: video.source_type === "youtube" ? "youtube" as const : "upload" as const,
      video_url: typeof video.video_url === "string" ? video.video_url : null,
      title: String(video.title ?? ""),
      display_order: Number(video.display_order ?? 0),
      upload_status:
        video.upload_status === "ready"
          ? "ready" as const
          : video.upload_status === "failed"
          ? "failed" as const
          : "pending" as const,
      replaces_video_id: video.replaces_video_id ? Number(video.replaces_video_id) : null,
      created_at: String(video.created_at ?? ""),
    }))
    .filter((video) => Number.isSafeInteger(video.id) && video.id > 0)
    .filter(
      (video) =>
        video.source_type !== "youtube" ||
        Boolean(video.video_url && getYouTubeEmbedUrl(video.video_url)),
    )
    .map((video) => ({
      ...video,
      video_url:
        video.source_type === "youtube" && video.video_url
          ? getYouTubeEmbedUrl(video.video_url)
          : video.video_url,
    }))
    .sort((a, b) => a.display_order - b.display_order);
}

async function uploadPropertyVideo(
  storagePath: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  const supabase = supabaseBrowser;
  const config = getSupabaseConfig();

  if (!supabase || !config) {
    throw new Error("Supabase is not configured. Add your public URL and publishable key to enable video uploads.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in as an administrator to upload property videos.");
  }

  const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_admin");

  if (adminCheckError || !isAdmin) {
    throw new Error("Your account is not authorized to upload property videos.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Your admin session could not be verified. Sign in again and retry the upload.");
  }

  const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
  const uploadUrl = `${config.url.replace(/\/$/, "")}/storage/v1/object/${PROPERTY_VIDEO_BUCKET}/${encodedPath}`;

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", uploadUrl);
    request.setRequestHeader("apikey", config.key);
    request.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    request.setRequestHeader("Content-Type", file.type || "video/mp4");
    request.setRequestHeader("x-upsert", "true");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      let message = `Storage rejected the upload (HTTP ${request.status}).`;
      try {
        const response = JSON.parse(request.responseText) as { message?: string };
        if (response.message) {
          message = response.message;
        }
      } catch {
        // Keep the explicit HTTP error when the storage response is not JSON.
      }
      reject(new Error(message));
    };

    request.onerror = () => reject(new Error("A network error interrupted the video upload. Retry the upload."));
    request.onabort = () => reject(new Error("The video upload was interrupted. Retry the upload."));
    request.send(file);
  });
}

function buildPropertyStoragePath(propertyId: string | number, fileName: string) {
  const safePropertyId = String(propertyId ?? "").trim();

  if (!safePropertyId || safePropertyId === "undefined" || safePropertyId === "null") {
    throw new Error("Save the property first before uploading images so the file can be stored under properties/{propertyId}/.");
  }

  const baseName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `properties/${safePropertyId}/${uniqueSuffix}-${baseName}`;
}

function normalizeGalleryImages(defaultValues?: Record<string, unknown>) {
  const gallery = Array.isArray((defaultValues as { property_images?: Array<Record<string, unknown>> } | undefined)?.property_images)
    ? ((defaultValues as { property_images?: Array<Record<string, unknown>> }).property_images ?? [])
    : [];

  return gallery
    .map((image, index) => ({
      id: `${String(image.image_url ?? "img")}-${index}`,
      url: String(image.image_url ?? ""),
      display_order: Number(image.display_order ?? index),
      is_primary: Boolean(image.is_primary),
    }))
    .filter((image) => image.url);
}

export function PropertyForm({
  defaultValues,
  mode,
}: {
  defaultValues?: Record<string, unknown>;
  mode: "create" | "edit";
}) {
  const values = defaultValues ?? {};
  const router = useRouter();
  const initialPropertyId =
    typeof values.id === "string" || typeof values.id === "number"
      ? Number(values.id)
      : null;
  const [savedPropertyId, setSavedPropertyId] = useState<number | null>(
    initialPropertyId && Number.isSafeInteger(initialPropertyId) ? initialPropertyId : null,
  );
  const [images, setImages] = useState<GalleryImage[]>(() => normalizeGalleryImages(values));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videos, setVideos] = useState<ManagedVideo[]>(() => normalizePropertyVideos(values));
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);
  const [videoSelectionError, setVideoSelectionError] = useState<string | null>(null);
  const [videoManagementError, setVideoManagementError] = useState<string | null>(null);
  const [videoBusyIds, setVideoBusyIds] = useState<number[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const previewUrls = useRef(new Set<string>());
  const propertyId = savedPropertyId ?? initialPropertyId;

  const primaryImage = images.find((image) => image.is_primary) ?? images[0] ?? null;
  const imagePayload = JSON.stringify(
    images.map(({ url, display_order, is_primary }) => ({
      url,
      display_order,
      is_primary,
    })),
  );

  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    },
    [],
  );

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const supabase = supabaseBrowser;

    if (!supabase) {
      setUploadError("Supabase is not configured. Add your public URL and publishable key to enable image uploads.");
      return;
    }

    if (!propertyId) {
      setUploadError("Save the property first before uploading images so the file is stored under properties/{propertyId}/.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.warn("[Property upload auth] getUser failed", {
          errorMessage: userError?.message ?? "No authenticated user found.",
        });
        throw new Error("You must be signed in as an authenticated admin before uploading images.");
      }

      const { data: adminProfile, error: adminProfileError } = await supabase
        .from("admin_profiles")
        .select("id, role")
        .eq("id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_admin");

      if (adminProfileError || !adminProfile) {
        console.warn("[Property upload auth] admin profile lookup failed", {
          authenticatedUserId: user.id,
          errorMessage: adminProfileError?.message ?? "No admin profile for this user.",
        });
        throw new Error("You must be signed in as an authenticated admin before uploading images.");
      }

      if (adminCheckError || !isAdmin) {
        console.warn("[Property upload auth] is_admin RPC check failed", {
          authenticatedUserId: user.id,
          errorMessage: adminCheckError?.message ?? "The authenticated user is not an admin.",
          adminProfileId: adminProfile.id,
          adminRole: adminProfile.role,
        });
        throw new Error("You must be signed in as an authenticated admin before uploading images.");
      }

      console.info("[Property upload auth] admin authorization confirmed", {
        authenticatedUserId: user.id,
        hasSession: true,
        isAdminAuthorized: true,
      });

      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const bucketName = "property-images";
          const storagePath = buildPropertyStoragePath(propertyId, file.name);

          console.info("[Property image upload debug]", {
            authenticatedUserId: user.id,
            bucketName,
            storagePath,
            fileName: file.name,
          });

          const { data, error } = await supabase.storage.from(bucketName).upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

          if (error || !data) {
            console.error("[Property image upload failed]", {
              authenticatedUserId: user.id,
              bucketName,
              storagePath,
              errorMessage: error?.message ?? "Unable to upload image.",
            });
            throw new Error(error?.message ?? "Unable to upload image.");
          }

          const publicUrl = supabase.storage.from(bucketName).getPublicUrl(data.path).data.publicUrl;

          return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            url: publicUrl,
            display_order: images.length + Math.random(),
            is_primary: images.length === 0,
          } satisfies GalleryImage;
        }),
      );

      setImages((current) => {
        const merged = [...current, ...uploadedImages];
        return merged.map((image, index) => ({
          ...image,
          display_order: index,
          is_primary: index === 0,
        }));
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      setUploadError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((current) => {
      const next = current.filter((_, index) => index !== indexToRemove);

      if (!next.length) {
        return [];
      }

      return next.map((image, index) => ({
        ...image,
        display_order: index,
        is_primary: index === 0,
      }));
    });
  };

  const handleVideoSelection = (
    event: ChangeEvent<HTMLInputElement>,
    replacesVideoId: number | null = null,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    const maxSizeBytes = getPropertyVideoMaxSizeBytes();
    const acceptedFiles: PendingVideo[] = [];
    const errors: string[] = [];
    const existingVideo = replacesVideoId
      ? videos.find((video) => video.id === replacesVideoId)
      : null;
    const retryVideo =
      existingVideo && existingVideo.upload_status !== "ready" ? existingVideo : null;

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".mp4") || file.type !== "video/mp4") {
        errors.push(`${file.name}: choose an MP4 file with the video/mp4 media type.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        const maximumSize = Math.round(maxSizeBytes / (1024 * 1024));
        errors.push(`${file.name}: exceeds the ${maximumSize} MiB upload limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      acceptedFiles.push({
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl,
        title: file.name.replace(/\.mp4$/i, "").slice(0, 160),
        replacesVideoId: retryVideo
          ? retryVideo.replaces_video_id
          : replacesVideoId,
        videoId: retryVideo?.id ?? null,
        storagePath: retryVideo?.storage_path ?? null,
        progress: 0,
        status: "queued",
        error: null,
      });
    }

    setPendingVideos((current) => [...current, ...acceptedFiles]);
    setVideoSelectionError(errors.length ? errors.join(" ") : null);
  };

  const removePendingVideo = async (pending: PendingVideo) => {
    if (pending.videoId) {
      try {
        const result = await deletePropertyVideoAction(pending.videoId);
        if (!result.deleted) {
          setVideoManagementError(result.error);
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to discard the incomplete video upload.";
        setVideoManagementError(message);
        return;
      }
    }

    URL.revokeObjectURL(pending.previewUrl);
    previewUrls.current.delete(pending.previewUrl);
    setPendingVideos((current) => current.filter((item) => item.localId !== pending.localId));
  };

  const handleDeleteVideo = async (videoId: number) => {
    setVideoBusyIds((current) => [...current, videoId]);
    setVideoManagementError(null);

    try {
      const result = await deletePropertyVideoAction(videoId);
      if (result.deleted) {
        setVideos((current) => current.filter((video) => video.id !== videoId));
      } else {
        setVideos((current) =>
          current.map((video) =>
            video.id === videoId
              ? { ...video, upload_status: result.uploadStatus }
              : video,
          ),
        );
        setVideoManagementError(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete this video.";
      setVideoManagementError(message);
    } finally {
      setVideoBusyIds((current) => current.filter((id) => id !== videoId));
    }
  };

  const processPendingVideos = async (savedId: number) => {
    let hasFailures = false;

    for (const pending of pendingVideos) {
      let videoId = pending.videoId;
      let storagePath = pending.storagePath;

      try {
        if (videoId) {
          const upload = await beginPropertyVideoUploadAction(videoId);
          storagePath = upload.storagePath;
        } else {
          const reservedVideo = await createPropertyVideoUploadAction({
            propertyId: savedId,
            title: pending.title,
            displayOrder:
              videos.find((video) => video.id === pending.replacesVideoId)?.display_order ??
              videos.length + pendingVideos.indexOf(pending),
            replacesVideoId: pending.replacesVideoId ?? undefined,
          });
          videoId = reservedVideo.id;
          storagePath = reservedVideo.storagePath;
        }

        if (!videoId || !storagePath) {
          throw new Error("The video upload could not be prepared. Retry the upload.");
        }

        const activeVideoId = videoId;
        const activeStoragePath = storagePath;
        setPendingVideos((current) =>
          current.map((item) =>
            item.localId === pending.localId
              ? { ...item, videoId: activeVideoId, storagePath: activeStoragePath, status: "uploading", progress: 0, error: null }
              : item,
          ),
        );

        await uploadPropertyVideo(storagePath, pending.file, (progress) => {
          setPendingVideos((current) =>
            current.map((item) =>
              item.localId === pending.localId ? { ...item, progress } : item,
            ),
          );
        });

        setPendingVideos((current) =>
          current.map((item) =>
            item.localId === pending.localId ? { ...item, status: "saving", progress: 100 } : item,
          ),
        );

        const result = await completePropertyVideoUploadAction(videoId);
        const completedVideo = result.video as ManagedVideo;

        setVideos((current) => {
          const retainedVideos = current
            .filter((video) => video.id !== result.replacedVideoId)
            .map((video) =>
              video.id === result.hiddenPreviousVideoId
                ? { ...video, upload_status: "pending" as const }
                : video,
            );
          const withoutCompleted = retainedVideos.filter(
            (video) => video.id !== completedVideo.id,
          );

          return [...withoutCompleted, completedVideo].sort(
            (a, b) => a.display_order - b.display_order,
          );
        });

        URL.revokeObjectURL(pending.previewUrl);
        previewUrls.current.delete(pending.previewUrl);
        setPendingVideos((current) => current.filter((item) => item.localId !== pending.localId));

        if (result.cleanupError) {
          setVideoManagementError(result.cleanupError);
          hasFailures = true;
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : "The video upload failed.";

        if (videoId) {
          try {
            await failPropertyVideoUploadAction(videoId);
          } catch (statusError) {
            const statusMessage =
              statusError instanceof Error ? statusError.message : "Unable to record the failed upload status.";
            message = `${message} The upload remains tracked, but its status could not be updated: ${statusMessage}`;
          }
        }

        const failedVideoId = videoId;
        const failedStoragePath = storagePath;
        setPendingVideos((current) =>
          current.map((item) =>
            item.localId === pending.localId
              ? {
                  ...item,
                  videoId: failedVideoId,
                  storagePath: failedStoragePath,
                  status: "failed",
                  error: message,
                }
              : item,
          ),
        );
        hasFailures = true;
      }
    }

    return hasFailures;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    setVideoManagementError(null);
    setYoutubeError(null);

    const formData = new FormData(event.currentTarget);
    if (propertyId) {
      formData.set("propertyId", String(propertyId));
    }

    let savedProperty: { propertyId: number; slug: string };

    try {
      savedProperty = await savePropertyAction(formData);
      setSavedPropertyId(savedProperty.propertyId);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save this property.");
      setSaving(false);
      return;
    }

    let hasVideoErrors = false;

    for (const video of videos) {
      try {
        await updatePropertyVideoAction({
          videoId: video.id,
          title: video.title,
          displayOrder: video.display_order,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : `Unable to update "${video.title}".`;
        setVideoManagementError(message);
        hasVideoErrors = true;
      }
    }

    if (await processPendingVideos(savedProperty.propertyId)) {
      hasVideoErrors = true;
    }

    if (youtubeUrl.trim()) {
      try {
        const youtubeVideo = await createYouTubePropertyVideoAction({
          propertyId: savedProperty.propertyId,
          videoUrl: youtubeUrl,
          title: youtubeTitle,
          displayOrder: videos.length + pendingVideos.length,
        });
        setVideos((current) =>
          [...current, youtubeVideo as ManagedVideo].sort(
            (a, b) => a.display_order - b.display_order,
          ),
        );
        setYoutubeUrl("");
        setYoutubeTitle("");
      } catch (error) {
        setYoutubeError(error instanceof Error ? error.message : "Unable to save the YouTube video.");
        hasVideoErrors = true;
      }
    }

    if (hasVideoErrors) {
      setSaveNotice("The property was saved. Review the video messages below and retry or remove any failed upload.");
      setSaving(false);
      return;
    }

    const successMessage = propertyId ? "Property updated successfully." : "Property created successfully.";
    router.replace(
      `/admin/properties/${savedProperty.propertyId}/edit?success=${encodeURIComponent(successMessage)}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="propertyId" value={propertyId ? String(propertyId) : ""} />
      <input type="hidden" name="images" value={imagePayload} />
      <input type="hidden" name="imageUrl" value={primaryImage?.url ?? String(values.image_url ?? values.image ?? "")} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Property title</label>
          <input
            name="title"
            defaultValue={String(values.title ?? "")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
          <input
            name="slug"
            defaultValue={String(values.slug ?? "")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
          <input
            name="price"
            type="number"
            defaultValue={Number(values.price ?? 0)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Currency</label>
          <select
            name="currency"
            defaultValue={String(values.currency ?? "NGN")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Property type</label>
          <select
            name="propertyType"
            defaultValue={String(values.property_type ?? "Apartment")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          >
            <option>Apartment</option>
            <option>Duplex</option>
            <option>Villa</option>
            <option>Townhouse</option>
            <option>Office</option>
            <option>Land</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Listing type</label>
          <select
            name="listingType"
            defaultValue={String(values.listing_type ?? "sale")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
          <input
            name="location"
            defaultValue={String(values.location ?? "")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
          <input
            name="address"
            defaultValue={String(values.address ?? "")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          <input
            name="city"
            defaultValue={String(values.city ?? "")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
          <input
            name="state"
            defaultValue={String(values.state ?? "")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Bedrooms</label>
          <input
            name="bedrooms"
            type="number"
            defaultValue={Number(values.bedrooms ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Bathrooms</label>
          <input
            name="bathrooms"
            type="number"
            defaultValue={Number(values.bathrooms ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Toilets</label>
          <input
            name="toilets"
            type="number"
            defaultValue={Number(values.toilets ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Property size (sq ft)</label>
          <input
            name="propertySize"
            type="number"
            defaultValue={Number(values.property_size ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Year built</label>
          <input
            name="yearBuilt"
            type="number"
            defaultValue={Number(values.year_built ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            defaultValue={String(values.status ?? "available")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          >
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="leased">Leased</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            defaultValue={String(values.description ?? "")}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Amenities (comma separated)</label>
          <input
            name="amenities"
            defaultValue={String(
              Array.isArray(values.property_amenities)
                ? values.property_amenities
                    .map((item: { amenity?: string; name?: string }) => item.amenity ?? item.name)
                    .filter(Boolean)
                    .join(", ")
                : "",
            )}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-700">Property gallery</label>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-[var(--brand-navy)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              {uploading ? "Uploading..." : "Upload images"}
            </label>
          </div>

          {uploadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div>
          ) : null}

          {images.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="relative h-32 overflow-hidden">
                    <Image src={image.url} alt={`Property ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    {image.is_primary ? (
                      <span className="absolute left-2 top-2 rounded-full bg-[var(--brand-navy)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => setImages((current) => current.map((item, itemIndex) => ({ ...item, is_primary: itemIndex === index }))) }
                      className="text-xs font-medium text-slate-700 underline-offset-2 hover:underline"
                    >
                      {image.is_primary ? "Primary" : "Set primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No images uploaded yet. Add at least one image to make the listing look complete.
            </div>
          )}
        </div>

        <section className="space-y-5 border border-slate-200 bg-slate-50 p-4 md:col-span-2 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Property Videos</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Add MP4 tours up to {Math.round(getPropertyVideoMaxSizeBytes() / (1024 * 1024))} MiB each, or a supported YouTube link. Save the property as a draft or publish it when ready.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[var(--brand-navy)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
              <input
                type="file"
                accept=".mp4,video/mp4"
                multiple
                disabled={saving || uploading}
                className="hidden"
                onChange={(event) => handleVideoSelection(event)}
              />
              Select videos
            </label>
          </div>

          {!propertyId ? (
            <p className="rounded-xl border border-[rgba(185,149,85,0.35)] bg-white px-3 py-2 text-sm text-slate-600">
              Selected videos can be previewed now. Save the property to create its video records and upload them.
            </p>
          ) : null}

          {videoSelectionError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{videoSelectionError}</p>
          ) : null}
          {videoManagementError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{videoManagementError}</p>
          ) : null}

          {videos.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {videos.map((video) => (
                <article key={video.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-3 aspect-video overflow-hidden bg-slate-900">
                    {video.upload_status === "ready" && video.source_type === "youtube" && video.video_url ? (
                      <iframe
                        src={video.video_url}
                        title={video.title || "Property video"}
                        loading="lazy"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : video.upload_status === "ready" && video.source_type === "upload" ? (
                      <video controls playsInline preload="metadata" className="h-full w-full">
                        <source src={`/api/property-videos/${video.id}`} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white">
                        Upload incomplete. Select the video again to retry.
                      </div>
                    )}
                  </div>

                  <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor={`video-title-${video.id}`}>
                    Video title or caption
                  </label>
                  <input
                    id={`video-title-${video.id}`}
                    value={video.title}
                    maxLength={160}
                    onChange={(event) =>
                      setVideos((current) =>
                        current.map((item) =>
                          item.id === video.id ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-medium ${video.upload_status === "ready" ? "text-emerald-700" : "text-amber-700"}`}>
                      {video.source_type === "youtube" ? "YouTube video" : video.upload_status === "ready" ? "Uploaded" : "Upload needs attention"}
                    </span>
                    <div className="flex items-center gap-3">
                      {video.source_type === "upload" ? (
                        <label className="cursor-pointer text-xs font-semibold text-[var(--brand-navy)] underline underline-offset-2">
                          {video.upload_status === "ready" ? "Replace video" : "Retry upload"}
                          <input
                            type="file"
                            accept=".mp4,video/mp4"
                            disabled={saving || uploading || videoBusyIds.includes(video.id)}
                            className="hidden"
                            onChange={(event) => handleVideoSelection(event, video.id)}
                          />
                        </label>
                      ) : null}
                      <button
                        type="button"
                        disabled={saving || videoBusyIds.includes(video.id)}
                        onClick={() => void handleDeleteVideo(video.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {videoBusyIds.includes(video.id) ? "Deleting..." : "Delete video"}
                      </button>
                    </div>
                  </div>
                  {video.replaces_video_id ? (
                    <p className="mt-2 text-xs text-amber-700">Previous video cleanup still needs attention.</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {pendingVideos.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingVideos.map((pending) => (
                <article key={pending.localId} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <video
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    src={pending.previewUrl}
                    className="mb-3 aspect-video w-full bg-slate-900"
                  />
                  <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor={`pending-video-title-${pending.localId}`}>
                    Video title or caption
                  </label>
                  <input
                    id={`pending-video-title-${pending.localId}`}
                    value={pending.title}
                    maxLength={160}
                    disabled={saving}
                    onChange={(event) =>
                      setPendingVideos((current) =>
                        current.map((item) =>
                          item.localId === pending.localId ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
                  />
                  {pending.status === "uploading" ? (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-600">
                        <span>Uploading video...</span>
                        <span>{pending.progress}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Uploading ${pending.file.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pending.progress}
                        className="h-2 overflow-hidden rounded-full bg-slate-200"
                      >
                        <div className="h-full bg-[var(--brand-gold)] transition-[width]" style={{ width: `${pending.progress}%` }} />
                      </div>
                    </div>
                  ) : pending.status === "saving" ? (
                    <p className="mt-3 text-xs text-slate-600">Verifying the video and saving its record...</p>
                  ) : null}
                  {pending.error ? (
                    <p role="alert" className="mt-3 text-xs leading-5 text-red-700">{pending.error}</p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">
                      {pending.replacesVideoId ? "Replacing existing video" : pending.file.name}
                    </span>
                    <button
                      type="button"
                      disabled={saving || pending.status === "uploading" || pending.status === "saving"}
                      onClick={() => void removePendingVideo(pending)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="youtube-video-url">YouTube URL</label>
              <input
                id="youtube-video-url"
                type="url"
                value={youtubeUrl}
                disabled={saving}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="youtube-video-title">Video title or caption</label>
              <input
                id="youtube-video-title"
                value={youtubeTitle}
                maxLength={160}
                disabled={saving}
                onChange={(event) => setYoutubeTitle(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-gold)]"
              />
            </div>
            <p className="self-end pb-2 text-xs text-slate-500 sm:max-w-36">Validated YouTube links are added when you save the property.</p>
          </div>
          {youtubeError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{youtubeError}</p>
          ) : null}
        </section>

        <div className="flex items-center gap-4 md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="featured" type="checkbox" defaultChecked={Boolean(values.featured)} className="h-4 w-4 rounded border-slate-300 text-[var(--brand-gold)]" />
            Featured
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="published" type="checkbox" defaultChecked={Boolean(values.published)} className="h-4 w-4 rounded border-slate-300 text-[var(--brand-gold)]" />
            Published
          </label>
        </div>
      </div>

      {saveError ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>
      ) : null}
      {saveNotice ? (
        <p role="status" className="rounded-xl border border-[rgba(185,149,85,0.35)] bg-[rgba(185,149,85,0.08)] px-4 py-3 text-sm text-[var(--brand-navy)]">{saveNotice}</p>
      ) : null}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">
          Cancel
        </button>
        <button type="submit" disabled={uploading || saving} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] disabled:cursor-not-allowed disabled:opacity-70">
          {saving ? "Saving..." : mode === "create" ? "Add property" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
