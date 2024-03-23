import { GoChecklist, GoCalendar } from "react-icons/go";
import { IoSettings } from "react-icons/io5"


const PreviewCardsDescription = () => {
  return (
    <div className=" flex flex-col gap-7">
      <h3 className="text-[#222222] text-lg sm:text-[22px] font-medium">
        What&apos;s next?
      </h3>
      <div className=" flex flex-row justify-start gap-4">
        <div className=" w-10">
          <GoChecklist size={36} />
        </div>
        <div className=" flex flex-col gap-1">
          <p className="text-base sm:text-lg font-medium text-[#222222]">
            Confirm a few details and publish
          </p>
          <p className="text-xs sm:text-sm text-[#717171]">
            We’ll let you know if you need to verify your identity or register
            with the local government.
          </p>
        </div>
      </div>
      <div className=" flex flex-row justify-start gap-4">
        <div className=" w-10">
          <GoCalendar size={36} />
        </div>
        <div className=" flex flex-col gap-1">
          <p className="text-base sm:text-lg font-medium text-[#222222]">
            Set up your calendar
          </p>
          <p className="text-xs sm:text-sm text-[#717171]">
            Choose which dates your listing is available. It will be visible 24
            hours after you publish.
          </p>
        </div>
      </div>
      <div className=" flex flex-row justify-start gap-4">
        <div className=" w-10">
           <IoSettings size={36}/>
        </div>
        <div className=" flex flex-col gap-1">
          <p className="text-base sm:text-lg font-medium text-[#222222]">
            Adjust your settings
          </p>
          <p className="text-xs sm:text-sm text-[#717171]">
            Set house rules, select a cancellation policy, choose how guests
            book, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewCardsDescription;
