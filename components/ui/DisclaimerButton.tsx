import { useBotDetails } from "@/store/useBotDetails";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useStore } from "zustand";

export const DisclaimerButton = () => {
  const { disclaimer } = useStore(useBotDetails);

  return (
    <div>
      <p id="tool-tip">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </p>
      <Tooltip
        anchorSelect="#tool-tip"
        content={
          disclaimer
            ? disclaimer
            : "This AI chatbot is designed to assist you, but please be aware that it may occasionally provide incorrect or misleading information due to limitations in its programming. The chatbot's responses do not reflect the views or values of our organization, as it generates responses based on its training data, not personal beliefs. If you notice any issues, please report them to us immediately. Always cross-verify information from this chatbot before making important decisions."
        }
        place="top"
        style={{
          backgroundColor: "rgb(42, 39, 39)",
          color: "#ffffff",
          width: "300px",
          fontSize: "12px",
          fontWeight: "300",
        }}
        className="rounded-lg"
      />
    </div>
  );
};
