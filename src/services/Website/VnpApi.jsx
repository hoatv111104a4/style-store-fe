import axios from "axios";

export const submitVNPayOrder = async (amount, orderInfo) => {
  const res = await axios.post(
    "http://localhost:8080/api/vnpay/submitOrder",
    null,
    {
      params: { amount, orderInfo },
    }
  );
  return res.data; // trả về url thanh toán
};