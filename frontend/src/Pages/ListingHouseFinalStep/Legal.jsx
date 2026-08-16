import { AiOutlineQuestionCircle } from "react-icons/ai";
import ModalPopup from "../../components/popUp/houseListing/ModalPopup";
import { useEffect, useState } from "react";
import { useListingFlow } from "../../context/ListingFlowContext";

const Legal = () => {
  const { newHouse, currentListingHouse, setNewHouse } = useListingFlow();
  const initialSecurity = newHouse?.security || currentListingHouse?.security || [];
  const [labelValue, setLabelValue] = useState(
    Array.isArray(initialSecurity) ? initialSecurity : []
  );

  const handleCheckboxChange = (event) => {
    const label = event.target.parentElement.querySelector("label");
    const labelText = label.textContent;

    if (event.target.checked) {
      setLabelValue([...labelValue, labelText]);
    } else {
      setLabelValue(labelValue.filter((item) => item !== labelText));
    }
  };

  useEffect(() => {
    setNewHouse((prev) => ({
      ...prev,
      security: labelValue,
    }));
  }, [labelValue]);

  return (
    <>
      <div className="flex flex-col max-w-screen-sm mx-auto my-6 min-h-[70vh]">
        <div>
          <h1 className="text-[#222222] dark:text-white text-3xl sm:text-[32px] font-semibold">
            Just one last step!
          </h1>
          <div className="mt-5 flex flex-row items-center gap-2">
            <p className="text-base sm:text-lg text-[#222222] dark:text-white font-medium">
              Does your place have any of these?
            </p>
            <div
              className="cursor-pointer p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition duration-300 text-neutral-600 dark:text-neutral-300"
              onClick={() => window.my_modal_5?.showModal?.()}
            >
              <AiOutlineQuestionCircle size={20} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-6 w-full sm:min-w-[400px]">
          <div className="flex flex-row justify-between items-center text-[#111827] dark:text-white">
            <label htmlFor="checkbox1" className="cursor-pointer font-medium text-sm sm:text-base">
              Security camera(s)
            </label>
            <input
              type="checkbox"
              id="checkbox1"
              checked={labelValue.includes("Security camera(s)")}
              className="cursor-pointer w-6 h-6 rounded-md accent-[#ff385c]"
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="flex flex-row justify-between items-center text-[#111827] dark:text-white">
            <label htmlFor="checkbox2" className="cursor-pointer font-medium text-sm sm:text-base">
              Weapons
            </label>
            <input
              type="checkbox"
              id="checkbox2"
              checked={labelValue.includes("Weapons")}
              className="cursor-pointer w-6 h-6 rounded-md accent-[#ff385c]"
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="flex flex-row justify-between items-center text-[#111827] dark:text-white">
            <label htmlFor="checkbox3" className="cursor-pointer font-medium text-sm sm:text-base">
              Dangerous animals
            </label>
            <input
              type="checkbox"
              id="checkbox3"
              checked={labelValue.includes("Dangerous animals")}
              className="cursor-pointer w-6 h-6 rounded-md accent-[#ff385c]"
              onChange={handleCheckboxChange}
            />
          </div>
        </div>

        <hr className="h-[1px] border-neutral-200 dark:border-neutral-800 my-12" />

        <div className="text-[#222222] dark:text-neutral-400">
          <h6 className="text-lg sm:text-xl font-semibold text-[#111827] dark:text-white">
            Important things to know
          </h6>
          <p className="text-xs sm:text-sm mt-2 opacity-80">
            Be sure to comply with your local laws and review Journey Cuisine&apos;s
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
