import { InstanceForm } from "@/app/lib/definitions";
import { DeleteInstance, UpdateInstance } from "../invoices/buttons";

export function Card({
  title,
  value,
  instance,
}: {
  title: string;
  value: string;
  instance: InstanceForm;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h3 className="ml-2 text-sm font-medium">{title}</h3>
        </div>
        <div className="flex space-x-2">
          <UpdateInstance instance={instance} />
          <DeleteInstance id={instance.id} />
        </div>
      </div>
      <p className="px-4">{value}</p>
    </div>
  );
}
