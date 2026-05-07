import { useRef } from 'react';
import { Html, Float } from '@react-three/drei';
import { DiscoveryItem } from '../lib/gemini.ts';
import { User, ShoppingBag, ExternalLink, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  data: DiscoveryItem[];
  width: number;
  height: number;
}

export function AROverlay({ data, width, height }: Props) {
  return (
    <group>
      {data.map((item, index) => (
        <ARMarker 
          key={`${item.name}-${index}`} 
          item={item} 
          width={width} 
          height={height} 
        />
      ))}
    </group>
  );
}

function ARMarker({ item, width, height }: { item: DiscoveryItem; width: number; height: number }) {
  const meshRef = useRef<any>(null);
  
  const x = (item.center.x - 0.5) * 10;
  const y = (0.5 - item.center.y) * 10;
  const z = 0;

  const handleNaverSearch = () => {
    const query = encodeURIComponent(item.naverSearchQuery);
    window.open(`https://search.shopping.naver.com/search/all?query=${query}`, '_blank');
  };

  return (
    <group position={[x, y, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Float>

      <Html center distanceFactor={10}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative pointer-events-auto group"
        >
          <div className="bg-[#050505]/90 border border-cyan-400/30 backdrop-blur-2xl rounded-lg p-5 min-w-[280px] shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="flex flex-col gap-1 mb-4">
              <div className={`inline-flex px-2 py-0.5 border rounded-sm w-fit mb-1 ${
                item.type === 'actor' 
                  ? 'bg-cyan-400/10 border-cyan-400/50 text-cyan-400' 
                  : 'bg-emerald-400/10 border-emerald-400/50 text-emerald-400'
              }`}>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
                  {item.type === 'actor' ? 'Actor Insight' : 'Product Match'}
                </span>
              </div>
              
              <h3 className="text-white font-black text-xl tracking-tighter leading-none uppercase italic">{item.name}</h3>
              
              <div className="flex items-center gap-1.5 text-white/60 text-xs font-mono tracking-wider">
                {item.type === 'actor' ? <User size={12} /> : <Tag size={12} />}
                <span>{item.subTitle}</span>
              </div>
            </div>

            <div className="border-l-2 border-cyan-400 pl-4 py-1 mb-4 bg-white/5 rounded-r-md">
              <p className="text-gray-300 text-[12px] leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            {item.price && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-400/5 border border-emerald-400/10 rounded">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Est. Price:</span>
                <span className="text-white font-mono text-xs">{item.price}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
              <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-12">
                {item.details.map((detail, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/5 text-[9px] text-white/50 rounded border border-white/5 whitespace-nowrap">
                    {detail}
                  </span>
                ))}
              </div>

              <button
                onClick={handleNaverSearch}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black text-[11px] font-black uppercase tracking-widest rounded transition-all active:scale-95 shadow-[0_4px_15px_rgba(34,211,238,0.3)]"
              >
                <ShoppingBag size={14} />
                Buy on Naver
                <ExternalLink size={10} />
              </button>
            </div>
          </div>

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[2px] h-12 bg-gradient-to-t from-cyan-400 via-cyan-400/20 to-transparent" />
        </motion.div>
      </Html>
    </group>
  );
}
