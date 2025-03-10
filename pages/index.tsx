import { useRef, useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";
import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import LoadingDots from "@/components/ui/LoadingDots";
import { Document } from "langchain/document";
import { useRouter } from "next/router";
import StreamingComponent from "@/components/utils/streaming";
import { DisclaimerButton } from "@/components/ui/DisclaimerButton";
import { useBotDetails } from "@/store/useBotDetails";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const { name, initial_message, bot_profile_pic, setChatbotDetails } =
    useBotDetails();
  const chatbotid = useRouter().query?.chatbotId as string;
  const showSource = useRouter().query?.source as string;
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: initial_message
          ? initial_message
          : "Hi, what would you like to learn about this document?",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert("Please input a question");
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
        {
          type: "apiMessage",
          isStreaming: true,
          message: "Loading...",
        },
      ],
    }));

    setLoading(true);
    setQuery("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          history,
          namespace: chatbotid,
        }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => {
          const messages = state.messages.filter(
            (message) => !message.isStreaming
          );
          return {
            ...state,
            messages: [
              ...messages,
              {
                type: "apiMessage",
                message: data.text,
                sourceDocs: data.sourceDocuments,
              },
            ],
            history: [...state.history, [question, data.text]],
          };
        });
      }
      console.log("messageState", messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };
  return (
    <div
      className={`bg-white  ${
        showSource === "true" ? "h-allscreen-auto" : "h-allscreen"
      }`}
    >
      <div className={`${showSource === "true" && "border rounded-md"}`}>
        <div className="h-16 bg-black text-white rounded-b-sm flex justify-between px-4 items-center">
          <div className="flex space-x-2 items-center justify-center">
            <div>
              {bot_profile_pic && (
                <img
                  className="w-10 h-10 rounded-full object-contain"
                  src={bot_profile_pic}
                  alt="Bot profile picture"
                  width={48}
                  height={48}
                />
              )}
            </div>
            <div>{name}</div>
          </div>
          <div className="flex items-center gap-3">
            <svg
              onClick={setChatbotDetails}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 cursor-pointer hover:text-neutral-400 mr-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <div className="w-5 h-5"></div>
          </div>
        </div>
        <div
          className={
            showSource === "true" ? styles.cloudWithSource : styles.cloud
          }
        >
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => {
              if (
                message.type === "apiMessage" &&
                !message.isStreaming &&
                messages.length === index + 1 &&
                index !== 0
              ) {
                return (
                  <div
                    className={`${
                      message.type === "apiMessage"
                        ? styles.apibg
                        : styles.userbg
                    } flex  gap-1 items-center`}
                  >
                    <StreamingComponent
                      message={message.message}
                      callBack={() => {
                        textAreaRef.current?.focus();
                        if (messageListRef.current) {
                          messageListRef.current.scrollTop =
                            messageListRef.current.scrollHeight;
                        }
                      }}
                    />
                  </div>
                );
              }
              if (message.type === "apiMessage" && message.isStreaming) {
                return (
                  <div key={`chatMessage-${index}`}>
                    <div className={styles.apibg}>
                      <div
                        className={`${styles.animateBlink}  w-1.5 h-5 bg-slate-500`}
                      />
                    </div>
                  </div>
                );
              }
              return (
                <>
                  <div key={`chatMessage-${index}`}>
                    <div
                      className={`flex ${
                        message.type === "apiMessage"
                          ? `justify-start`
                          : `justify-end`
                      }`}
                    >
                      <ReactMarkdown
                        linkTarget="_blank"
                        className={
                          message.type === "apiMessage"
                            ? styles.apibg
                            : styles.userbg
                        }
                      >
                        {message.message}
                      </ReactMarkdown>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="relative px-4">
          <textarea
            disabled={loading}
            onKeyDown={handleEnter}
            ref={textAreaRef}
            autoFocus={false}
            rows={1}
            maxLength={512}
            id="userInput"
            name="userInput"
            placeholder={
              loading ? "Waiting for response..." : "Type a message ..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.textarea}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.generatebutton}
          >
            {loading ? (
              <div className={styles.loadingwheel}>
                <LoadingDots color="#000" />
              </div>
            ) : (
              // Send icon SVG in input field
              <svg
                viewBox="0 0 20 20"
                className={styles.svgicon}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            )}
          </button>
        </form>
      </div>
      <div className="text-center py-1 font-semibold text-black  flex justify-center items-center space-x-1">
        Powered by{" "}
        <a
          href="https://koretex.ai"
          target="_blank"
          rel="noreferrer"
          className="underline text-black ml-1 relative"
        >
          Koretex AI
        </a>
        <DisclaimerButton />
      </div>
      {showSource === "true" && (
        <>
          <div className="flex flex-col">
            {[...messages]
              .reverse()
              .find((message) => message?.sourceDocs)
              ?.sourceDocs?.map((doc, index) => (
                <div key={`messageSourceDocs-${index}`}>
                  <Accordion type="single" collapsible className="flex-col">
                    <AccordionItem value={`item-${index}`}>
                      <AccordionTrigger>
                        <h3>Source {index + 1}</h3>
                      </AccordionTrigger>
                      <AccordionContent>
                        {doc.pageContent}
                        <p className="mt-2">
                          <b>Source:</b> {doc.metadata.source}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
          </div>
        </>
      )}
      {error && (
        <div className="border border-red-400 rounded-md p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
