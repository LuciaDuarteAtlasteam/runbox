"use client";
import React, { useState } from "react";
import scriptsData from "public/scripts/manifest.json";
import { Script, ScriptData } from "@/app/lib/definitions";
import script1 from "@/public/scripts/script1";
import script2 from "@/public/scripts/script2";
import assetToAssetCopy from "@/public/scripts/assetToAssetCopy";

export default function ScriptsPage() {
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [output, setOutput] = useState<string>("");

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

  const executeScript = async (scriptName: string) => {
    const params = formData[scriptName] || {};

    try {
      let selectedScript;
      switch (scriptName) {
        case "script1":
          selectedScript = script1;
          break;
        case "script2":
          selectedScript = script2;
        case "assetToAssetCopy":
          selectedScript = assetToAssetCopy;
          break;
        default:
          throw new Error("Script not found");
      }

      if (typeof selectedScript.run !== "function") {
        throw new Error(
          `Script ${scriptName} does not export a function 'run'.`
        );
      }

      const result = selectedScript.run(params);
      console.log(result);
      setOutput(`Script Output: ${result}`);
    } catch (error) {
      console.error("Error executing script:", error);
      setOutput(`Error: ${error}`);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Scripts</h1>
      <div>
        {scriptsData.scripts.map((script) => (
          <div
            key={script.name}
            className="mb-4 p-4 border rounded-md shadow-sm bg-white"
          >
            <h4 className="font-medium">{script.name}</h4>
            <p className="text-sm text-gray-500">{script.description}</p>
            <div className="mt-2">
              <h5 className="text-xs font-medium">Parameters:</h5>
              {script.parameters.map((param) => (
                <div key={param.name} className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {param.label}{" "}
                    {param.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={param.type === "text" ? "text" : param.type}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required={param.required}
                    onChange={(e) =>
                      handleInputChange(script.name, param.name, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => executeScript(script.name)}
              className="mt-4 w-full rounded-md bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
            >
              Run Script
            </button>
          </div>
        ))}
      </div>
      {output && (
        <div className="mt-4 p-4 bg-gray-100 border rounded-md">{output}</div>
      )}
    </div>
  );
}
