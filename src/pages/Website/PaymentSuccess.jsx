import React from "react";
import { Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <CheckCircleIcon style={{ fontSize: 80, color: "#4caf50" }} />
      <h2 style={{ color: "#4caf50", margin: "16px 0 8px" }}>Thanh toán thành công!</h2>
      <p>Cảm ơn bạn đã mua hàng tại Style Store.<br />Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.</p>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/")}>
        Về trang chủ
      </Button>
    </div>
  );
};

export default PaymentSuccess;