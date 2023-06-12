import {
    createBrowserSupabaseClient,
    User
  } from '@supabase/auth-helpers-nextjs';
  
  import { ProductWithPrice } from 'types';
  import type { Database } from 'types_db';
  
  export const supabase = createBrowserSupabaseClient<Database>();
  
  export const getActiveProductsWithPrices = async (): Promise<
    ProductWithPrice[]
  > => {
    const { data, error } = await supabase
      .from('products')
      .select('*, prices(*)')
      .eq('active', true)
      .eq('prices.active', true)
      .order('metadata->index')
      .order('unit_amount', { foreignTable: 'prices' });
  
    if (error) {
      console.log(error.message);
    }
    // TODO: improve the typing here.
    return (data as any) || [];
  };
  
  export const updateUserName = async (user: User, name: string) => {
    await supabase
      .from('users')
      .update({
        full_name: name
      })
      .eq('id', user.id);
  };
  
  export const createChatbot = async (user: User, prompt: string) => {
    const { error: supabaseError } = await supabase
      .from('chatbots')
      .insert({ user_id: user.id, prompt: prompt });
    if (supabaseError) throw supabaseError;
    console.log('New chatbot created and inserted');
    return user.id;
  };
  
  export const getChatbotsByUserId = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select()
        .eq('user_id', user.id);
  
      if (error) {
        throw error;
      }
  
      return data;
    } catch (error) {
      console.log('Error retrieving chatbots:', error);
      throw error;
    }
  };
  
  
  export async function getChatbotQuestions(chatbotId: string) {
    let { data, error } = await supabase
      .from('chat_questions')
      .select('question')
      .eq('chatbot_id', chatbotId)
      .order('question_number', { ascending: true }) // sorting by question_number
  
    // initialize an empty result object
    const result: { [key: string]: string } = {};
  
    if (error) {
      console.error('Error fetching data: ', error);
      return result;  // return empty object in case of error
    }
  
    if (!data) {
      return result;  // return empty object if data is null
    }
  
    // for each data item, update the corresponding property in the result object
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const key = item.question.toLowerCase().replace(/ /g, "_"); //sanitize question to use as key
      result[key] = item.question; // you can replace item.question with the description you want
    }
  
    // return the result object
    return result;
  }
  
  
  
  export async function getUserResponses(sessionId: string, chatbotId: string) {
    let { data, error } = await supabase
      .from('user_response')
      .select('user_question, bot_answer')
      .eq('session_id', sessionId)
      .eq('chatbot_id', chatbotId)
      .order('created_at')
  
    if (error || !data) {
      console.error('Error fetching data: ', error);
      return '';
    } else {
      return data.map(obj => {
        let userQuestion = obj.user_question;
        
        // Add a period to the end of the user's question if it's not already there and does not end with a sentence completer
        if (!/[\.\?!]$/.test(userQuestion)) {
          userQuestion += '.';
        }
  
        return `User said ${userQuestion} Bot said ${obj.bot_answer}`;
      }).join(' ');
    }
  }
  
  