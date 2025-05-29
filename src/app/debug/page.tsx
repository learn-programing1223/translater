'use client';

import { useEffect, useState } from 'react';
import { checkVoiceSupport, getSupportedMimeTypes } from '../../lib/audio-utils';

export default function DebugPage() {
  const [support, setSupport] = useState<any>(null);
  const [mimeTypes, setMimeTypes] = useState<string[]>([]);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    const voiceSupport = checkVoiceSupport();
    setSupport(voiceSupport);
    
    const supportedTypes = getSupportedMimeTypes();
    setMimeTypes(supportedTypes);
    
    setUserAgent(navigator.userAgent);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Voice Recording Debug Info</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Browser Support */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Support</h2>
            {support ? (
              <div className="space-y-2">
                <div className={`flex items-center ${support.mediaRecorder ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{support.mediaRecorder ? '✅' : '❌'}</span>
                  MediaRecorder API
                </div>
                <div className={`flex items-center ${support.mediaDevices ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{support.mediaDevices ? '✅' : '❌'}</span>
                  MediaDevices API
                </div>
                <div className={`flex items-center ${support.webSpeech ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{support.webSpeech ? '✅' : '❌'}</span>
                  Web Speech API
                </div>
                <div className={`flex items-center ${support.speechSynthesis ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{support.speechSynthesis ? '✅' : '❌'}</span>
                  Speech Synthesis
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* Supported MIME Types */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Supported Audio MIME Types</h2>
            {mimeTypes.length > 0 ? (
              <div className="space-y-1">
                {mimeTypes.map((type, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {type}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">No supported MIME types found</p>
            )}
          </div>

          {/* User Agent */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">User Agent</h2>
            <div className="text-sm font-mono bg-gray-100 p-4 rounded break-all">
              {userAgent}
            </div>
          </div>

          {/* Browser Detection */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Browser Detection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Chrome:</strong> {userAgent.includes('Chrome') ? '✅' : '❌'}
              </div>
              <div>
                <strong>Safari:</strong> {userAgent.includes('Safari') && !userAgent.includes('Chrome') ? '✅' : '❌'}
              </div>
              <div>
                <strong>Firefox:</strong> {userAgent.includes('Firefox') ? '✅' : '❌'}
              </div>
              <div>
                <strong>Edge:</strong> {userAgent.includes('Edg') ? '✅' : '❌'}
              </div>
            </div>
          </div>

          {/* Test Recording */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Test Recording</h2>
            <p className="text-gray-600 mb-4">
              Use this information to debug voice recording issues. The most important thing is that 
              MediaRecorder API is supported and at least one MIME type is available.
            </p>
            
            {support?.mediaRecorder && mimeTypes.length > 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">
                  ✅ Voice recording should work! Recommended MIME type: <code>{mimeTypes[0]}</code>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">
                  ❌ Voice recording may not work. Try using Web Speech API fallback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}