import schoolIcon from "../../assets/basicIcon/userProfile/schoolIcon.png";
import workIcon from "../../assets/basicIcon/userProfile/workIcon.png";
import placeIcon from "../../assets/basicIcon/userProfile/placeIcon.png";
import songIcon from "../../assets/basicIcon/userProfile/songIcon.svg";
import loveIcon from "../../assets/basicIcon/userProfile/loveIcon.png";
import factIcon from "../../assets/basicIcon/userProfile/factIcon.svg";
import clockIcon from "../../assets/basicIcon/userProfile/clockIcon.svg";
import petIcon from "../../assets/basicIcon/userProfile/petIcon.png";

export const profileOptions = [
    {
        name: "Where I went to school",
        img: schoolIcon,
        popUpContent: {
            header: "Where did you go to school?",
            subHead: "Whether it's home school, high school, or trade school, name the school that made you who you are."
        },
        fieldName: "school"
    },
    {
        name: "My work",
        img: workIcon,
        popUpContent: {
            header: "What do you do for work?",
            subHead: "Tell us what your profession is. If you don't have a traditional job, tell us your life's calling. Example: Nurse, parent to four kids, or retired surfer."
        },
        fieldName: "profession"
    },
    {
        name: "Where I live",
        img: placeIcon,
        popUpContent: {
            header: "Where you live?",
            subHead: "Tell us where you live so we can share best apartments to you and share best and affordable prices houses."
        },
        fieldName: "presentAddress"
    },
    {
        name: "My favourite song in high school",
        img: songIcon,
        popUpContent: {
            header: "What was your favorite song in high school?",
            subHead: "However embarrassing, share the tune you listened to on repeat as a teenager."
        },
        fieldName: "favoriteSong"
    },
    {
        name: "I am obsessed with",
        img: loveIcon,
        popUpContent: {
            header: "What are you obsessed with?",
            subHead: "Share whatever you can`t get enough of in a good way. Example: Baking rosemary focaccia."
        },
        fieldName: "obsessedWith"
    },
    {
        name: "My fun fact",
        img: factIcon,
        popUpContent: {
            header: "What’s a fun fact about you?",
            subHead: "Share something unique or unexpected about you. Example: I was in a music video or I’m a juggler."
        },
        fieldName: "funFact"
    },
    {
        name: "I spend too much time",
        img: clockIcon,
        popUpContent: {
            header: "What do you spend too much time doing?",
            subHead: "Share an activity or hobby you spend lots of free time on. Example: Watching cat videos or playing chess."
        },
        fieldName: "spendTime"
    },
    {
        name: "Pets",
        img: petIcon,
        popUpContent: {
            header: "Do you have any pets in your life?",
            subHead: "Share any pets you have and their names. Example: My calico cat Whiskers, or Leonardo my speedy turtle."
        },
        fieldName: "pets"
    },
];