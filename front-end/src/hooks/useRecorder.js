import { useCallback, useRef, useState } from 'react';
import { interviewService } from '../services/interviewService';

export function useRecorder() {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const start = useCallback(async (stream) => {
    const activeStream = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const recorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : {});
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
      setTranscribing(true);
      try {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], 'answer.webm', { type: blob.type });
        const data = await interviewService.openai.transcribe(file);
        resolve(data?.transcript || '');
      } catch (err) {
        reject(err);
      } finally {
        setTranscribing(false);
      }
    };
    recorder.stop();
  }), []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  return { recording, transcribing, start, stop, stopAndTranscribe };
}
