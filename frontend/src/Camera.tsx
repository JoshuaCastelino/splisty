import {useEffect, useRef, useState} from 'react';
import {set as idbSet} from 'idb-keyval';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<Blob[]>([]);   // in-memory queue

  // start camera once
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
    return () => {    // stop tracks on unmount
      (videoRef.current?.srcObject as MediaStream | null)
        ?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const snap = async () => {
    const v = videoRef.current!, c = canvasRef.current!;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    c.toBlob(async blob => {
      if (!blob) return;
      await idbSet(`photo-${Date.now()}`, blob);   // temporary IndexedDB save
      setPhotos(p => [...p, blob]);               // keep in RAM for processing
    }, 'image/jpeg', 0.9);
  };

  return (
    <>
      <video ref={videoRef} autoPlay playsInline className="w-64 h-auto"/>
      <button onClick={snap}>Take photo</button>
      <canvas ref={canvasRef} hidden />
      {photos.map((b, i) => (
        <img key={i} src={URL.createObjectURL(b)} alt="" className="w-32 inline-block"/>
      ))}
    </>
  );
}
