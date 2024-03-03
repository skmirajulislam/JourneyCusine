import axios from "axios";
import { useEffect, useState } from "react"
import { API } from "../backend";

export const useGetSubCatListing = (cat) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        setIsLoading(true)
        const getSubCatListing = async () => {
            try {
                const res = await axios.post(`${API}house/get_listing_with_cat`, {
                    category: cat,
                });
                setData(res.data.catBasedListing)
                setIsLoading(false)
            } catch (error) {
                console.log(error)
                setIsLoading(false)
            } finally {
                setIsLoading(false)
            }
        }
        getSubCatListing()
    }, [cat])

    return { isLoading, data }
}