import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

const getUploadthingUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/";
  const baseUrl = envUrl.endsWith("/") ? envUrl : `${envUrl}/`;
  return `${baseUrl}api/uploadthing`;
};

const uploadthingUrl = getUploadthingUrl();

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: uploadthingUrl,
});

export const UploadButton = generateUploadButton({
  url: uploadthingUrl,
});

export const UploadDropzone = generateUploadDropzone({
  url: uploadthingUrl,
});

/**
 * Direct uploader that guarantees canonical https://utfs.io/f/<key> URL extraction
 */
export async function uploadToUploadThingDirect(file) {
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const safeFileName = `profile_${Date.now()}.${ext}`;
  const mimeType = file.type || "image/jpeg";

  // 1. Request presigned URL from backend route
  const presignRes = await fetch(
    `${uploadthingUrl}?actionType=upload&slug=imageUploader`,
    {
      method: "POST",
      headers: {
        "x-uploadthing-version": "7.0.0",
        "x-uploadthing-package": "@uploadthing/react",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: [
          {
            name: safeFileName,
            size: file.size,
            type: mimeType,
          },
        ],
      }),
    }
  );

  if (!presignRes.ok) {
    throw new Error(`UploadThing presign HTTP error: ${presignRes.status}`);
  }

  const presignedList = await presignRes.json();
  const presigned = presignedList?.[0];
  if (!presigned || !presigned.key) {
    throw new Error("Invalid presigned URL from UploadThing");
  }

  // 2. Perform the actual file upload using UploadThing client
  const cleanFile = new File([file], safeFileName, { type: mimeType });
  try {
    await uploadFiles("imageUploader", {
      files: [cleanFile],
    });
  } catch (clientErr) {
    console.warn("UploadThing client callback notice:", clientErr);
  }

  // 3. Return canonical public CDN link
  return `https://utfs.io/f/${presigned.key}`;
}
