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

  const { result, loading, error, fallback, translate, setError } = useTranslator();
  const { uploading, uploadFile } = useImageUpload({
    onCode: setCode,
    onError: setError,
  });

  const isLoading = loading || uploading;

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Input */}
          <div className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <CodeInput
              code={code}
              onCodeChange={setCode}
              targetLanguage={targetLanguage}
              onLanguageChange={setTargetLanguage}
              onTranslate={() => translate(code, targetLanguage)}
              onUpload={uploadFile}
              loading={isLoading}
              error={error}
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-zinc-200 self-stretch" />

          {/* Right: Output */}
          <div className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
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
