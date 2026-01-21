export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Article[];
  code?: string;
  message?: string;
}

export interface User {
  uid: string;
  fullName: string;
  email: string;
  birthYear: number;
  role: "USER" | "ADMIN";
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
