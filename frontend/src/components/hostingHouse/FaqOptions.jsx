import { faqOptionsList } from "./FaqOptionsList";

const FaqOptions = () => {
  return (
    <>
      {faqOptionsList?.map((list, i) => {
        return (
          <div key={i} className="py-5">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none text-[#222222] text-xl">
                <span className="text-sm sm:text-base">{list.head}</span>
                <span className="transition duration-300 group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <p className="text-[#717171] text-sm sm:text-base mt-3 group-open:animate-fadeIn transition duration-700">
                {list?.desc}
              </p>
            </details>
          </div>
        );
      })}
    </>
  );
};

export default FaqOptions;
