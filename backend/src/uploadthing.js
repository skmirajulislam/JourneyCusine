const { createUploadthing } = require("uploadthing/express");

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  }).onUploadComplete((data) => {
    console.log("Uploadthing: upload completed", data);
    return { uploadedAt: new Date().toISOString() };
  }),
};

module.exports = { uploadRouter };
