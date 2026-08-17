import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

const getUploadthingUrl = () => {
  if (import.meta.env.DEV) {
    const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/";
    const baseUrl = envUrl.endsWith("/") ? envUrl : `${envUrl}/`;
    return baseUrl.endsWith("/api/") ? `${baseUrl}uploadthing` : `${baseUrl}api/uploadthing`;
  }
  return "/api/uploadthing";
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
  const cleanFile = new File([file], safeFileName, { type: mimeType });

  const res = await uploadFiles("imageUploader", {
    files: [cleanFile],
  });

  if (!res || !res[0]) {
    throw new Error("No response from UploadThing");
  }

  const item = res[0];
  const url =
    item.ufsUrl ||
    item.url ||
    item.appUrl ||
    (item.key ? `https://utfs.io/f/${item.key}` : null);

  if (!url) {
    throw new Error("Failed to extract image URL from upload response");
  }

  return url;
}
