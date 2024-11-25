import React, { useEffect, useState } from "react";
import { ScriptResult } from "@/app/lib/definitions";
import { fetchUserScriptResults } from "@/app/lib/actions";
import { QueryResultRow } from "@vercel/postgres";

interface ScriptResultsTableProps {
  refreshTrigger: boolean;
}

export default function ScriptResultsTable({
  refreshTrigger,
}: ScriptResultsTableProps) {
  const [scriptResults, setScriptResults] = useState<ScriptResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadScriptResults = async () => {
    try {
      setLoading(true);
      const results = await fetchUserScriptResults();

      if (Array.isArray(results)) {
        const scriptResults: ScriptResult[] = results.map(
          (row: QueryResultRow) => ({
            executedAt: row.execution_date,
            scriptName: row.script_name,
            parameters: row.parameters,
            result: row.result,
          })
        );
        setScriptResults(scriptResults);
      }
    } catch (err) {
      setError("Failed to fetch script results. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScriptResults();
  }, [refreshTrigger]);

  const maskSensitiveData = (key: string, value: string): string => {
    const sensitiveKeys = ["password", "authPass", "auth_token"];
    if (sensitiveKeys.includes(key)) {
      return "******";
    }
    return value;
  };

  if (loading) return <p>Loading script results...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-4">Recent Script Executions</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left text-gray-600 text-sm">
              Date
            </th>
            <th className="border px-3 py-2 text-left text-gray-600 text-sm">
              Script Name
            </th>
            <th className="border px-3 py-2 text-left text-gray-600 text-sm">
              Parameters
            </th>
            <th className="border px-3 py-2 text-left text-gray-600 text-sm">
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {scriptResults.map((result: ScriptResult, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 odd:bg-gray-50 even:bg-white"
            >
              <td className="border px-3 py-2 text-sm text-gray-700">
                {new Date(result.executedAt).toLocaleString()}
              </td>
              <td className="border px-3 py-2 text-sm text-gray-700">
                {result.scriptName}
              </td>
              <td className="border px-3 py-2 text-sm text-gray-700">
                <ul className="list-disc pl-5">
                  {Object.entries(result.parameters).map(
                    ([key, value], paramIndex) => (
                      <li key={paramIndex}>
                        <span className="font-medium">{key}: </span>
                        <span>{maskSensitiveData(key, value)}</span>
                      </li>
                    )
                  )}
                </ul>
              </td>
              <td className="border px-3 py-2 text-sm text-gray-700">
                {JSON.stringify(result.result, null, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
