/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import CameraContainer from './components/CameraContainer.tsx';

const IS_OFFLINE = !process.env.GEMINI_API_KEY;

export default function App() {
  return (
    <main className="min-h-screen bg-black relative">
      <div className="scan-line" />
      <CameraContainer />
      
      {IS_OFFLINE && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="max-w-xs text-center space-y-4">
            <h2 className="text-cyan-400 font-mono text-xl tracking-widest uppercase">System Initialization Failed</h2>
            <p className="text-white/60 text-xs leading-relaxed uppercase tracking-wider">
              Gemini AI core not detected. Please ensure GEMINI_API_KEY is configured in project secrets.
            </p>
            <div className="w-16 h-1 bg-cyan-400/20 mx-auto" />
          </div>
        </div>
      )}
    </main>
  );
}


