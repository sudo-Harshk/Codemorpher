import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function useTranslator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [fallback, setFallback] = useState(false);

  const translate = async (javaCode, targetLanguage) => {
    if (!javaCode.trim()) {
      setError('Please enter some Java code to translate.');
      setErrorCode('EMPTY_INPUT');
      return;
    }
    setError('');
    setErrorCode('');
    setLoading(true);
    setFallback(false);

    try {
      const res = await fetch(`${BACKEND_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ javaCode, targetLanguage }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Translation failed. Please try again.');
        setErrorCode(data.code || '');
        return;
      }

      setResult(data);
      if (data.fallback) setFallback(true);
    } catch {
      setError('Network error. Is the backend running?');
      setErrorCode('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
    setErrorCode('');
  };

  return { result, loading, error, errorCode, fallback, translate, setError, setErrorCode, clearError };
}
