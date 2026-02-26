"use client";

import { useCallback, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecorded: (blob: Blob, duration: number) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceRecorder({
  onRecorded,
  disabled,
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handlePointerDown = useCallback(
    async (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        chunksRef.current = [];
        mediaRecorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        mediaRecorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            onRecorded(blob, durationRef.current);
          }
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        durationRef.current = 0;
        setDuration(0);
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          durationRef.current += 1;
          setDuration((d) => d + 1);
        }, 1000);
      } catch {
        alert("Microphone access is required for voice notes.");
      }
    },
    [disabled, onRecorded]
  );

  const handlePointerUp = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handlePointerLeave = useCallback(() => {
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
          "focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && !isRecording && "text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:scale-95",
          isRecording && "bg-red-100 text-red-600 ring-2 ring-red-200"
        )}
        title="Hold to record voice note"
      >
        <Mic className="h-5 w-5" />
      </button>
      {isRecording && (
        <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {duration}s · Release to send
        </span>
      )}
    </div>
  );
}
