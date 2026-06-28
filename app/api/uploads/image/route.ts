import { NextResponse } from "next/server";
import {
  type PortalImagePurpose,
  isCloudinaryConfigured,
  uploadImageToCloudinary
} from "@/lib/cloudinary";

const uploadPurposes = new Set<PortalImagePurpose>(["cover", "hero", "artifact", "avatar"]);

function isUploadPurpose(value: FormDataEntryValue | null): value is PortalImagePurpose {
  return typeof value === "string" && uploadPurposes.has(value as PortalImagePurpose);
}

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        status: "not_configured",
        message: "Cloudinary is not configured."
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const purpose = formData.get("purpose");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        status: "invalid_request",
        message: "Upload a file using the `file` form field."
      },
      { status: 400 }
    );
  }

  if (!isUploadPurpose(purpose)) {
    return NextResponse.json(
      {
        status: "invalid_request",
        message: "Upload purpose must be cover, hero, artifact, or avatar."
      },
      { status: 400 }
    );
  }

  try {
    const upload = await uploadImageToCloudinary({
      file,
      filename: file.name,
      purpose
    });

    return NextResponse.json({
      status: "uploaded",
      upload
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "upload_failed",
        message: error instanceof Error ? error.message : "Image upload failed."
      },
      { status: 400 }
    );
  }
}
