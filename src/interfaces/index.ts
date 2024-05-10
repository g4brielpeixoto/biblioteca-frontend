export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  publicationYear: number;
  copies: number;
  availableCopies: number;
  category?: Category;
}
