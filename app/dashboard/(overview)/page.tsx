import { Card } from "@/app/ui/dashboard/cards";
import { lusitana } from "@/app/ui/fonts";

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={"4"} type="collected" />
        <Card title="Pending" value={"3"} type="pending" />
        <Card title="Total Invoices" value="1" type="invoices" />
        <Card title="Total Customers" value={111111} type="customers" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8"></div>
    </main>
  );
}
