import { useEffect, useState } from "react";

const monthNames = [
    { id: 1, label: "Jan" },
    { id: 2, label: "Feb" },
    { id: 3, label: "Mar" },
    { id: 4, label: "Apr" },
    { id: 5, label: "May" },
    { id: 6, label: "Jun" },
    { id: 7, label: "Jul" },
    { id: 8, label: "Aug" },
    { id: 9, label: "Sep" },
    { id: 10, label: "Oct" },
    { id: 11, label: "Nov" },
    { id: 12, label: "Dec" },
];

const formatDate = (date) => {
    const d = new Date(date);
    const month = monthNames[d.getMonth()].label;
    const day = d.getDate();
    return `${month} ${day}`;
};

const getYear = (date) => {
    const d = new Date(date);
    return d.getFullYear();
}

const getMonth = (date) => {
    const d = new Date(date);
    return d.getMonth();
}

export const useDateFormatting = (dateObj) => {
    const [formattedDates, setFormattedDates] = useState("");

    useEffect(() => {
        if (dateObj.checkin && dateObj.checkout) {
            const checkin = formatDate(dateObj.checkin);
            const checkout = formatDate(dateObj.checkout);

            const checkinMonth = getMonth(dateObj.checkin)
            const checkoutMonth = getMonth(dateObj.checkout)

            const checkinYear = getYear(dateObj.checkin)
            const checkOutYear = getYear(dateObj.checkout)

            if (dateObj.checkin !== dateObj.checkout) {
                if (checkinMonth !== checkoutMonth && checkinYear === checkOutYear) {
                    return setFormattedDates(`${checkin} - ${checkout}, ${checkinYear}`);
                }
                if (checkinYear !== checkOutYear) {
                    return setFormattedDates(`${checkin}, ${checkinYear} - ${checkout}, ${checkOutYear}`);
                }
                setFormattedDates(`${checkin} - ${checkout}`);
            } else {
                setFormattedDates(checkin);
            }
        }
    }, [dateObj]);

    return formattedDates;
};
