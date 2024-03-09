/* eslint-disable react/prop-types */
import { reservationListItems } from "./reservationsListName";

const ReservationsList = ({ active, setActivePage }) => {
  const handleActive = (id) => {
    JSON.stringify(sessionStorage.setItem("reservationsPage", id));
    setActivePage(id);
  };

  return (
    <section className=" mt-6">
      <h1 className=" text-[#222222] text-3xl font-semibold">Reservations</h1>
      <div className=" relative">
        <div className=" pt-10 flex flex-row gap-2 sm:gap-6 relative z-10 justify-between sm:justify-start">
          {reservationListItems.map((list, i) => {
            return (
              <div
                key={i}
                onClick={() => {
                  handleActive(list.id);
                }}
                className={`
                ${
                  active === list.id
                    ? " border-b-2 border-[#222222] rounded-none transition duration-200"
                    : " opacity-80"
                }
                `}
              >
                <p
                  className={`text-sm sm:text-base text-[#222222] cursor-pointer hover:bg-[#f0f0f0] p-2 transition duration-300 rounded-lg ${
                    active === list.id ? " font-medium mb-1" : " opacity-80"
                  }`}
                >
                  {list?.name}
                </p>
              </div>
            );
          })}
        </div>
        <hr className=" absolute bottom-[1px] w-full h-[1px] bg-[#dddddd] z-0" />
      </div>
    </section>
  );
};

export default ReservationsList;
