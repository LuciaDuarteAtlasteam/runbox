import { fetchInstanceData } from "@/app/lib/data";
import { Card } from "@/app/ui/dashboard/cards";
import { CreateInstance } from "@/app/ui/invoices/buttons";
export default async function Page() {
  const instanceData = await fetchInstanceData();
  return (
    <>
      <CreateInstance />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {instanceData.map((instance) => (
          <Card
            key={instance.id}
            title={`Instance: ${instance.instance}`}
            value={instance.email}
            instance={instance}
          />
        ))}
      </div>
    </>
  );
}
