import axiosInstance from "./main.service";

export interface FeedbackPayload {
  clubId: string;
  rating: number; // 1–5
  content: string;
}

export interface Feedback {
  _id: string;
  userId: string;
  clubId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export const FeedbackService = {
  create: async (payload: FeedbackPayload): Promise<Feedback> => {
    const res = await axiosInstance.post<Feedback>("/feedbacks", payload);
    return res.data;
  },

  getByClub: async (clubId: string): Promise<Feedback[]> => {
    const res = await axiosInstance.get<Feedback[]>(`/feedbacks/${clubId}`);
    return res.data;
  },
};
