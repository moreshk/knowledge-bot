import { supabase } from "@/components/utils/supabase";
import Router from "next/router";
import { create } from "zustand";

type ChatbotDetailsStore = {
 name: string,
 about_us: string,
 business_name: string,
 initial_message: string,
 temperature: number,
 disclaimer: string,
 ai_model: string,
 bot_profile_pic: string,
 setChatbotDetails: () => Promise<void>,
 loading: boolean,
};

export const useBotDetails = create<ChatbotDetailsStore>(set => ({
 name: "",
 about_us: "",
 business_name: "",
 initial_message: '',
 temperature: 0,
 ai_model: "gpt-3.5-turbo",
 disclaimer: '',
 bot_profile_pic: '',
 loading: true,
 setChatbotDetails: async () => {
  set((oldData) => ({ ...oldData, loading: true }));
  const chatbotId = Router.query.chatbotId;
  const { data, error } = await supabase
   .from('chatbots')
   .select('name, about_us, business_name, initial_message, temperature, ai_model, disclaimer, bot_profile_pic')
   .eq('id', chatbotId);
  if (error) {
   console.log(error);
   set((oldData) => ({ ...oldData, loading: false }))
   return;
  }
  if (data && data.length > 0) {
   set((state) => ({ ...state, ...data[0], loading: false }));
  }
 },
}));
