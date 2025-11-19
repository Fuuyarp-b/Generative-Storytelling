import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { Spinner } from './components/Spinner';
import { parseCSV, analyzeStats } from './utils/csvParser';
import { generateStory } from './services/geminiService';
import { DataStats, ProcessingState } from './types';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingState>(ProcessingState.IDLE);
  const [stats, setStats] = useState<DataStats | null>(null);
  const [story, setStory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setStatus(ProcessingState.PARSING);
    setError(null);
    setFileName(file.name);
    setStory('');

    try {
      const rawData = await parseCSV(file);
      const calculatedStats = analyzeStats(rawData);
      setStats(calculatedStats);
      setStatus(ProcessingState.IDLE); // Ready for generation
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการอ่านไฟล์ CSV กรุณาตรวจสอบรูปแบบไฟล์");
      setStatus(ProcessingState.ERROR);
    }
  };

  const handleGenerateStory = async () => {
    if (!stats) return;

    setStatus(ProcessingState.GENERATING);
    setError(null);

    try {
      const narrative = await generateStory(stats);
      setStory(narrative);
      setStatus(ProcessingState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      // Check if it's likely an API key issue
      if (err.message.includes("API Key")) {
        setError("ไม่พบ API Key หรือ Key ไม่ถูกต้อง กรุณาตั้งค่า API_KEY");
      } else {
        setError("ไม่สามารถสร้างเรื่องราวได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      }
      setStatus(ProcessingState.ERROR);
    }
  };

  const handleReset = () => {
    setStats(null);
    setStory('');
    setStatus(ProcessingState.IDLE);
    setFileName('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">DataStory AI</h1>
          </div>
          {stats && (
            <button 
              onClick={handleReset}
              className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> เริ่มใหม่
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction / File Upload Section */}
        {!stats && status !== ProcessingState.PARSING && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              เปลี่ยนข้อมูล CSV ของคุณให้เป็นเรื่องราว
            </h2>
            <p className="text-slate-500 mb-8 text-lg">
              อัปโหลดไฟล์รายงานยอดขาย (CSV) แล้วให้ AI วิเคราะห์แนวโน้ม 
              หาจุดเด่น และเขียนสรุปผู้บริหารให้คุณภายในไม่กี่วินาที
            </p>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <FileUpload onFileSelect={handleFileSelect} />
              <p className="mt-4 text-xs text-slate-400">
                รองรับไฟล์ H_ZCSR181H หรือไฟล์ Sales Report มาตรฐาน
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {(status === ProcessingState.PARSING || status === ProcessingState.GENERATING) && (
           <div className="flex flex-col items-center justify-center py-20">
             <Spinner />
             <p className="mt-4 text-slate-600 font-medium animate-pulse">
               {status === ProcessingState.PARSING ? 'กำลังอ่านข้อมูล CSV...' : 'Gemini กำลังเรียบเรียงเรื่องราว...'}
             </p>
           </div>
        )}

        {/* Dashboard & Results */}
        {stats && status !== ProcessingState.PARSING && status !== ProcessingState.GENERATING && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold text-slate-800">
                 ข้อมูลเบื้องต้นจาก: <span className="text-blue-600">{fileName}</span>
               </h2>
               {!story && (
                 <button
                   onClick={handleGenerateStory}
                   className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                 >
                   <Sparkles className="w-5 h-5 mr-2" />
                   Generate Data Story
                 </button>
               )}
            </div>

            <Dashboard stats={stats} />

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Story Output */}
            {story && (
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-yellow-300" />
                    AI Narrative Report
                  </h3>
                </div>
                <div className="p-8 prose prose-slate prose-lg max-w-none">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-indigo-900 mb-4 border-b pb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-indigo-800 mt-6 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-4" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-indigo-700" {...props} />,
                    }}
                  >
                    {story}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;