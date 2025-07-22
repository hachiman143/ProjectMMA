import axiosInstance from "@/service/main.service";

export const UserService = {
  getAllUsers: async (params: any) => {
    const res = await axiosInstance.get("/users", { params });
    return res.data;
  },

  getUser: async (id: string) => {
    const res = await axiosInstance.get(`/users/${id}`);
    return res.data;
  },

  updateUser: async (id: string, payload: any) => {
    const res = await axiosInstance.put(`/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
  }
};
