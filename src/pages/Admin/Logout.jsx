import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/dang-nhap", { replace: true });
    }, [navigate]);

    return null;
}

export default Logout;