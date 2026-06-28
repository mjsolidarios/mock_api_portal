import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const maxUploadBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
};

export type PortalImageUpload = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
};

export type PortalImagePurpose = "cover" | "hero" | "artifact" | "avatar" | "seed";

function getCloudinaryUrlConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    return {};
  }

  try {
    const url = new URL(cloudinaryUrl);

    if (url.protocol !== "cloudinary:") {
      return {};
    }

    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password)
    };
  } catch {
    return {};
  }
}

export function getCloudinaryConfig() {
  const cloudinaryUrlConfig = getCloudinaryUrlConfig();

  return {
    cloudName:
      cloudinaryUrlConfig.cloudName ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey:
      cloudinaryUrlConfig.apiKey ||
      process.env.CLOUDINARY_API_KEY ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    apiSecret: cloudinaryUrlConfig.apiSecret || process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "game_portal",
    uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "region6-portal",
    seedUploadsEnabled: process.env.CLOUDINARY_SEED_UPLOADS === "true"
  };
}

export function isCloudinaryConfigured() {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.apiKey && config.apiSecret);
}

function signUploadParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function cleanSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");
}

export function cloudinaryFolderForPurpose(purpose: PortalImagePurpose) {
  const { uploadFolder } = getCloudinaryConfig();
  return `${cleanSegment(uploadFolder)}/${purpose}`;
}

export async function uploadImageToCloudinary({
  file,
  filename,
  purpose,
  publicId
}: {
  file: Blob;
  filename: string;
  purpose: PortalImagePurpose;
  publicId?: string;
}): Promise<PortalImageUpload> {
  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder: cloudinaryFolderForPurpose(purpose),
    overwrite: "true",
    timestamp,
    upload_preset: config.uploadPreset
  };

  if (publicId) {
    params.public_id = cleanSegment(publicId);
  }

  params.signature = signUploadParams(params, config.apiSecret);

  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("api_key", config.apiKey);
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = (await response.json()) as CloudinaryUploadResponse & { error?: { message: string } };

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes
  };
}

export async function uploadLocalSeedImage({
  relativePath,
  purpose,
  publicId
}: {
  relativePath: string;
  purpose: PortalImagePurpose;
  publicId: string;
}) {
  const absolutePath = path.join(process.cwd(), "public", relativePath.replace(/^\//, ""));
  const buffer = await readFile(absolutePath);
  const extension = path.extname(relativePath).toLowerCase();
  const type =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : extension === ".gif"
          ? "image/gif"
          : "image/jpeg";

  return uploadImageToCloudinary({
    file: new Blob([buffer], { type }),
    filename: path.basename(relativePath),
    purpose,
    publicId
  });
}
