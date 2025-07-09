import { useEffect, useRef, useState } from "react";
import { set as idbSet } from "idb-keyval";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setReady(true);
            videoRef.current?.play();
          };
        }
      })
      .catch(console.error);

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const snap = () => {
    if (!ready) return;
    const v = videoRef.current!;
    const c = canvasRef.current!;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    c.toBlob(async (blob) => {
      if (!blob) return;
      await idbSet(`photo-${Date.now()}`, blob);
      setPhotos((p) => [...p, blob]);
    }, "image/jpeg", 0.9);
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        className="rounded-lg"
      />
      <button
        onClick={snap}
        disabled={!ready}
        className="bg-orange-300 rounded-lg h-12 w-full my-2"
      >
        {ready ? "Take photo" : "Loading…"}
      </button>
    </div>
  );
}
