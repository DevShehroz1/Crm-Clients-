"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "recording" | "preview" | "uploading";

interface VoiceNoteRecorderProps {
  onRecorded: (blob: Blob, duration: number) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceNoteRecorder({
  onRecorded,
  disabled,
  className,
}: VoiceNoteRecorderProps) {
  const [state, setState] = useState<State>("idle");
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState("preview");
  }, []);

  const updateWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bars = 12;
    const step = Math.floor(data.length / bars);
    const vals: number[] = [];
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += data[i * step + j] || 0;
      vals.push(Math.min(100, (sum / step / 128) * 100));
    }
    setWaveform(vals);
    animationRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          blobRef.current = new Blob(chunksRef.current, { type: "audio/webm" });
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState("recording");
      setDuration(0);
      setWaveform(new Array(12).fill(10));

      let d = 0;
      timerRef.current = setInterval(() => {
        d += 1;
        setDuration(d);
      }, 1000);

      updateWaveform();
    } catch {
      alert("Microphone access is required.");
    }
  }, [disabled, updateWaveform]);

  const cancel = useCallback(() => {
    blobRef.current = null;
    setState("idle");
    setDuration(0);
    setWaveform([]);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const send = useCallback(() => {
    const blob = blobRef.current;
    if (blob) {
      setState("uploading");
      onRecorded(blob, duration);
      setState("idle");
      setDuration(0);
      setWaveform([]);
      blobRef.current = null;
    }
  }, [blobRef.current, duration, onRecorded]);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all",
          "hover:bg-slate-100 hover:text-slate-700 focus:outline-none",
          "disabled:opacity-50",
          className
        )}
        title="Record voice note"
      >
        <Mic className="h-5 w-5" />
      </button>
    );
  }

  if (state === "recording") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
          className
        )}
      >
        <button
          type="button"
          onClick={stopRecording}
          className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-red-100 text-red-600"
        >
          <Mic className="h-5 w-5" />
        </button>
        <div className="flex gap-1">
          {waveform.map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-violet-500 transition-all duration-75"
              style={{ height: `${Math.max(4, h)}px`, minHeight: 4 }}
            />
          ))}
        </div>
        <span className="font-mono text-sm text-slate-600">
          {Math.floor(duration / 60)}:{pad(duration % 60)}
        </span>
        <button
          type="button"
          onClick={stopRecording}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Stop
        </button>
      </div>
    );
  }

  if (state === "preview") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
          className
        )}
      >
        <div className="flex gap-1">
          {waveform.length > 0
            ? waveform.map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-slate-300"
                  style={{ height: `${Math.max(4, h)}px`, minHeight: 4 }}
                />
              ))
            : null}
        </div>
        <span className="font-mono text-sm text-slate-600">
          {Math.floor(duration / 60)}:{pad(duration % 60)}
        </span>
        <button
          type="button"
          onClick={cancel}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={send}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="h-2 w-24 animate-pulse rounded-full bg-slate-200" />
        <span className="text-sm text-slate-500">Uploading…</span>
      </div>
    );
  }

  return null;
}
