import { useEffect, useRef, useState } from "react";

export default function Counter({ to, duration = 1400, className = "", suffix = "" }) {
    const ref = useRef(null);
    const [val, setVal] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setVal(to);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || started.current) return;
                started.current = true;
                io.disconnect();
                const start = performance.now();
                const tick = (now) => {
                    const p = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - p, 3);
                    setVal(Math.round(to * eased));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [to, duration]);

    return (
        <span ref={ref} className={className}>
      {val.toLocaleString()}
            {suffix}
    </span>
    );
}