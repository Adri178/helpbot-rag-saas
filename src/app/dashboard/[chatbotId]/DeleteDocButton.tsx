"use client";

import { deleteDocument } from "./actions";

export function DeleteDocButton({
  chatbotId,
  documentId,
  filename,
}: {
  chatbotId: string;
  documentId: string;
  filename: string;
}) {
  return (
    <form
      action={deleteDocument.bind(null, chatbotId, documentId)}
      onSubmit={(e) => {
        if (!confirm(`Hapus "${filename}"? Chunk yang sudah diindeks ikut terhapus.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-[13px] font-semibold text-[#9F1239]">
        Hapus
      </button>
    </form>
  );
}
