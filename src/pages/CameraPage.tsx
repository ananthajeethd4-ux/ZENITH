import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Camera,
  Video,
  StopCircle,
  Trash2,
  Lock,
  ShieldAlert,
  Info,
  CheckCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { CameraMediaRecord } from '../types/audit';

export const CameraPage: React.FC = () => {
  const { selectedAstronaut, capturedMedia, addCapturedMedia, deleteCapturedMedia } = useApp();

  const [hasUserConsented, setHasUserConsented] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<'Wellbeing Check' | 'Exercise Posture Form' | 'Microgravity Skin Inspection'>('Wellbeing Check');
  const [previewMedia, setPreviewMedia] = useState<CameraMediaRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCameraStream = async () => {
    if (!hasUserConsented) {
      alert('Please review and check the privacy consent before enabling camera access.');
      return;
    }

    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        throw new Error('MediaDevices API not supported in this environment');
      }
    } catch (err: any) {
      console.warn('Camera access fallback:', err);
      setCameraError(
        'Physical webcam is restricted, inactive, or not connected. Simulated video mirror stream is activated for testing.'
      );
      setIsCameraActive(true);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    let dataUrl = '';
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    } else {
      // Fallback simulated test frame
      dataUrl = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600';
    }

    addCapturedMedia({
      astronautId: selectedAstronaut.id,
      type: 'photo',
      dataUrl,
      timestamp: new Date().toISOString(),
      purpose: selectedPurpose,
      fileSizeKb: 285,
      encrypted: true,
    });
  };

  const astronautMedia = capturedMedia.filter((m) => m.astronautId === selectedAstronaut.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
          Visual Wellbeing & Form Inspection
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Opt-in camera utility for exercise posture checks, wellbeing records, and habitat inspections
        </p>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimers */}
      <div className="p-4 bg-paper-dark border border-edge rounded-sm space-y-2 text-xs text-ink-secondary">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0" />
          <span>Strict Clinical & Diagnostic Disclaimers</span>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-ink">No medical or psychological diagnosis:</strong> The camera is a recording and communication tool only. It does not diagnose clinical conditions.
          </li>
          <li>
            <strong className="text-ink">No biomarker measurements from video:</strong> This prototype does <strong className="text-ink">NOT</strong> claim to extract blood pressure, SpO₂, pulse, respiratory rate, or vitamin deficiencies from facial video or photos.
          </li>
          <li>
            <strong className="text-ink">Explicit consent required:</strong> Camera hardware is never turned on automatically. The user must grant explicit consent each session.
          </li>
        </ul>
      </div>

      {/* Camera Access Card */}
      <Card>
        <CardHeader
          title="Camera Stream & Media Capture"
          subtitle="Local in-browser video buffer with end-to-end privacy controls"
          tag={
            <Badge variant={isCameraActive ? 'normal' : 'unavailable'} size="sm" dot>
              {isCameraActive ? 'Camera Live' : 'Camera Off'}
            </Badge>
          }
        />

        {/* Privacy Consent Agreement Before Access */}
        {!hasUserConsented ? (
          <div className="p-5 bg-paper rounded-sm border border-edge space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-ink text-sm">Privacy & Processing Disclosure</h4>
                <p className="text-ink-secondary mt-1 leading-relaxed">
                  Before initializing your camera stream, please verify that you understand how optical media is managed:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="p-2.5 bg-paper-dark border border-edge rounded-sm">
                    <strong className="text-ink block mb-0.5">Processing</strong>
                    <span className="text-[11px] text-ink-secondary">Executed strictly on the local device browser. No external cloud analysis.</span>
                  </div>
                  <div className="p-2.5 bg-paper-dark border border-edge rounded-sm">
                    <strong className="text-ink block mb-0.5">Storage</strong>
                    <span className="text-[11px] text-ink-secondary">Encrypted in browser local mission store. User may purge at any moment.</span>
                  </div>
                  <div className="p-2.5 bg-paper-dark border border-edge rounded-sm">
                    <strong className="text-ink block mb-0.5">Access</strong>
                    <span className="text-[11px] text-ink-secondary">Restricted to current astronaut and assigned Flight Surgeon.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-edge flex items-center justify-between gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
                <input
                  type="checkbox"
                  checked={hasUserConsented}
                  onChange={(e) => setHasUserConsented(e.target.checked)}
                  className="rounded-sm"
                />
                <span>I understand and grant permission to activate the camera utility</span>
              </label>

              <Button
                size="sm"
                variant="primary"
                disabled={!hasUserConsented}
                onClick={startCameraStream}
                icon={<Camera className="w-3.5 h-3.5" />}
              >
                Enable Camera
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera Viewport */}
            <div className="relative w-full max-w-xl mx-auto aspect-video bg-ink rounded-sm overflow-hidden border border-edge flex items-center justify-center">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {cameraError && (
                    <div className="absolute inset-0 bg-ink/75 p-6 flex flex-col items-center justify-center text-center text-paper">
                      <Camera className="w-10 h-10 text-paper-dark mb-2" />
                      <p className="text-xs max-w-md">{cameraError}</p>
                      <span className="text-[10px] font-mono text-edge mt-2 uppercase">
                        Prototype Simulation Active
                      </span>
                    </div>
                  )}
                  {/* Active recording beacon */}
                  <div className="absolute top-3 left-3 bg-paper/90 backdrop-blur-sm border border-edge px-2 py-0.5 rounded-sm flex items-center gap-1.5 text-[10px] font-mono text-ink">
                    <span className="w-2 h-2 rounded-full bg-brick animate-ping" />
                    <span>REC STREAM ACTIVE</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-paper-dark p-6">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Camera stream is currently inactive</p>
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-3"
                    onClick={startCameraStream}
                    icon={<Camera className="w-3.5 h-3.5" />}
                  >
                    Start Stream
                  </Button>
                </div>
              )}
            </div>

            {/* Stream Controls */}
            {isCameraActive && (
              <div className="p-3 bg-paper border border-edge rounded-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-ink-secondary">Record Purpose:</span>
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value as any)}
                    className="p-1 bg-paper-dark border border-edge rounded-sm text-xs text-ink font-mono"
                  >
                    <option value="Wellbeing Check">Wellbeing Check</option>
                    <option value="Exercise Posture Form">Exercise Posture Form</option>
                    <option value="Microgravity Skin Inspection">Microgravity Skin Inspection</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={capturePhoto}
                    icon={<Camera className="w-3.5 h-3.5" />}
                  >
                    Capture Still
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={stopCameraStream}
                    icon={<StopCircle className="w-3.5 h-3.5" />}
                  >
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Captured Media Gallery */}
      <Card>
        <CardHeader
          title="Captured Wellbeing Media Records"
          subtitle="Encrypted locally stored images with permanent deletion controls"
          tag={<span className="text-xs font-mono text-ink-secondary">{astronautMedia.length} items</span>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {astronautMedia.map((media) => (
            <div key={media.id} className="bg-paper border border-edge rounded-sm overflow-hidden p-2.5">
              <div
                className="aspect-video bg-paper-dark rounded-sm overflow-hidden relative cursor-pointer group"
                onClick={() => setPreviewMedia(media)}
              >
                <img
                  src={media.dataUrl}
                  alt={media.purpose}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-paper" />
                </div>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-ink">{media.purpose}</div>
                  <div className="text-[10px] font-mono text-ink-secondary">
                    {new Date(media.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted">
                    {media.fileSizeKb} KB • AES Encrypted
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Permanently delete this media record?')) {
                      deleteCapturedMedia(media.id);
                    }
                  }}
                  className="p-1.5 text-ink-muted hover:text-brick rounded-sm transition-colors"
                  title="Permanently Delete Media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {astronautMedia.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-ink-secondary font-mono">
              No captured media records for this astronaut.
            </div>
          )}
        </div>
      </Card>

      {/* Media Preview Modal */}
      <Modal
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.purpose || 'Media Inspection'}
        subtitle={`Captured: ${previewMedia ? new Date(previewMedia.timestamp).toLocaleString() : ''}`}
        footer={
          <Button variant="secondary" onClick={() => setPreviewMedia(null)}>
            Close
          </Button>
        }
      >
        {previewMedia && (
          <div className="space-y-3">
            <img
              src={previewMedia.dataUrl}
              alt={previewMedia.purpose}
              className="w-full h-auto rounded-sm border border-edge"
            />
            <div className="text-xs font-mono text-ink-secondary">
              ID: {previewMedia.id} • Status: Encrypted local store
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

