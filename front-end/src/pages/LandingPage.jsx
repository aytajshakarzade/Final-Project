import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <>
            ...
            <button
                onClick={() => navigate("/auth")}
            >
                Panelə daxil ol
            </button>
        </>
    );
}