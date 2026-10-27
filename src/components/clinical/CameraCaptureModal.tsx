"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  X,
  RotateCcw,
  Check,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  SwitchCamera,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUri: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState<boolean>(true);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize or re-initialize camera stream
  const startCamera = useCallback(async (facing: "environment" | "user") => {
    stopStream();
    setError(null);
    setLoadingCamera(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC camera streaming is not supported by your browser environment.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission was denied. Please allow camera access in your browser settings or use the file upload fallback.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No video camera device was detected on your hardware.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError("The camera is currently in use by another application or browser tab.");
      } else {
        setError(err.message || "Failed to initialize video camera stream.");
      }
    } finally {
      setLoadingCamera(false);
    }
  }, [stopStream]);

  // Start stream when modal opens
  useEffect(() => {
    if (isOpen && !snapshot) {
      startCamera(facingMode);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, snapshot, facingMode, startCamera, stopStream]);

  // Handle Capture button click
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw current frame
    ctx.drawImage(video, 0, 0, width, height);
    const dataUri = canvas.toDataURL("image/jpeg", 0.95);

    setSnapshot(dataUri);
    stopStream();
  };

  // Handle Retake button click
  const handleRetake = () => {
    setSnapshot(null);
    startCamera(facingMode);
  };

  // Handle Confirm snapshot
  const handleConfirmSnapshot = () => {
    if (snapshot) {
      onCapture(snapshot);
      handleClose();
    }
  };

  // Handle camera flip
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    if (!snapshot) {
      startCamera(nextFacing);
    }
  };

  // Clean close
  const handleClose = () => {
    stopStream();
    setSnapshot(null);
    setError(null);
    onClose();
  };

  // Handle Native File Picker Fallback
  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
          handleClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 id="camera-modal-title" className="text-sm font-bold text-white tracking-tight">
                Live Prescription Scanner
              </h2>
              <p className="text-[11px] text-slate-400">
                {snapshot ? "Review captured scan" : "Align document inside guide"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder View / Snapshot Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[420px] overflow-hidden">
          {error ? (
            /* Error & Fallback View */
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Camera Unavailable</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => fallbackInputRef.current?.click()}
                  className="gap-2 text-xs"
                >
                  <UploadCloud className="w-4 h-4" /> Choose File / Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startCamera(facingMode)}
                  className="gap-2 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </Button>
              </div>
              <input
                ref={fallbackInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFallbackFileChange}
              />
            </div>
          ) : snapshot ? (
            /* Snapshot Review View */
            <div className="relative w-full h-full flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshot}
                alt="Captured prescription preview"
                className="max-h-[60vh] max-w-full rounded object-contain border border-slate-800 shadow-md"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-semibold text-teal-400 border border-teal-500/30">
                Frame Captured
              </div>
            </div>
          ) : (
            /* Live WebRTC Video Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[60vh]"
              />

              {/* Document Alignment Frame */}
              <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-teal-400/70 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="w-4 h-4 border-t-2 border-l-2 border-teal-400 -mt-3.5 -ml-3.5" />
                  <span className="w-4 h-4 border-t-2 border-r-2 border-teal-400 -mt-3.5 -mr-3.5" />
                </div>
                <div className="text-center">
                  <span className="bg-slate-950/80 text-teal-300 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border border-teal-500/30">
                    Align Prescription Inside Frame
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="w-4 h-4 border-b-2 border-l-2 border-teal-400 -mb-3.5 -ml-3.5" />
                  <span className="w-4 h-4 border-b-2 border-r-2 border-teal-400 -mb-3.5 -mr-3.5" />
                </div>
              </div>

              {loadingCamera && (
                <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                    Connecting camera feed...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {snapshot ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                className="gap-1.5 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Photo
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmSnapshot}
                className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-500 text-white"
              >
                <Check className="w-4 h-4" /> Use This Scan
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleToggleFacingMode}
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5"
                title="Switch front/rear camera"
              >
                <SwitchCamera className="w-4 h-4" /> Flip Camera
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={!!error || loadingCamera}
                onClick={handleTakeSnapshot}
                className="px-6 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" /> Capture Frame
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
