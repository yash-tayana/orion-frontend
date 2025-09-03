import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type NoteAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
};

export type LearnerNote = {
  id: string;
  text: string;
  attachments: NoteAttachment[];
  author: {
    id: string;
    displayName: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateNotePayload = {
  text: string;
  files?: File[];
};

export function useLearnerNotes(learnerId: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const notesQuery = useQuery<LearnerNote[]>({
    queryKey: ["learnerNotes", learnerId],
    queryFn: () =>
      fetchJson<LearnerNote[]>(`/api/v1/learners/${learnerId}/notes`, {
        token: accessToken || undefined,
      }),
    enabled: Boolean(accessToken && learnerId),
  });

  const createNote = useMutation({
    mutationFn: async (payload: CreateNotePayload) => {
      const formData = new FormData();
      formData.append("text", payload.text);

      if (payload.files) {
        payload.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Log FormData keys for debugging
      console.log("Create note FormData keys:", Array.from(formData.keys()));

      return fetchJson<LearnerNote>(`/api/v1/learners/${learnerId}/notes`, {
        method: "POST",
        body: formData,
        token: accessToken || undefined,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for multipart
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learnerNotes", learnerId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: string) =>
      fetchJson(`/api/v1/learners/${learnerId}/notes/${noteId}`, {
        method: "DELETE",
        token: accessToken || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learnerNotes", learnerId] });
    },
  });

  return {
    notes: notesQuery,
    create: createNote,
    delete: deleteNote,
  } as const;
}

export default useLearnerNotes;
