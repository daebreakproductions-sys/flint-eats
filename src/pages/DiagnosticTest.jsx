import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function DiagnosticTest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    async function test() {
      try {
        // Check auth status
        const authStatus = await base44.auth.isAuthenticated();
        setIsAuth(authStatus);

        // Try to fetch resources
        const resources = await base44.entities.FoodResource.filter({ is_active: true }, "name", 10);
        setResult(resources);
      } catch (err) {
        setError({
          message: err.message,
          status: err.status,
          full: JSON.stringify(err, null, 2)
        });
      }
    }
    test();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Diagnostic Test</h1>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Auth Status</h2>
          <p className="text-sm">{isAuth === null ? "Checking..." : isAuth ? "✅ Authenticated" : "❌ Not Authenticated"}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-sm text-red-800 mb-2"><strong>Message:</strong> {error.message}</p>
            <p className="text-sm text-red-800 mb-2"><strong>Status:</strong> {error.status}</p>
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto">{error.full}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="font-semibold text-green-900 mb-2">✅ Success</h2>
            <p className="text-sm text-green-800 mb-2">Loaded {result.length} resources</p>
            <pre className="text-xs bg-green-100 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {!error && !result && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}