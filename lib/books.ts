export type Book = {
  id: number;
  title: string;
  authors: string;
  description: string;
  pdfUrl?: string;
};

let bookSeq = 1;
const books: Book[] = [];

export function listBooks() {
  return books.slice();
}

export function createBook(input: Omit<Book, 'id'>) {
  const item: Book = { id: bookSeq++, ...input };
  books.push(item);
  return item;
}

export function updateBook(id: number, patch: Partial<Omit<Book, 'id'>>) {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return null;
  books[idx] = { ...books[idx], ...patch };
  return books[idx];
}

export function deleteBook(id: number) {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return false;
  books.splice(idx, 1);
  return true;
}