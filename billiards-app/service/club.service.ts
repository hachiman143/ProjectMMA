import axiosInstance from "./main.service";

export const ClubService = {
  getAll: async () => {
    const response = await axiosInstance.get("/clubs");
    return response.data;
  },
  getDetailId: async (id: string) => {
    const response = await axiosInstance.get(`/clubs/${id}`);
    return response.data;
  },
  getAllClubsForAdmin: async () => {
    const response = await axiosInstance.get("/clubs/admin"); // API dành riêng cho admin
    return response.data;
  },

  // 🆕 Hàm xoá quán
  deleteClub: async (id: string) => {
    const response = await axiosInstance.delete(`/clubs/${id}`);
    return response.data;
  },
};
