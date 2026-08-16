 
const ListingDescriptionPopup = ({ description }) => {
  return (
    <>
      <dialog id="listing_modal" className="modal">
        <div className="modal-box w-11/12 max-w-4xl bg-white dark:bg-[#1e1e1e]">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute left-4 top-6 dark:text-white">
              ✕
            </button>
          </form>
          <div className=" pt-16">
            <h3 className="font-bold text-2xl dark:text-white">About this place</h3>
            <p className="py-4 whitespace-pre-wrap text-[#717171] dark:text-[#a0a0a0]"
            >{description}</p>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ListingDescriptionPopup;
