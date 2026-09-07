import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, Zap, ZapOff, AlertCircle } from 'lucide-react';

export const CameraScanner = ({ onScanSuccess, onClose }) => {
  const [scannerError, setScannerError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [currentCameraIdx, setCurrentCameraIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const qrElementId = 'qr-camera-stream';

    // Start scanner function
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
          
          // Prefer back camera if available
          let targetCameraId = devices[0].id;
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment')
          );
          if (backCam) {
            targetCameraId = backCam.id;
            setCurrentCameraIdx(devices.indexOf(backCam));
          }

          const qr = new Html5Qrcode(qrElementId);
          html5QrCodeRef.current = qr;

          await qr.start(
            targetCameraId,
            {
              fps: 15,
              qrbox: { width: 260, height: 260 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              // On Successful Scan
              console.log('[Scanner] QR Decoded:', decodedText);
              if (qr.isScanning) {
                qr.stop().catch(console.error);
              }
              onScanSuccess(decodedText);
            },
            () => {
              // Ignore standard frame miss errors
            }
          );

          if (isMounted) setIsScanning(true);
        } else {
          setScannerError('ไม่พบกล้องในอุปกรณ์ของคุณ');
        }
      } catch (err) {
        console.error('[Scanner] Start failed:', err);
        if (isMounted) {
          setScannerError(
            err.name === 'NotAllowedError'
              ? 'กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์เพื่อใช้งานตัวสแกน'
              : `ไม่สามารถเปิดกล้องได้: ${err.message || 'โปรดตรวจสอบการอนุญาตใช้งานกล้อง'}`
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1 || !html5QrCodeRef.current) return;

    try {
      const nextIdx = (currentCameraIdx + 1) % cameras.length;
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      await html5QrCodeRef.current.start(
        cameras[nextIdx].id,
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (html5QrCodeRef.current?.isScanning) {
            html5QrCodeRef.current.stop().catch(console.error);
          }
          onScanSuccess(decodedText);
        },
        () => {}
      );

      setCurrentCameraIdx(nextIdx);
    } catch (err) {
      console.error('[Scanner] Switch camera error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Camera className="w-5 h-5 text-indigo-400" />
            <span>สแกน Dynamic QR Code ของนักเรียน</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scannerError ? (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs text-center space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <p>{scannerError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border-2 border-indigo-500/50">
            {/* Viewfinder Video */}
            <div id="qr-camera-stream" className="w-full h-full"></div>

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-dashed border-indigo-400/80 rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl"></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>ส่องกล้องไปที่ QR Code บนมือถือนักเรียน</span>

          {cameras.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>สลับกล้อง</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
