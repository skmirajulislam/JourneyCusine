import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { LiaPhotoVideoSolid } from "react-icons/lia";
import { useDispatch, useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import { createNewHouse } from "../../redux/actions/houseActions";
import { uploadFiles } from "../../utils/uploadthing";

const PhotosCard = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const [images, setImages] = useState([]);
  const [inputImage, setInputImage] = useState(null);
  const [isImgUploading, setIsImgUploading] = useState(false);
  const dispatch = useDispatch();

  const handleImageSelect = (event) => {
    if (images.length >= 3) {
      toast.error("Maximum images uploaded");
      return;
    } else {
      setInputImage(event.target.files[0]);
      console.log(event.target.files[0]);
    }
  };

  // saving photos state globally
  useEffect(() => {
    dispatch(
      createNewHouse(
        newHouseData?.houseType,
        newHouseData?.privacyType,
        newHouseData?.location,
        newHouseData?.floorPlan,
        newHouseData?.amenities,
        images
      )
    );
  }, [
    dispatch,
    images,
    newHouseData?.amenities,
    newHouseData?.floorPlan,
    newHouseData?.houseType,
    newHouseData?.location,
    newHouseData?.privacyType,
  ]);

  useEffect(() => {
    async function uploadImageToUploadThing() {
      if (inputImage !== null) {
        if (inputImage.size > 5 * 1024 * 1024) {
          toast.error("Image size can't exceed 5MB");
          setInputImage(null);
          return;
        }

        setIsImgUploading(true);
        try {
          const res = await uploadFiles("imageUploader", {
            files: [inputImage],
          });
          if (res && res[0]?.url) {
            setImages((currentImages) => [...currentImages, res[0].url]);
          } else {
            toast.error("Upload failed, try again.");
          }
        } catch (error) {
          console.error(error);
          toast.error(error?.message || "Upload error, try again");
        } finally {
          setIsImgUploading(false);
          setInputImage(null);
        }
      }
    }
    uploadImageToUploadThing();
  }, [inputImage]);

  console.log(images);
  return (
    <label
      htmlFor="houseImage"
      className=" py-20 bg-white border-dashed border-[#b0b0b0] border flex justify-center items-center min-h-[340px]"
    >
      {isImgUploading ? (
        <>
          <PropagateLoader loading color="#717171" />
        </>
      ) : (
        <div className=" flex flex-col justify-center items-center gap-3">
          <div>
            <LiaPhotoVideoSolid size={72} />
          </div>
          {/* loading when image is uploading */}

          <div className="text-center h-[100px]">
            <h6 className=" text-2xl text-black font-medium py-2">
              Select your photos here
            </h6>
            <p className=" text-[#717171] text-lg">
              {/* dynamically counting how many photos selected */}
              {images.length !== 0 ? (
                <>
                  {images.length === 3
                    ? `${images.length} images uploaded`
                    : `Choose ${3 - images.length} more photos`}
                </>
              ) : (
                "Choose at least 3 photos"
              )}
            </p>
            <p className=" text-black text-sm underline underline-offset-2 font-medium cursor-pointer">
              Upload from your device
            </p>
          </div>
        </div>
      )}
      <input
        type="file"
        name="photos"
        className=" hidden"
        onChange={handleImageSelect}
        id="houseImage"
        multiple
        accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
      />
    </label>
  );
};

export default PhotosCard;
