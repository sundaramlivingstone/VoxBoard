import React, { useState, useRef } from "react";

const VoiceRecorder = ({ onCommandDetected }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1 }, // Better for ASR
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("🔴 Captured audio chunk:", event.data);
          audioChunksRef.current.push(event.data); // Store recorded chunks
        } else {
          console.warn("⚠️ Empty audio chunk received!");
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🛑 MediaRecorder stopped.");

        // Combine chunks into a single Blob
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        console.log("📏 Recorded audio Blob:", recordedBlob);
        console.log("📢 Blob size:", recordedBlob.size, "bytes");

        if (recordedBlob.size === 0) {
          console.error("❌ Audio blob is empty! Recording failed.");
        } else {
          console.log("✅ Audio recording successful!");
        }

        // 🔊 Play the recorded audio before sending
        const audioURL = URL.createObjectURL(recordedBlob);
        const audio = new Audio(audioURL);
        audio.play();
        console.log("🔊 Playing recorded audio:", audioURL);

        // 🚀 Send to Flask backend
        await sendAudioToServer(recordedBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("🎙️ MediaRecorder started recording...");

      // ⏳ Stop recording after 5 seconds (adjust if needed)
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 5000);
    } catch (error) {
      console.error("🚫 Microphone access error:", error);
    }
  };

  const sendAudioToServer = async (blob) => {
    console.log("📤 Sending audio to Flask backend...");

    const formData = new FormData();
    formData.append("audio", blob, "command.webm");

    try {
      const response = await fetch("http://127.0.0.1:5000/process-command", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`❌ Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("🧠 AI Response:", result);

      if (result.action === "unknown_command") {
        console.warn("⚠️ Unknown command received:", result);
      } else {
        console.log("✅ Recognized command:", result.action);
        // 🔥 Pass the command to the parent component (Whiteboard)
        onCommandDetected(result.action);
      }
    } catch (error) {
      console.error("❌ Error sending audio:", error);
    }
  };

  return (
    <button onClick={startRecording} className="icon-btn" title="Voice Command">
      {isRecording ? (
        <span className="text-red-500 animate-pulse">🎙️</span>
      ) : (
        <span>🎤</span>
      )}
    </button>
  );
};

export default VoiceRecorder;
