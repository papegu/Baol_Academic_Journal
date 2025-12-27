export type ReviewNote = { articleId: number; note: string; updatedAt: number };

const notesStore: Map<number, ReviewNote> = new Map();

export function getReviewNote(articleId: number): ReviewNote | null {
  return notesStore.get(articleId) || null;
}

export function setReviewNote(articleId: number, note: string): ReviewNote {
  const item: ReviewNote = { articleId, note, updatedAt: Date.now() };
  notesStore.set(articleId, item);
  return item;
}
