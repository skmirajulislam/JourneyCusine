/* eslint-disable react/prop-types */
const ListingDescriptionPopup = ({ description }) => {
  return (
    <>
      <dialog id="listing_modal" className="modal">
        <div className="modal-box w-11/12 max-w-4xl">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute left-4 top-6">
              ✕
            </button>
          </form>
          <div className=" pt-16">
            <h3 className="font-bold text-2xl">About this place</h3>
            <p className="py-4 whitespace-pre-wrap"
              style={{
                color:'GrayText'
              }}
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
