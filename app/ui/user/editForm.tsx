"use client";

import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  GlobeAltIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { updateInstanceData, State } from "@/app/lib/actions";
import { useActionState } from "react";

export default function EditUserForm({
  instanceData,
}: {
  instanceData: {
    id: string;
    email: string;
    authToken: string;
    instance: string;
  };
}) {
  const initialState: State = { message: null, errors: {} };
  const updateUserWithId = updateInstanceData.bind(null, instanceData.id);
  const [state, formAction] = useActionState(updateUserWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={instanceData.email}
              placeholder="Enter your email"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="email-error"
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="apiKey" className="mb-2 block text-sm font-medium">
            API Key
          </label>
          <div className="relative">
            <input
              id="authToken"
              name="authToken"
              type="text"
              defaultValue={instanceData.authToken}
              placeholder="Enter your API Key"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="apiKey-error"
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="apiKey-error" aria-live="polite" aria-atomic="true">
            {state.errors?.authToken &&
              state.errors.authToken.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="domain" className="mb-2 block text-sm font-medium">
            Instance Domain
          </label>
          <div className="relative">
            <input
              id="instance"
              name="instance"
              type="text"
              defaultValue={instanceData.instance}
              placeholder="Enter your domain"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="domain-error"
            />
            <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="domain-error" aria-live="polite" aria-atomic="true">
            {state.errors?.instance &&
              state.errors.instance.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="my-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          type="button"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          onClick={() => history.back()}
        >
          Cancel
        </Button>
        <Button type="submit">Update Instance</Button>
      </div>
    </form>
  );
}
