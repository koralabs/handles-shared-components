import { useEffect, useState } from "react";

export const useContainerDimensions = (myRef: React.RefObject<any> | null) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const getDimensions = () => {
            return {
                width: myRef?.current?.offsetWidth ?? 0,
                height: myRef?.current?.offsetHeight ?? 0
            }
        }

        const handleResize = () => {
            setDimensions(getDimensions())
        }

        if (myRef?.current) {
            setDimensions(getDimensions())
        }


        window.addEventListener('load', handleResize)
        window.addEventListener("resize", handleResize)
        window.addEventListener("scroll", handleResize)
        const el = window.document.getElementById('design_container');
        let resizeObserver: ResizeObserver | undefined;
        if (el) {
            resizeObserver = new ResizeObserver(handleResize)
            resizeObserver.observe(el)
        }

        return () => {
            window.removeEventListener('load', handleResize)
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("scroll", handleResize)
            if (resizeObserver && el) {
                resizeObserver.unobserve(el)
            }
        }
    }, [myRef])

    return dimensions;
};