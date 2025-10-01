"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/lib/apiConfig";

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
      const data = await response.json();
      setResult({ type: 'health', data, status: response.status });
    } catch (error) {
      setResult({ type: 'health', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testWaitlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.WAITLIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      const data = await response.json();
      setResult({ type: 'waitlist', data, status: response.status });
    } catch (error) {
      setResult({ type: 'waitlist', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Health URL:</strong> {API_ENDPOINTS.HEALTH}</p>
              <p><strong>Waitlist URL:</strong> {API_ENDPOINTS.WAITLIST}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={testHealth}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Health Endpoint'}
            </button>
            
            <button
              onClick={testWaitlist}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Waitlist Endpoint'}
            </button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Result:</h3>
              <div className="bg-white p-4 rounded border">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
