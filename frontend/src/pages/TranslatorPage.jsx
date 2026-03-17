import { useState } from 'react';
import CodeInput from '../components/CodeInput.jsx';
import CodeOutput from '../components/CodeOutput.jsx';
import useTranslator from '../hooks/useTranslator.js';
import useImageUpload from '../hooks/useImageUpload.js';

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("CodeMorpher");
    }
}`;

export default function TranslatorPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [targetLanguage, setTargetLanguage] = useState('javascript');

  const { result, loading, error, errorCode, fallback, translate, setError, setErrorCode, clearError } = useTranslator();
  const { uploading, uploadFile } = useImageUpload({
    onCode: setCode,
    onError: (msg, code) => {
      setError(msg);
      setErrorCode(code || '');
    },
  });

  const isLoading = loading || uploading;

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (error) clearError();
  };

  return (
    <main className="p-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Input */}
          <div
            className="flex-1 min-w-0 border rounded-2xl p-6 shadow-lg transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
              borderColor: 'var(--border)',
            }}
          >
            <CodeInput
              code={code}
              onCodeChange={handleCodeChange}
              targetLanguage={targetLanguage}
              onLanguageChange={setTargetLanguage}
              onTranslate={() => translate(code, targetLanguage)}
              onUpload={uploadFile}
              loading={isLoading}
              error={error}
              errorCode={errorCode}
              onDismissError={clearError}
            />
          </div>

          {/* Right: Output */}
          <div
            className="flex-1 min-w-0 border rounded-2xl p-6 shadow-lg transition-all duration-300 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
              borderColor: 'var(--border)',
            }}
          >
            <CodeOutput
              result={result}
              targetLanguage={targetLanguage}
              fallback={fallback}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
