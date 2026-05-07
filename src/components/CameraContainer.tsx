import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeImage, DiscoveryItem } from '../lib/gemini.ts';
import { RefreshCw, Scan, Layers, ShoppingBag, Eye } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { AROverlay } from './AROverlay.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function CameraContainer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access failed.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    try {
      const results = await analyzeImage(base64Image);
      setItems(results);
    } catch (err) {
      console.error('Processing error:', err);
      setError('AI Analysis failed.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <AROverlay data={items} width={dimensions.width} height={dimensions.height} />
        </Canvas>
      </div>

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 font-sans">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-2xl font-black tracking-tighter uppercase italic leading-none">Smart Lens AR</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00ffff]" />
              <span className="text-cyan-400/80 text-[9px] font-mono tracking-[0.3em] uppercase">Shopping Engine: Online</span>
            </div>
          </div>
          
          <div className="flex gap-4 text-[10px] text-white/40 font-mono tracking-widest uppercase items-center">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              SHOP: ACTIVE
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              VISION: HD
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border border-cyan-400/30 rounded-full reticle-pulse" />
            <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#00ffff]" />
          </div>
        </div>

        <div className="absolute bottom-32 left-8 text-[11px] font-mono text-cyan-400/50 leading-relaxed uppercase tracking-wider">
          <div className="flex gap-2"><span>MODE:</span> <span className="text-white/60">HYBRID_DETECT</span></div>
          <div className="flex gap-2"><span>SOURCE:</span> <span className="text-white/60">AI_STUDIO_SDK</span></div>
        </div>

        <div className="flex justify-between items-end pointer-events-auto">
          <button className="p-3 bg-[#0a0a0f]/80 border border-white/10 rounded-lg text-white/50 hover:text-cyan-400 backdrop-blur-md">
            <Layers size={20} />
          </button>
          
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={captureFrame}
              disabled={isScanning}
              className={`group relative p-1 rounded-full transition-all active:scale-90 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <div className="relative w-24 h-24 bg-black/60 border border-cyan-400/30 rounded-full flex items-center justify-center backdrop-blur-xl">
                <div className="w-20 h-20 border border-white/5 rounded-full flex items-center justify-center">
                  {isScanning ? (
                    <ShoppingBag className="text-cyan-400 animate-bounce" size={32} />
                  ) : (
                    <Eye className="text-cyan-400" size={32} />
                  )}
                </div>
              </div>
            </button>
            
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 tracking-[0.4em] uppercase">Finding Products...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setItems([])}
            className="p-3 bg-[#0a0a0f]/80 border border-white/10 rounded-lg text-white/50 hover:text-cyan-400 backdrop-blur-md"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-red-600/90 text-white p-4 rounded-xl text-xs font-bold backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
