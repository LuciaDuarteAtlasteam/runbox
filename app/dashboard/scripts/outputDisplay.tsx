import React from "react";

interface OutputDisplayProps {
  output: string;
}

export default function OutputDisplay({ output }: OutputDisplayProps) {
  return (
    <div
      style={{ whiteSpace: "pre-wrap" }}
      className="mt-4 p-4 bg-gray-100 border rounded-md"
    >
      {output}
    </div>
  );
}
