import React from "react";
import { Script } from "@/app/lib/definitions";

interface ScriptSelectorProps {
  scripts: Script[];
  selectedScript: Script | null;
  onSelect: (script: Script | null) => void;
}

export default function ScriptSelector({
  scripts,
  selectedScript,
  onSelect,
}: ScriptSelectorProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor="script-select"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select a Script
      </label>
      <select
        id="script-select"
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        value={selectedScript?.name || ""}
        onChange={(e) =>
          onSelect(scripts.find((s) => s.name === e.target.value) || null)
        }
      >
        <option value="" disabled>
          -- Select a script --
        </option>
        {scripts.map((script) => (
          <option key={script.name} value={script.name}>
            {script.name}
          </option>
        ))}
      </select>
    </div>
  );
}
