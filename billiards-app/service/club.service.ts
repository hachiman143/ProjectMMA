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
};
