import {
    PiHouseLine, PiTent,
    PiCampfireLight,

} from "react-icons/pi";
import {
    MdOutlineApartment,
    MdOutlineCabin,
    MdOutlineCastle,
} from "react-icons/md";
import { TbSailboat2, TbCamper } from "react-icons/tb";
import {
    GiMountainCave,
    GiLightningDome,
    GiControlTower,
    GiTreehouse,
} from "react-icons/gi";
import { GoContainer } from "react-icons/go";
import { RiEarthquakeLine } from "react-icons/ri";
import { LiaHotelSolid } from "react-icons/lia";
import {
    MdOutlinePool,
    MdOutlineOutdoorGrill,
} from "react-icons/md";
import { GiTennisCourt, GiSkier } from "react-icons/gi";

export const categoryApi = [
    { id: 1, name: "House", svg: PiHouseLine },
    { id: 2, name: "Apartment", svg: MdOutlineApartment },
    { id: 3, name: "Tree house", svg: GiTreehouse },
    { id: 4, name: "Boat", svg: TbSailboat2 },
    { id: 5, name: "Cabin", svg: MdOutlineCabin },
    { id: 6, name: "Camper", svg: TbCamper },
    { id: 7, name: "Castle", svg: MdOutlineCastle },
    { id: 8, name: "Cave", svg: GiMountainCave },
    { id: 9, name: "Container", svg: GoContainer },
    { id: 10, name: "Dome", svg: GiLightningDome },
    { id: 11, name: "Earth home", svg: RiEarthquakeLine },
    { id: 12, name: "Tent", svg: PiTent },
    { id: 13, name: "Tower", svg: GiControlTower },
    { id: 14, name: "Hotel", svg: LiaHotelSolid },
    { id: 15, name: "Pool", svg: MdOutlinePool },
    { id: 16, name: "Grill", svg: MdOutlineOutdoorGrill },
    { id: 17, name: "Campfire", svg: PiCampfireLight },
    { id: 19, name: "Tennis court", svg: GiTennisCourt },
    { id: 20, name: "Ski in/ Ski out", svg: GiSkier },
]
