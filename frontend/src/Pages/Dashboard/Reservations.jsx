import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/basicIcon/backIcon.png";
import ReservationsList from "../../components/dashboard/reservations/ReservationsList";
import ReservationsData from "../../components/dashboard/reservations/ReservationsData";
import { useState } from "react";

const Reservations = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState(() => {
    try {
      const saved = sessionStorage.getItem("reservationsPage");
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
    }
  });

  const handleTabChange = (id) => {
    setActivePage(id);
    sessionStorage.setItem("reservationsPage", JSON.stringify(id));
  };

  return (
    <section className="w-full max-w-[1240px] mx-auto px-3 sm:px-6 md:px-10 xl:px-20 py-4 sm:py-6 md:py-12 min-h-[70vh] overflow-x-hidden">
      <div
        onClick={() => {
          navigate("/");
        }}
        className="cursor-pointer hover:rounded-full hover:bg-[#f1f1f1] dark:hover:bg-[#252525] inline-block p-4 -ml-4 transition"
      >
        <img src={backIcon} alt="back" className="w-4 mix-blend-darken dark:invert" />
      </div>

      <ReservationsList active={activePage} setActivePage={handleTabChange} />
      <ReservationsData active={activePage} />
    </section>
  );
};

export default Reservations;
