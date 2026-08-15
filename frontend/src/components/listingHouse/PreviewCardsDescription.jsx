import { GoChecklist, GoCalendar } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";

const PreviewCardsDescription = () => {
  return (
    <div className="flex flex-col gap-7">
      <h3 className="text-[#111827] dark:text-white text-lg sm:text-[22px] font-bold">
        What&apos;s next?
      </h3>
      <div className="flex flex-row justify-start gap-4 items-start">
        <div className="w-10 shrink-0 text-[#111827] dark:text-white mt-1">
          <GoChecklist size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base sm:text-lg font-bold text-[#111827] dark:text-white">
            Confirm a few details and publish
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            We’ll let you know if you need to verify your identity or register
            with the local government.
          </p>
        </div>
      </div>
      <div className="flex flex-row justify-start gap-4 items-start">
        <div className="w-10 shrink-0 text-[#111827] dark:text-white mt-1">
          <GoCalendar size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base sm:text-lg font-bold text-[#111827] dark:text-white">
            Set up your calendar
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Choose which dates your listing is available. It will be visible 24
            hours after you publish.
          </p>
        </div>
      </div>
      <div className="flex flex-row justify-start gap-4 items-start">
        <div className="w-10 shrink-0 text-[#111827] dark:text-white mt-1">
          <IoSettingsOutline size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base sm:text-lg font-bold text-[#111827] dark:text-white">
            Adjust your settings
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Set house rules, select a cancellation policy, choose how guests
            book, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewCardsDescription;
