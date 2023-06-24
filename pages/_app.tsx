import { useBotDetails } from "@/store/useBotDetails";
import "@/styles/base.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { useStore } from "zustand";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

function MyApp({ Component, pageProps }: AppProps) {
  const { setChatbotDetails, loading } = useStore(useBotDetails);

  useEffect(() => {
    window.addEventListener("resize", function () {
      document.documentElement.style.setProperty(
        "--vh",
        window.innerHeight * 0.01 + "px"
      );
    });

    window.addEventListener("load", function () {
      document.documentElement.style.setProperty(
        "--vh",
        window.innerHeight * 0.01 + "px"
      );
    });
  }, []);

  useEffect(() => {
    setChatbotDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen my-auto bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="black"
          className="w-6 h-6 animate-spin"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
