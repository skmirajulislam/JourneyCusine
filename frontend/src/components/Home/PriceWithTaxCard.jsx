/* eslint-disable react/prop-types */
const PriceWithTaxCard = ({ style, setShowBeforeTaxPrice }) => {
  return (
    <div className={`${style}`}>
      <p className=" text-xs text-[#222222] dark:text-[#e5e7eb] font-medium">
        Display total after taxes
      </p>
      <input
        type="checkbox"
        className="toggle"
        onClick={() => {
          setShowBeforeTaxPrice((prev) => !prev);
        }}
      />
    </div>
  );
};

export default PriceWithTaxCard;
