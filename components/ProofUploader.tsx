// components/ProofUploader.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
} from "firebase/storage";

type Props = {
  matchId: string;
  userId: string;
  onUploaded: (url: string) => void;
  onCancel?: () => void;
  /** Auto-launch rear camera on mobile when mounted */
  autoLaunchCamera?: boolean;
  /** Storage folder prefix: proof/{matchId}/{file} */
  folderPrefix?: string;
  /** Max width for client-side compression */
  maxWidth?: number; // default 1600
  /** JPEG quality for compression (0-1) */
  quality?: number; // default 0.85
};

type Stage = "idle" | "preparing" | "uploading" | "done" | "error";

const isMobileDevice = () =>
  typeof navigator !== "undefined" &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function ProofUploader({
  matchId,
  userId,
  onUploaded,
  onCancel,
  autoLaunchCamera = true,
  folderPrefix = "proof",
  maxWidth = 1600,
  quality = 0.85,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTaskRef = useRef<UploadTask | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");

  const canInteract = useMemo(() => stage !== "uploading", [stage]);

  // Auto-open camera on mobile when mounted
  useEffect(() => {
    if (!autoLaunchCamera) return;
    if (!isMobileDevice()) return;
    // Only if nothing selected yet
    if (file) return;
    // Delay a tick to ensure ref is set
    const t = setTimeout(() => fileInputRef.current?.click(), 150);
    return () => clearTimeout(t);
  }, [autoLaunchCamera, file]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      try {
        uploadTaskRef.current?.cancel();
      } catch {
        /* no-op */
      }
    };
  }, [previewUrl]);

  function setFileAndPreview(f: File) {
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    // Immediately begin compress+upload for a snappy flow
    void prepareAndUpload(f);
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileAndPreview(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFileAndPreview(f);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) {
          setFileAndPreview(f);
          break;
        }
      }
    }
  };

  async function prepareAndUpload(original: File) {
    try {
      setStage("preparing");
      const blob = await compressImage(original, maxWidth, quality);
      await uploadBlob(blob);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to prepare or upload image.");
      setStage("error");
    }
  }

  async function uploadBlob(blob: Blob) {
    setStage("uploading");
    setProgress(0);

    const storage = getStorage();
    const filename = `${userId}-${Date.now()}.jpg`;
    const path = `${folderPrefix}/${matchId}/${filename}`;
    const ref = storageRef(storage, path);

    const metadata = { contentType: "image/jpeg" };
    const task = uploadBytesResumable(ref, blob, metadata);
    uploadTaskRef.current = task;

    return new Promise<void>((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setProgress(pct);
        },
        (err) => {
          console.error(err);
          setError(err?.message || "Upload failed.");
          setStage("error");
          reject(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            setStage("done");
            setProgress(100);
            onUploaded(url);
            resolve();
          } catch (err) {
            console.error(err);
            setError("Could not finalize upload.");
            setStage("error");
            reject(err);
          }
        }
      );
    });
  }

  function retry() {
    if (!file) return;
    setError(null);
    setProgress(null);
    setStage("idle");
    void prepareAndUpload(file);
  }

  function removeSelected() {
    setError(null);
    setProgress(null);
    setStage("idle");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  const isUploading = stage === "uploading";
  const isDone = stage === "done";

  return (
    <div
      className="w-full max-w-md mx-auto"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onPaste={onPaste}
    >
      {/* Hidden file input (camera-first on mobile) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        // hint mobile browsers to open rear camera
        capture="environment"
        className="hidden"
        onChange={onFileInputChange}
        disabled={!canInteract}
      />

      {!file && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white text-center">
          <p className="text-sm text-gray-300">
            Take a photo of the final scoreboard.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-xl hover:bg-yellow-300"
            >
              {isMobileDevice() ? "Use Camera" : "Upload from device"}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Or drag & drop / paste a screenshot here.
          </div>
          <ul className="mt-3 text-left text-xs text-gray-400 space-y-1">
            <li>• Make sure the score is visible</li>
            <li>• Include opponent gamertag if possible</li>
          </ul>
        </div>
      )}

      {file && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Proof Preview</h4>
            {!isUploading && !isDone && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Replace Photo
              </button>
            )}
          </div>

          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Proof preview"
              className="rounded-lg w-full h-auto max-h-[360px] object-contain bg-black/30"
            />
          )}

          <div className="mt-3">
            {stage === "preparing" && (
              <p className="text-sm text-gray-300">Optimizing image…</p>
            )}

            {isUploading && typeof progress === "number" && (
              <div className="w-full">
                <div className="h-2 w-full bg-white/10 rounded">
                  <div
                    className="h-2 bg-yellow-400 rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-300">{progress}%</p>
              </div>
            )}

            {stage === "error" && (
              <div className="text-sm text-red-300">
                {error || "Upload failed."}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={retry}
                    className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={removeSelected}
                    className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {isDone && (
              <p className="text-sm text-green-300">
                Uploaded. You can submit your result now.
              </p>
            )}
          </div>

          {!isUploading && !isDone && (
            <div className="mt-3 flex justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
                disabled={!canInteract}
              >
                Choose Different Photo
              </button>
              <button
                type="button"
                onClick={removeSelected}
                className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
                disabled={!canInteract}
              >
                Remove
              </button>
            </div>
          )}

          {onCancel && !isUploading && !isDone && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-gray-400 hover:text-gray-200 underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compress a File to JPEG using canvas (keeps EXIF-agnostic orientation).
 * Returns the original File as Blob if anything fails.
 */
async function compressImage(file: File, maxW = 1600, quality = 0.85): Promise<Blob> {
  // If it's already small or not an image, skip
  if (!file.type.startsWith("image/")) return file;
  const isLikelySmall = file.size < 350 * 1024; // ~350KB
  if (isLikelySmall) return file;

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxW / (img.naturalWidth || img.width || maxW));
  const w = Math.round((img.naturalWidth || img.width) * scale);
  const h = Math.round((img.naturalHeight || img.height) * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", quality)
  );
  return blob || file;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
