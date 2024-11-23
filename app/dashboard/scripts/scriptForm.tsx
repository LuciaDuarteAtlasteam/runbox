import React, { useEffect, useState } from "react";
import { InstanceForm, Script } from "@/app/lib/definitions";
import { fetchInstanceData } from "@/app/lib/data";
import { Button } from "@/app/ui/button";

interface ScriptFormProps {
  script: Script;
  formData: Record<string, string>;
  onChange: (scriptName: string, paramName: string, value: string) => void;
  onSubmit: (selectedCredential: InstanceForm) => void;
}

export default function ScriptForm({
  script,
  formData,
  onChange,
  onSubmit,
}: ScriptFormProps) {
  const [credentials, setCredentials] = useState<InstanceForm[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<
    InstanceForm | undefined
  >(undefined);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const data = await fetchInstanceData();
        setCredentials(data);
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    };
    loadCredentials();
  }, []);

  const isFormValid = () => {
    return (
      selectedCredential &&
      script.parameters?.every((param) => {
        return !param.required || formData[param.name]?.trim() !== "";
      })
    );
  };

  return (
    <>
      <div className="mb-4">
        <label
          htmlFor="credentialSelector"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Credential
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          id="credentialSelector"
          value={selectedCredential?.id || ""}
          onChange={(e) =>
            setSelectedCredential(
              credentials.find((cred) => cred.id === e.target.value)
            )
          }
        >
          <option value="" disabled>
            -- Select a Credential --
          </option>
          {credentials.map((cred) => (
            <option key={cred.id} value={cred.id}>
              {cred.email} ({cred.instance})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 border rounded-md shadow-sm bg-white">
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
                type={param.type === "text" ? "text" : param.type}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required={param.required}
                value={formData[param.name] || ""}
                onChange={(e) =>
                  onChange(script.name, param.name, e.target.value)
                }
              />
            </div>
          ))}
        </div>
        <Button
          onClick={() => selectedCredential && onSubmit(selectedCredential)}
          className="mt-4 w-full rounded-md bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
          aria-disabled={!isFormValid()}
        >
          Run Script
        </Button>
      </div>
    </>
  );
}
