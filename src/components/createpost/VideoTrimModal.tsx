"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  Scissors,
  Loader2,
  Check,
  RotateCcw,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VideoTrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoFile: File | null;
  onTrimComplete: (trimmedFile: File, trimmedDuration: number, previewUrl: string) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00.0";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}.${ms}`;
};

const formatSecondsOnly = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0.0s";
  return `${(Math.round(seconds * 10) / 10).toFixed(1)}s`;
};

export default function VideoTrimModal({
  isOpen,
  onClose,
  videoFile,
  onTrimComplete,
}: VideoTrimModalProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(60);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [trimProgress, setTrimProgress] = useState<number>(0);
  const [trimError, setTrimError] = useState<string>("");

  // Dragging state for timeline
  const [activeDrag, setActiveDrag] = useState<"start" | "end" | "window" | "playhead" | null>(null);
  const dragStartXRef = useRef<number>(0);
  const dragInitialStartRef = useRef<number>(0);
  const dragInitialEndRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load video source
  useEffect(() => {
    if (!videoFile) {
      setVideoSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(videoFile);
    setVideoSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [videoFile]);

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration || 0;
    setTotalDuration(duration);
    setStartTime(0);
    const initialEnd = Math.min(60, duration);
    setEndTime(initialEnd);
    setCurrentTime(0);
    setTrimError("");
  };

  // Keep time updated during playback
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Loop or stop at endTime
    if (curr >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = startTime;
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (!videoRef.current || !totalDuration) return;
    const clamped = Math.max(0, Math.min(time, totalDuration));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const setStartTimeSafe = (newStart: number) => {
    if (!totalDuration) return;
    const clamped = Math.max(0, Math.min(newStart, endTime - 0.5));
    setStartTime(clamped);
    seekTo(clamped);
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setEndTimeSafe = (newEnd: number) => {
    if (!totalDuration) return;
    const clamped = Math.min(totalDuration, Math.max(newEnd, startTime + 0.5));
    setEndTime(clamped);
    seekTo(clamped);
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Micro adjustments
  const adjustStartTime = (delta: number) => {
    setStartTimeSafe(startTime + delta);
  };

  const adjustEndTime = (delta: number) => {
    setEndTimeSafe(endTime + delta);
  };

  // Snap to current playhead
  const setStartToCurrent = () => {
    if (currentTime < endTime - 0.5) {
      setStartTimeSafe(currentTime);
    }
  };

  const setEndToCurrent = () => {
    if (currentTime > startTime + 0.5) {
      setEndTimeSafe(currentTime);
    }
  };

  const selectedDuration = Math.max(0, endTime - startTime);
  const isDurationValid = selectedDuration >= 9.5 && selectedDuration <= 60;

  // Preset buttons
  const applyPreset = (durationSecs: number) => {
    if (!totalDuration) return;
    // For 10s preset, allocate 10.5s so client-side encoding guarantees >= 10s duration
    const targetSecs = durationSecs === 10 ? 10.5 : Math.min(60, durationSecs);
    const newEnd = Math.min(totalDuration, startTime + targetSecs);
    if (newEnd - startTime < targetSecs && totalDuration >= targetSecs) {
      // If we hit the right boundary, slide start left
      const newStart = Math.max(0, totalDuration - targetSecs);
      setStartTime(newStart);
      setEndTime(totalDuration);
      seekTo(newStart);
    } else {
      setEndTime(newEnd);
      seekTo(startTime);
    }
  };

  const resetSelection = () => {
    setStartTime(0);
    setEndTime(Math.min(60, totalDuration));
    seekTo(0);
  };

  // Drag interaction calculation
  const getTimeFromPointerX = useCallback(
    (clientX: number) => {
      if (!timelineRef.current || !totalDuration) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = relativeX / rect.width;
      return percentage * totalDuration;
    },
    [totalDuration]
  );

  const handlePointerDown = (
    e: React.PointerEvent,
    type: "start" | "end" | "window" | "playhead"
  ) => {
    e.stopPropagation();
    if (isTrimming || !totalDuration) return;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setActiveDrag(type);
    dragStartXRef.current = e.clientX;
    dragInitialStartRef.current = startTime;
    dragInitialEndRef.current = endTime;

    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeDrag || !totalDuration || !timelineRef.current) return;

      const currentPointerTime = getTimeFromPointerX(e.clientX);
      const rect = timelineRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartXRef.current;
      const deltaTime = (deltaX / rect.width) * totalDuration;

      if (activeDrag === "start") {
        const newStart = Math.max(0, Math.min(currentPointerTime, endTime - 0.5));
        setStartTime(newStart);
        seekTo(newStart);
      } else if (activeDrag === "end") {
        const newEnd = Math.min(totalDuration, Math.max(currentPointerTime, startTime + 0.5));
        setEndTime(newEnd);
        seekTo(newEnd);
      } else if (activeDrag === "window") {
        const duration = dragInitialEndRef.current - dragInitialStartRef.current;
        let newStart = dragInitialStartRef.current + deltaTime;
        let newEnd = dragInitialEndRef.current + deltaTime;

        if (newStart < 0) {
          newStart = 0;
          newEnd = duration;
        } else if (newEnd > totalDuration) {
          newEnd = totalDuration;
          newStart = totalDuration - duration;
        }

        setStartTime(newStart);
        setEndTime(newEnd);
        seekTo(newStart);
      } else if (activeDrag === "playhead") {
        seekTo(currentPointerTime);
      }
    },
    [activeDrag, totalDuration, endTime, startTime, getTimeFromPointerX]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      setActiveDrag(null);
    }
  };

  // Perform Client-side Canvas + MediaRecorder video rendering
  const handlePerformTrim = async () => {
    if (!videoFile || !videoSrc || !videoRef.current) return;

    if (selectedDuration < 9.5) {
      setTrimError("Selected clip must be at least 10 seconds.");
      return;
    }
    if (selectedDuration > 60) {
      setTrimError("Selected clip cannot exceed 60 seconds.");
      return;
    }

    try {
      setIsTrimming(true);
      setTrimProgress(0);
      setTrimError("");

      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }

      const sourceVideo = document.createElement("video");
      sourceVideo.src = videoSrc;
      sourceVideo.muted = false;
      sourceVideo.playsInline = true;
      sourceVideo.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        sourceVideo.onloadedmetadata = () => resolve();
        sourceVideo.onerror = () => reject(new Error("Failed to load video data for trimming"));
      });

      const videoWidth = sourceVideo.videoWidth || 1280;
      const videoHeight = sourceVideo.videoHeight || 720;

      const canvas = document.createElement("canvas");
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize video processing canvas");

      let combinedStream: MediaStream;
      const canvasStream = canvas.captureStream(30);

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const sourceNode = audioCtx.createMediaElementSource(sourceVideo);
          const destNode = audioCtx.createMediaStreamDestination();
          sourceNode.connect(destNode);
          sourceNode.connect(audioCtx.destination);

          const audioTracks = destNode.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            canvasStream.addTrack(audioTracks[0]);
          }
        }
        combinedStream = canvasStream;
      } catch {
        combinedStream = canvasStream;
      }

      const supportedMimeTypes = [
        "video/mp4;codecs=h264,aac",
        "video/mp4",
        "video/webm;codecs=h264,opus",
        "video/webm;codecs=vp9,opus",
        "video/webm",
      ];
      const selectedMime =
        supportedMimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 4_000_000,
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      const trimCompletePromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, { type: selectedMime });
          resolve(finalBlob);
        };
        recorder.onerror = (e) => reject(e);
      });

      sourceVideo.currentTime = startTime;
      await new Promise<void>((resolve) => {
        sourceVideo.onseeked = () => resolve();
      });

      recorder.start(100);
      sourceVideo.play();

      // Ensure min 10s recording duration so video duration metadata is never under 10.0s
      const targetDuration =
        selectedDuration >= 9.5 && selectedDuration <= 10.5
          ? 10.3
          : selectedDuration;
      const targetEndTime = Math.min(totalDuration, startTime + targetDuration);

      const drawLoop = () => {
        if (sourceVideo.paused || sourceVideo.ended) return;

        ctx.drawImage(sourceVideo, 0, 0, videoWidth, videoHeight);

        const currentRecTime = sourceVideo.currentTime;
        const progress = Math.min(
          99,
          Math.round(((currentRecTime - startTime) / selectedDuration) * 100)
        );
        setTrimProgress(progress);

        if (currentRecTime >= targetEndTime || sourceVideo.ended) {
          sourceVideo.pause();
          recorder.stop();
          return;
        }

        animationFrameRef.current = requestAnimationFrame(drawLoop);
      };

      animationFrameRef.current = requestAnimationFrame(drawLoop);

      const trimmedBlob = await trimCompletePromise;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sourceVideo.src = "";

      const ext = selectedMime.includes("mp4") ? ".mp4" : ".mp4";
      const baseName = videoFile.name.replace(/\.[^/.]+$/, "");
      const outputFilename = `${baseName}_trimmed${ext}`;
      const trimmedFile = new File([trimmedBlob], outputFilename, {
        type: selectedMime.includes("mp4") ? "video/mp4" : "video/mp4",
      });

      const newPreviewUrl = URL.createObjectURL(trimmedBlob);
      setTrimProgress(100);

      const reportedDuration =
        selectedDuration >= 9.5 && selectedDuration <= 10.4
          ? 10
          : Math.min(60, Math.round(selectedDuration * 10) / 10);

      onTrimComplete(trimmedFile, reportedDuration, newPreviewUrl);
      onClose();
    } catch (err: any) {
      console.error("Video trim error:", err);
      setTrimError(err.message || "Failed to trim video. Please try again.");
    } finally {
      setIsTrimming(false);
    }
  };

  if (!isOpen || !videoFile) return null;

  const startPercent = totalDuration > 0 ? (startTime / totalDuration) * 100 : 0;
  const endPercent = totalDuration > 0 ? (endTime / totalDuration) * 100 : 100;
  const currentPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Trim Video Clip</h2>
              <p className="text-xs text-blue-100/90 font-medium">
                Trim from start & end to choose any 10–60 second segment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isTrimming}
            className="p-2 text-white/75 hover:text-white hover:bg-white/15 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Video Preview Player */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl flex items-center justify-center group ring-1 ring-black/5">
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                muted={isMuted}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />
            )}

            {/* Play/Pause Central Floating Button */}
            <button
              type="button"
              onClick={togglePlay}
              disabled={isTrimming}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/65 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-10 border border-white/20"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>

            {/* Top-Left Live Status */}
            <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 border border-white/10 shadow">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-400">/</span>
              <span className="text-zinc-300">{formatTime(totalDuration)}</span>
            </div>

            {/* Top-Right Mute Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition border border-white/10 shadow"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Bottom In-range Indicator */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono font-medium text-cyan-300 border border-cyan-500/30">
                Start: {formatTime(startTime)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono font-medium text-purple-300 border border-purple-500/30">
                End: {formatTime(endTime)}
              </span>
            </div>
          </div>

          {/* Interactive Timeline Studio */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            {/* Timeline Header & Duration Pill */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Interactive Timeline
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  (Drag left/right handles or slide window)
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors shadow-sm ${
                  isDurationValid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : selectedDuration < 9.8
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}
              >
                <span>Clip Duration: {formatSecondsOnly(selectedDuration)}</span>
                <span className="text-[10px] font-normal opacity-90">
                  {selectedDuration < 9.8
                    ? "(Min 10s needed)"
                    : selectedDuration > 60
                    ? "(Max 60s allowed)"
                    : "(Valid ✓)"}
                </span>
              </div>
            </div>

            {/* Visual Timeline Track */}
            <div
              ref={timelineRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={(e) => {
                if (activeDrag || isTrimming) return;
                const clickedTime = getTimeFromPointerX(e.clientX);
                seekTo(clickedTime);
              }}
              className="relative h-16 bg-slate-800 rounded-xl overflow-visible select-none cursor-pointer border-2 border-slate-700/60 shadow-inner group"
            >
              {/* Timeline background strip pattern */}
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,transparent_2px,transparent_16px)] pointer-events-none" />

              {/* Inactive Left Mask */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-black/65 backdrop-blur-[1px] pointer-events-none rounded-l-lg transition-all"
                style={{ width: `${startPercent}%` }}
              />

              {/* Inactive Right Mask */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-black/65 backdrop-blur-[1px] pointer-events-none rounded-r-lg transition-all"
                style={{ width: `${100 - endPercent}%` }}
              />

              {/* Active Selected Range Box (Draggable Window) */}
              <div
                onPointerDown={(e) => handlePointerDown(e, "window")}
                className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-purple-500/25 border-y-2 border-blue-400 cursor-grab active:cursor-grabbing flex items-center justify-center group/window"
                style={{
                  left: `${startPercent}%`,
                  width: `${endPercent - startPercent}%`,
                }}
              >
                <div className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1 opacity-0 group-hover/window:opacity-100 transition-opacity pointer-events-none border border-white/20 shadow">
                  <MoveHorizontal className="w-3 h-3 text-cyan-400" />
                  <span>Slide Clip</span>
                </div>
              </div>

              {/* Left Handle (START POINT) */}
              <div
                onPointerDown={(e) => handlePointerDown(e, "start")}
                className="absolute top-[-4px] bottom-[-4px] w-6 -ml-3 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 rounded-lg shadow-xl cursor-ew-resize flex flex-col items-center justify-center z-30 transition-transform hover:scale-105 active:scale-110 border border-white/60"
                style={{ left: `${startPercent}%` }}
                title="Drag to trim Start Point"
              >
                <div className="w-1 h-5 bg-white rounded-full mb-0.5 shadow-sm" />
                <span className="text-[8px] font-black text-slate-900 uppercase tracking-tighter leading-none">
                  IN
                </span>

                {/* Floating start timestamp bubble */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-mono font-bold rounded-md shadow-md whitespace-nowrap pointer-events-none border border-white/20">
                  {formatTime(startTime)}
                </div>
              </div>

              {/* Right Handle (END POINT) */}
              <div
                onPointerDown={(e) => handlePointerDown(e, "end")}
                className="absolute top-[-4px] bottom-[-4px] w-6 -ml-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-400 rounded-lg shadow-xl cursor-ew-resize flex flex-col items-center justify-center z-30 transition-transform hover:scale-105 active:scale-110 border border-white/60"
                style={{ left: `${endPercent}%` }}
                title="Drag to trim End Point"
              >
                <div className="w-1 h-5 bg-white rounded-full mb-0.5 shadow-sm" />
                <span className="text-[8px] font-black text-white uppercase tracking-tighter leading-none">
                  OUT
                </span>

                {/* Floating end timestamp bubble */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-700 text-white text-[10px] font-mono font-bold rounded-md shadow-md whitespace-nowrap pointer-events-none border border-white/20">
                  {formatTime(endTime)}
                </div>
              </div>

              {/* Live Playhead Needle */}
              <div
                onPointerDown={(e) => handlePointerDown(e, "playhead")}
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-md z-20 pointer-events-none"
                style={{ left: `${currentPercent}%` }}
              >
                <div className="w-2.5 h-2.5 -ml-1 -top-1 bg-red-500 rounded-full border border-white shadow absolute" />
              </div>
            </div>

            {/* Fine-Tuning Precision Step Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Start Time Control Box */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-cyan-200/70 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">Start Point:</span>
                  <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 font-mono text-xs font-bold rounded-md border border-cyan-200">
                    {formatTime(startTime)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isTrimming || startTime <= 0}
                    onClick={() => adjustStartTime(-0.5)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition"
                    title="-0.5s"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isTrimming || startTime >= endTime - 0.5}
                    onClick={() => adjustStartTime(0.5)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition"
                    title="+0.5s"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isTrimming || currentTime >= endTime - 0.5}
                    onClick={setStartToCurrent}
                    className="ml-1 px-2 py-1 text-[11px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition"
                    title="Set start to current playback position"
                  >
                    Set Here
                  </button>
                </div>
              </div>

              {/* End Time Control Box */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-purple-200/70 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">End Point:</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-mono text-xs font-bold rounded-md border border-purple-200">
                    {formatTime(endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isTrimming || endTime <= startTime + 0.5}
                    onClick={() => adjustEndTime(-0.5)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition"
                    title="-0.5s"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isTrimming || endTime >= totalDuration}
                    onClick={() => adjustEndTime(0.5)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition"
                    title="+0.5s"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isTrimming || currentTime <= startTime + 0.5}
                    onClick={setEndToCurrent}
                    className="ml-1 px-2 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                    title="Set end to current playback position"
                  >
                    Set Here
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Duration Preset Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/60">
              <span className="text-xs text-slate-500 font-semibold mr-1">Quick Presets:</span>
              <button
                type="button"
                disabled={isTrimming || totalDuration < 10}
                onClick={() => applyPreset(10)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
              >
                10s (Min)
              </button>
              <button
                type="button"
                disabled={isTrimming || totalDuration < 15}
                onClick={() => applyPreset(15)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
              >
                15s
              </button>
              <button
                type="button"
                disabled={isTrimming || totalDuration < 30}
                onClick={() => applyPreset(30)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
              >
                30s
              </button>
              <button
                type="button"
                disabled={isTrimming || totalDuration < 60}
                onClick={() => applyPreset(60)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
              >
                60s (Max)
              </button>
              <button
                type="button"
                disabled={isTrimming}
                onClick={resetSelection}
                className="ml-auto flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {trimError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold animate-in fade-in">
              {trimError}
            </div>
          )}

          {/* Processing and Rendering Progress */}
          {isTrimming && (
            <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl flex flex-col gap-2.5 animate-in fade-in shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Rendering high-quality clip from {formatTime(startTime)} to {formatTime(endTime)}...
                </span>
                <span className="font-mono">{trimProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 transition-all duration-150 rounded-full"
                  style={{ width: `${trimProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Clip: <span className="font-bold text-slate-800">{formatTime(startTime)}</span> →{" "}
            <span className="font-bold text-slate-800">{formatTime(endTime)}</span> (
            {formatSecondsOnly(selectedDuration)})
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isTrimming}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePerformTrim}
              disabled={!isDurationValid || isTrimming}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTrimming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Trimming ({trimProgress}%)...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Trim & Apply Clip ({formatSecondsOnly(selectedDuration)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
