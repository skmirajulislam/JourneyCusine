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
