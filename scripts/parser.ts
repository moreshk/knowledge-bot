import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { getChatbotQuestions, getUserResponses } from "@/utils/supabase-client";

const chatbotId = 'd10b61c6-ad1c-421d-b538-b927ac806cc3';
const sessionId = '1d5fec3a-a345-4f1d-8add-dfad583ef388';

const questions = await getChatbotQuestions(chatbotId);
const responses = await getUserResponses(sessionId, chatbotId);
console.log('questions:' , questions);
console.log("\n=================================\n");
console.log('responses:' , responses);
console.log("\n=================================\n");


// const parser = StructuredOutputParser.fromNamesAndDescriptions({
//     what_is_your_email: "user's email address",
//     what_is_your_name: "user's name",
//     what_business_are_you_in: "business details",
//   what_is_your_phone: "user's phone number",
//   how_big_is_the_business: "business size",
// });

// const parser = StructuredOutputParser.fromNamesAndDescriptions({
//     name: "user's name",
//     phone: "user's phone number",
//     email: "user's email address",
//     business: "business details",
//     size: "business size",
//   });

const parser = StructuredOutputParser.fromNamesAndDescriptions(questions);

  
const formatInstructions = parser.getFormatInstructions();
const prompt = new PromptTemplate({
 template:
    "Extract the following information from the user's response:\n{format_instructions}\n{user_response}",
  inputVariables: ["user_response"],
  partialVariables: { format_instructions: formatInstructions },
});
const model = new OpenAI({ temperature: 0 });
// const input = await prompt.format({ user_response: "My name is Moresh, my number is (+61)459382104. My email is moreshk@gmail.com. I operate an AI solutions provider and I have a multi million dollar annual turnover." });
const input = await prompt.format({ user_response: responses });
const response = await model.call(input);
const parsedOutput = await parser.parse(response);
console.log(parsedOutput);