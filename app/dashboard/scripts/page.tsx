"use client";

import React, { useState } from "react";
import scriptsData from "public/scripts/manifest.json";
import ScriptSelector from "./scriptSelector";
import ScriptForm from "./scriptForm";
import OutputDisplay from "@/app/dashboard/scripts/outputDisplay";
import { InstanceForm, Script } from "@/app/lib/definitions";

export default function ScriptsPage() {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [output, setOutput] = useState<string>("");

  const handleScriptSelection = (script: Script | null) => {
    setSelectedScript(script);
    setOutput("");
  };

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

  const executeScript = async (selectedCredential: InstanceForm) => {
    if (!selectedScript) return;
    console.log(selectedCredential.auth_token);
    const params = {
      ...(formData[selectedScript.name] || {}),
      authName: selectedCredential.email,
      authPass: selectedCredential.auth_token,
    };
    try {
      const result = await runScript(selectedScript.name, params, setOutput);
      setOutput((prevOutput) => prevOutput + `Script Output: ${result}\n`);
    } catch (error) {
      console.error("Error executing script:", error);
      setOutput(`Error: ${error}`);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Scripts</h1>
      <ScriptSelector
        scripts={scriptsData.scripts}
        selectedScript={selectedScript}
        onSelect={handleScriptSelection}
      />
      {selectedScript && (
        <ScriptForm
          script={selectedScript}
          formData={formData[selectedScript.name] || {}}
          onChange={handleInputChange}
          onSubmit={executeScript}
        />
      )}
      {output && <OutputDisplay output={output} />}
    </div>
  );
}

async function runScript(
  scriptName: string,
  params: Record<string, string>,
  setOutput: React.Dispatch<React.SetStateAction<string>>
) {
  let scriptToRun;
  switch (scriptName) {
    case "Script 1":
      scriptToRun = (await import("@/public/scripts/script1")).default;
      break;
    case "Script 2":
      scriptToRun = (await import("@/public/scripts/script2")).default;
      break;
    case "Assets to Assets Copy":
      scriptToRun = (await import("@/public/scripts/assetToAssetCopy")).default;
      break;
    case "Schema List":
      scriptToRun = (await import("@/public/scripts/schemaList")).default;
      break;
    default:
      throw new Error("Script not found");
  }
  if (typeof scriptToRun.run !== "function") {
    throw new Error(`Script ${scriptName} does not export a 'run' function.`);
  }
  return scriptToRun.run(params, (intermediateOutput: string) => {
    setOutput((prevOutput) => prevOutput + intermediateOutput + "\n");
  });
}
