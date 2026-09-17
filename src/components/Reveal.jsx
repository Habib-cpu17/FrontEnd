import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect user preference
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        // NEW: Track if the component is still mounted
        let isMounted = true;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // NEW: Only update state if the component is still mounted
                    if (isMounted) {
                        setVisible(true);
                    }
                    io.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
        );

        io.observe(el);

        return () => {
            // NEW: Set to false on cleanup so the observer knows the component is gone
            isMounted = false;
            io.disconnect();
        };
    }, []);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? "in" : ""} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </Tag>
    );
}