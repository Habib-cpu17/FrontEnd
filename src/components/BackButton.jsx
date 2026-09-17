import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back", to = null }) {
    const navigate = useNavigate();

    const onClick = () => {
        if (to) navigate(to);
        else navigate(-1);
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-[13px] text-dim hover:text-pink transition"
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
            </svg>
            {label}
        </button>
    );
}