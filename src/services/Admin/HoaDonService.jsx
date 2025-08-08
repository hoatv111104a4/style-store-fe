import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/hoa-don",
  timeout: 5000,
});

export const listHoaDon = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get("", {
      params: { page, size },
    });
    return {
      content: response.data.content || [],
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    throw error;
  }
};

export const listAllHoaDon = async () => {
  try {
    let allHoaDon = [];
    let page = 0;
    let totalPages = 1;
    while (page < totalPages) {
      const response = await apiClient.get("", {
        params: { page, size: 100 }, // Lấy 100 hóa đơn mỗi lần để tối ưu
      });
      allHoaDon = [...allHoaDon, ...(response.data.content || [])];
      totalPages = response.data.totalPages || 1;
      page++;
    }
    return allHoaDon;
  } catch (error) {
    console.error("Lỗi khi lấy toàn bộ danh sách hóa đơn:", error);
    throw error;
  }
};

export const searchHoaDon = async (ma, page = 0, size = 10) => {
  try {
    const response = await apiClient.get("/search", {
      params: { ma, page, size },
    });
    return {
      content: response.data.content || [],
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
    };
  } catch (error) {
    console.error("Lỗi khi tìm kiếm hóa đơn:", error);
    throw error;
  }
};

export const addHoaDon = async (hoaDonData) => {
  try {
    const response = await apiClient.post("", hoaDonData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm hóa đơn:", error);
    throw error;
  }
};

export const getHoaDonById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy hóa đơn với id=${id}:`, error);
    throw error;
  }
};

export const updateHoaDon = async (id, hoaDonData) => {
  try {
    const response = await apiClient.put(`/${id}`, hoaDonData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật hóa đơn:", error);
    throw error;
  }
};

export const updateStatusHoaDon = async (id, newStatus) => {
  try {
    const response = await apiClient.put(
      `/${id}/status`,
      { trangThai: newStatus },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái hóa đơn với id=${id}:`, error);
    throw error;
  }
};

export const deleteHoaDon = async (id) => {
  try {
    await apiClient.delete(`/${id}`);
  } catch (error) {
    console.error(`Lỗi khi xóa hóa đơn với id=${id}:`, error);
    throw error;
  }
};