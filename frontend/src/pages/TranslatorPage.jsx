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
    <main className="p-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Input */}
          <div className="flex-1 min-w-0 backdrop-blur-xl border border-[#e5e4d0] transition-all duration-300 hover:border-[#d4d0b0] rounded-2xl p-6 shadow-lg shadow-gray-300/40" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,240,219,0.85) 100%)'}}>
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

          {/* Right: Output */}
          <div className="flex-1 min-w-0 backdrop-blur-xl border border-[#e5e4d0] transition-all duration-300 hover:border-[#d4d0b0] rounded-2xl p-6 shadow-lg shadow-gray-300/40 flex flex-col" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(225,217,188,0.85) 100%)'}}>
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
