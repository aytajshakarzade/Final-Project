import { useCallback, useRef, useState } from 'react';
import { whisperApi } from '../api/whisperApi';

export function useRecorder() {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const start = useCallback(async (stream) => {
    const activeStream = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(activeStream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined });
    chunksRef.current = [];
    recorder.ondataavailable = ({ data }) => { if (data.size) chunksRef.current.push(data); };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }, []);

  const stopAndTranscribe = useCallback(() => new Promise((resolve, reject) => {
    const recorder = recorderRef.current;
    if (!recorder) return resolve('');
    recorder.onerror = reject;
    recorder.onstop = async () => {
      setRecording(false);
      try {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const data = await whisperApi.transcribe(new File([blob], 'answer.webm', { type: blob.type }));
        resolve(data.transcript || '');
      } catch (error) { reject(error); }
    };
    recorder.stop();
  }), []);

  return { recording, start, stopAndTranscribe };
}
