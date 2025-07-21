import axiosInstance from "./main.service";

export const BookingService = {
  createBooking: async (payload: any) => {
    const response = await axiosInstance.post("/bookings", payload);
    return response.data;
  },
  getUserBooking: async () => {
    const response = await axiosInstance.get("/bookings");
    return response.data;
  },
};
