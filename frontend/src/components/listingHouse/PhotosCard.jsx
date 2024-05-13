/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { LiaPhotoVideoSolid } from "react-icons/lia";
import { useDispatch, useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import { createNewHouse } from "../../redux/actions/houseActions";

const PhotosCard = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const [images, setImages] = useState([]);
  const [inputImage, setInputImage] = useState(null);
  const [isImgUploading, setIsImgUploading] = useState(false);
  const dispatch = useDispatch();

  const handleImageSelect = (event) => {
    /* This code block is handling the selection of an image file. It checks if the number of images
    already selected is equal to 3. If it is, it displays an error message using the `toast.error()`
    function and returns, preventing further execution of the code. If the number of images is less
    than 3, it sets the selected image file as the value of the `inputImage` state variable using
    `setInputImage(event.target.files[0])` and logs the selected file to the console using
    `console.log(event.target.files[0])`. */
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
  }, [images, dispatch]);

  useEffect(() => {
    async function uploadImagetoCloudinary() {
      if (inputImage !== null && inputImage?.size / 500000 < 5) {
        // console.log(isImgUploading, "loading state");
        const imageFormData = new FormData();
        imageFormData.append("file", inputImage);
        imageFormData.append("upload_preset", "house-hunter");
        imageFormData.append("cloud_name", "dc7c1v9e7");

        // saving to cloudinary
        setIsImgUploading(true);
        try {
          await fetch(
            "https://api.cloudinary.com/v1_1/dc7c1v9e7/image/upload",
            {
              method: "POST",
              body: imageFormData,
            }
          )
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              setImages([...images, data.url]);
              if (data.error) {
                toast.error(data?.error?.message);
                setIsImgUploading(false);
                setImages(null);
              } else {
                setIsImgUploading(false);
              }
            })
            .catch((err) => {
              toast.error(err.message + "try again");
              setIsImgUploading(false);
            });
        } catch (error) {
          console.log(error);
          toast.error(error);
          setIsImgUploading(false);
        } finally {
          setIsImgUploading(false);
          setInputImage(null);
        }
      } else if (inputImage?.size / 500000 > 5) {
        toast.error("Image size can't exceed 5mb");
        setIsImgUploading(false);
      }
    }
    uploadImagetoCloudinary();
    // only when input file takes an image we want to save it to cloudinary that's why only one dependency
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
          {/* loading when image is uploading in cloudinary */}

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
