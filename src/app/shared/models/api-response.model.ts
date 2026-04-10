export interface ApiResponse<T> {
  data: T;
  mensaje: string;
  status: number;
  timestamp: string;
}

