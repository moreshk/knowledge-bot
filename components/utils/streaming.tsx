import { useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";

const StreamingComponent = ({
  message,
  callBack,
}: {
  message: string;
  callBack: () => void;
}) => {
  const [streamData, setStreamData] = useState("");
  const [completed, setCompleted] = useState(false); // New state variable for completion status

  useEffect(() => {
    let currentIndex = 0;
    const characters = message.split(""); // Split the message into an array of characters

    const stream = setInterval(() => {
      // Check if all characters have been streamed
      if (currentIndex >= characters.length) {
        clearInterval(stream);
        setCompleted(true); // Set completion status to true
        return;
      }

      // Get the next character and update the state
      const nextCharacter = characters[currentIndex];
      setStreamData((prevData) => prevData + nextCharacter);

      currentIndex++;
      callBack();
    }, 30); // Adjust the interval as needed (e.g., every 1 second)

    return () => {
      clearInterval(stream);
    };
  }, [message]);

  return (
    <div className="flex gap-1 items-center">
      {streamData}
      {/* Hide the line when characters are completed */}
      {!completed && (
        <div className={`${styles.animateBlink}  w-1.5 h-5 bg-slate-500`} />
      )}
    </div>
  );
};

export default StreamingComponent;
