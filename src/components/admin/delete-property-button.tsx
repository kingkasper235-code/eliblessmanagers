"use client";

import { deletePropertyAction } from "@/lib/admin-actions";

export function DeletePropertyButton({ propertyId }: { propertyId: number }) {
  return (
    <form action={deletePropertyAction} className="inline-block">
      <input type="hidden" name="propertyId" value={propertyId} />
      <button
        type="submit"
        onClick={(event) => {
          const shouldDelete = window.confirm("Delete this property? This action cannot be undone.");
          if (!shouldDelete) {
            event.preventDefault();
          }
        }}
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Delete
      </button>
    </form>
  );
}
