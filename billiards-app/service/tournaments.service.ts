import axiosInstance from "./main.service";

export const TournamentService = {
  getAll: async () => {
    const response = await axiosInstance.get("tournaments");
    return response.data;
  },
  register: async (id: string) => {
    const response = await axiosInstance.post(`tournaments/${id}/register`);
    return response.data;
  },
};
