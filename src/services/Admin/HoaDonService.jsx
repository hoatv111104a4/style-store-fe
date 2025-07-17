import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/hoa-don",
  timeout: 5000,
});

export const listHoaDon = async () => {
  try {
    const response = await apiClient.get("");
    return response.data.content;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
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

export const searchHoaDon = async (ma) => {
  try {
    const response = await apiClient.get(
      `/search?ma=${encodeURIComponent(ma)}`
    );
    return response.data.content || response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm hóa đơn:", error);
    throw error;
  }
};
