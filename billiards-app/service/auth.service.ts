// import axiosInstance from "./main.service";

// export const AuthService = {
//   login: async (email: string, password: string) => {
//     const response = await axiosInstance.post("/auth/login", {
//       email,
//       password,
//     });
//     return response.data;
//   },
//   register: async (payload: {
//     name: string;
//     email: string;
//     phone: string;
//     password: string;
//   }) => {
//     const res = await axiosInstance.post("/auth/register", payload);
//     return res.data;
//   },
// };
import axiosInstance from "./main.service";

export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const res = await axiosInstance.post("/auth/register", payload);
    return res.data;
  },

  // Get the current user's profile
  getProfile: async () => {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data;
  },

  // Update the current user's profile
  updateProfile: async (payload: {
    name: string;
    email: string;
    phone: string;
  }) => {
    const response = await axiosInstance.put("/api/auth/me", payload);
    return response.data;
  },
};
