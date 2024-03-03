import { HiOutlineWifi } from "react-icons/hi";
import {
    PiTelevisionSimple,
    PiCampfireLight,
} from "react-icons/pi";
import {
    MdOutlineKitchen,
    MdOutlinePool,
    MdOutlineOutdoorGrill,
    MdDinnerDining,
} from "react-icons/md";
import { BiSolidWasher, BiSolidFirstAid } from "react-icons/bi";
import { AiOutlineCar, AiOutlineAlert } from "react-icons/ai";
import { CgPiano } from "react-icons/cg";
import { CiDumbbell } from "react-icons/ci";
import { FaShower } from "react-icons/fa";
import { TbBrandCarbon } from "react-icons/tb";
import { GiBathtub, GiTennisCourt } from "react-icons/gi";
import { BsSpeedometer2, BsSnow, BsPersonWorkspace } from "react-icons/bs";

export const amenities = [
    { id: 1, name: "Wifi", svg: HiOutlineWifi },
    { id: 2, name: "TV", svg: PiTelevisionSimple },
    { id: 3, name: "Kitchen", svg: MdOutlineKitchen },
    { id: 4, name: "Washer", svg: BiSolidWasher },
    { id: 5, name: "Paid parking", svg: BsSpeedometer2 },
    { id: 6, name: "Air conditioning", svg: BsSnow },
    { id: 7, name: "Dedicated workspace", svg: BsPersonWorkspace },
    { id: 8, name: "Free parking", svg: AiOutlineCar },
    { id: 9, name: "Pool", svg: MdOutlinePool },
    { id: 10, name: "Buthub", svg: GiBathtub },
    { id: 11, name: "Grill", svg: MdOutlineOutdoorGrill },
    { id: 12, name: "Campfire", svg: PiCampfireLight },
    { id: 13, name: "Outdoor dining area", svg: MdDinnerDining },
    { id: 14, name: "Piano", svg: CgPiano },
    { id: 15, name: "Exercise equipment", svg: CiDumbbell },
    { id: 16, name: "Outdoor Shower", svg: FaShower },
    { id: 17, name: "Tennis court", svg: GiTennisCourt },
    { id: 18, name: "Safety alerm", svg: AiOutlineAlert },
    { id: 19, name: "First aid kit", svg: BiSolidFirstAid },
    { id: 20, name: "Carbon monoxide alerm", svg: TbBrandCarbon },
]