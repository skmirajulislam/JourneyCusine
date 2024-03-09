import DashboardCards from "../../components/dashboard/DashboardCards";

const Orders = () => {
  return (
    <section className=" max-w-[1200px] mx-auto xl:px-10 py-12">
      <DashboardCards />
      <div className="bg-white shadow rounded-xl border flex flex-col gap-5 p-7">
        <p className=" text-center">Not a single house booked yet</p>
      </div>
    </section>
  );
};

export default Orders;
