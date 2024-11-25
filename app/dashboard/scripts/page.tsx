"use client";

import React, { useState } from "react";
import scriptsData from "public/scripts/manifest.json";
import ScriptSelector from "./scriptSelector";
import ScriptForm from "./scriptForm";
import OutputDisplay from "@/app/dashboard/scripts/outputDisplay";
import { InstanceForm, Script } from "@/app/lib/definitions";
import { saveScriptResult } from "@/app/lib/actions";
import ScriptResultsTable from "./scriptResultsTable";

export default function ScriptsPage() {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

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
    setIsExecuting(true);
    const params = {
      ...(formData[selectedScript.name] || {}),
      authName: selectedCredential.email,
      authPass: selectedCredential.auth_token,
    };
    try {
      const result = await runScript(selectedScript.name, params, setOutput);
      setOutput((prevOutput) => prevOutput + `Script Output: ${result}\n`);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error executing script:", error);
      setOutput(`Error: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Scripts</h1>
      {!isExecuting && (
        <ScriptSelector
          scripts={scriptsData.scripts}
          selectedScript={selectedScript}
          onSelect={handleScriptSelection}
        />
      )}
      {selectedScript && !isExecuting && (
        <ScriptForm
          script={selectedScript}
          formData={formData[selectedScript.name] || {}}
          onChange={handleInputChange}
          onSubmit={executeScript}
        />
      )}
      {output && <OutputDisplay output={output} />}
      <ScriptResultsTable refreshTrigger={refreshTrigger} />
    </div>
  );
}

async function runScript(
  scriptName: string,
  params: Record<string, string>,
  setOutput: React.Dispatch<React.SetStateAction<string>>
): Promise<any> {
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
    case "Orga List":
      scriptToRun = (await import("@/public/scripts/getAllOrgsFromSD")).default;
      break;
    default:
      throw new Error("Script not found");
  }
  if (typeof scriptToRun.run !== "function") {
    throw new Error(`Script ${scriptName} does not export a 'run' function.`);
  }
  try {
    const result = await scriptToRun.run(
      params,
      (intermediateOutput: string) => {
        setOutput((prevOutput) => prevOutput + intermediateOutput + "\n");
      }
    );

    await saveScriptResult({
      scriptName,
      parameters: params,
      result,
      executedAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error("Error executing script:", error);
    throw error;
  }
}
