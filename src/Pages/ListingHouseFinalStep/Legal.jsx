import { AiOutlineQuestionCircle } from "react-icons/ai";
import ModalPopup from "../../components/popUp/houseListing/ModalPopup";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewHouse } from "../../redux/actions/houseActions";

const Legal = () => {
  const newHouseData = useSelector((state) => state.house.newHouse);
  const [labelValue, setLabelValue] = useState([]);
  const dispatch = useDispatch();

  const handleCheckboxChange = (event) => {
    const label = event.target.parentElement.querySelector("label");
    const labelText = label.textContent;

    if (event.target.checked) {
      // Checkbox is checked, add the label to the selectedLabels array
      setLabelValue([...labelValue, labelText]);
    } else {
      // Checkbox is unchecked, remove the label from the selectedLabels array
      setLabelValue(labelValue.filter((item) => item !== labelText));
    }
  };
  useEffect(() => {
    dispatch(
      createNewHouse(
        newHouseData?.houseType,
        newHouseData?.privacyType,
        newHouseData?.location,
        newHouseData?.floorPlan,
        newHouseData?.amenities,
        newHouseData?.photos,
        newHouseData?.title,
        newHouseData?.highlights,
        newHouseData?.description,
        newHouseData?.guestType,
        newHouseData?.priceBeforeTaxes,
        newHouseData?.authorEarnedPrice,
        newHouseData?.basePrice,
        labelValue
      )
    );
  }, [labelValue]);
  return (
    <>
      <div className=" flex flex-col max-w-screen-sm mx-auto my-6 min-h-[70vh]">
        <div>
          <h1 className=" text-[#222222] text-3xl sm:text-[32px] font-semibold">
            Just one last step!
          </h1>
          <div className="mt-5 flex flex-row items-center gap-2">
            <p className="text-base sm:text-lg text-[#222222] font-medium">
              Does your place have any of these?
            </p>
            <div
              className=" cursor-pointer p-1 hover:bg-[#f1f1f1] rounded-full transition duration-300"
              onClick={() => window.my_modal_5.showModal()}
            >
              <AiOutlineQuestionCircle size={20} />
            </div>
          </div>
        </div>
        <div className=" mt-6 flex flex-col gap-6 w-full sm:min-w-[400px]">
          <div className="flex flex-row justify-between items-center">
            <label htmlFor="checkbox1" className=" cursor-pointer">
              Security camera(s)
            </label>
            <input
              type="checkbox"
              id="checkbox1"
              className=" cursor-pointer w-6 h-6"
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="flex flex-row justify-between items-center">
            <label htmlFor="checkbox2" className=" cursor-pointer">
              Weapons
            </label>
            <input
              type="checkbox"
              id="checkbox2"
              className=" cursor-pointer w-6 h-6"
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="flex flex-row justify-between items-center">
            <label htmlFor="checkbox3" className=" cursor-pointer">
              Dangerous animals
            </label>
            <input
              type="checkbox"
              id="checkbox3"
              className=" cursor-pointer w-6 h-6"
              onChange={handleCheckboxChange}
            />
          </div>
        </div>

        <hr className="h-[1px] bg-[#dddddd] my-12" />

        <div className=" opacity-60 text-[#222222]">
          <h6 className=" text-lg sm:text-xl font-semibold">
            Important things to know{" "}
          </h6>
          <p className="text-xs sm:text-sm mt-2">
            Be sure to comply with your local laws and review Motel&apos;s
            nondiscrimination policy and guest and Host fees.
          </p>
        </div>
      </div>
      {/* extra info popup about legal & security */}
      <ModalPopup />
    </>
  );
};

export default Legal;
