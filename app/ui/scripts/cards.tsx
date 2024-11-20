import React from "react";
import { Script } from "app/lib/definitions";

interface CardProps {
  scripts: Script[];
  onRunScript: (scriptName: string, params: Record<string, string>) => void;
}

export function Card({ scripts, onRunScript }: CardProps) {
  const [formData, setFormData] = React.useState<
    Record<string, Record<string, string>>
  >({});

  const handleInputChange = (
    scriptName: string,
    paramName: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [scriptName]: {
        ...(prev[scriptName] || {}),
        [paramName]: value,
      },
    }));
  };

  const handleRunScript = (scriptName: string) => {
    const params = formData[scriptName] || {};
    onRunScript(scriptName, params);
  };

  return (
    <div>
      {scripts.map((script) => (
        <div
          key={script.name}
          className="mb-4 p-4 border rounded-md shadow-sm bg-white"
        >
          <h4 className="font-medium">{script.name}</h4>
          <p className="text-sm text-gray-500">{script.description}</p>
          <div className="mt-2">
            <h5 className="text-xs font-medium">Parameters:</h5>
            {script.parameters?.map((param) => (
              <div key={param.name} className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  {param.label}{" "}
                  {param.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={param.type}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required={param.required}
                  onChange={(e) =>
                    handleInputChange(script.name, param.name, e.target.value)
                  }
                />
              </div>
            )) || (
              <p className="text-gray-500">
                No parameters required for this script.
              </p>
            )}
          </div>
          <button
            onClick={() => handleRunScript(script.name)}
            className="mt-4 w-full rounded-md bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
          >
            Run Script
          </button>
        </div>
      ))}
    </div>
  );
}
