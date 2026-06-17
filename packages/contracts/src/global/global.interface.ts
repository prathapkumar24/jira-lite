export interface ApiResponseEnvelope<T> {
  success: boolean;
  timestamp: string;
  meta: { version: string };
  data: T;
}
