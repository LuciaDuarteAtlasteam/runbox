import EditUserForm from "@/app/ui/user/editForm";

export default async function Page() {
  return (
    <>
      <EditUserForm
        instanceData={{
          id: "",
          email: "",
          authToken: "",
          instance: "",
        }}
      />
    </>
  );
}
