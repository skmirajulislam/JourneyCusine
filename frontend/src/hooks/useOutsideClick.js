import { useEffect, useState } from "react"

export const useOutsideClick = (ref) => {
    const [state, setState] = useState(false)
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setState(false);
            }
        }
        document.addEventListener("mouseup", handleOutsideClick)
        return () => {
            document.removeEventListener("mouseup", handleOutsideClick)
        }
    }, [ref, setState])
    return { state, setState };
}