import UserForm from "@/app/ui/user-form";
import { fetchInstanceData } from "@/app/lib/data";
import { Card } from "@/app/ui/dashboard/cards";
export default async function Page() {
  const instanceData = await fetchInstanceData();
  return (
    <>
      <UserForm />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {instanceData.map((instance) => (
          <Card
            key={instance.authToken}
            title={`Instance: ${instance.instance}`}
            value={instance.email}
            type="customers"
          />
        ))}
      </div>
    </>
  );
}
