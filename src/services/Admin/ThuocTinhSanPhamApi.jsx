import axios from "axios";

const API_URL_SP = "http://localhost:8080/api/admin-san-pham";
const API_URL_CL = "http://localhost:8080/api/chat-lieu";
const API_URL_MS = "http://localhost:8080/api/mau-sac";
const API_URL_KT = "http://localhost:8080/api/kich-thuoc";
const API_URL_XX = "http://localhost:8080/api/xuat-xu";
const API_URL_TH = "http://localhost:8080/api/thuong-hieu";


export const createSanPham = async (sanPham) => {
  try {
    const response = await axios.post(API_URL_SP, sanPham, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Trường hợp backend trả về lỗi (ví dụ BAD_REQUEST)
      throw error.response.data;
    } else {
      throw new Error("Lỗi kết nối server");
    }
  }
};



export const createChatLieu = async (chatLieu) => {
  try {
    const response = await axios.post(API_URL_CL, chatLieu, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Lỗi kết nối server");
    }
  }
};


export const createMauSac = async (mauSac) => {
  try {
    const response = await axios.post(API_URL_MS, mauSac, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Lỗi kết nối server");
    }
  }
};


export const createKichThuoc = async (kichThuoc) => {
  try {
    const response = await axios.post(API_URL_KT, kichThuoc, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Lỗi kết nối server");
    }
  }
};

export const createThuongHieu = async (thuongHieu) => {
  try {
    const response = await axios.post(API_URL_TH, thuongHieu, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Lỗi kết nối server");
    }
  }
};
export const createXuatXu = async (xuatXu) => {
  try {
    const response = await axios.post(API_URL_XX, xuatXu, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw new Error("Lỗi kết nối server");
    }
  }
};