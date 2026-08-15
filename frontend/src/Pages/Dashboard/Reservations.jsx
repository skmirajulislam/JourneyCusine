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
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-10 xl:px-20 py-5 md:py-12 min-h-[70vh]">
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
