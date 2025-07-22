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
  updateBookingStatus: async (bookingId: string, status: string) => {
  const response = await axiosInstance.put(`/bookings/${bookingId}/status`, { status});
  return response.data;
},


  cancelBooking: async (bookingId: string, reason?: string) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
 getAllUserBookings: async () => {
    const res = await axiosInstance.get("/bookings/admin/all"); // endpoint cho admin
    return res.data;
  },
};
