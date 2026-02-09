export async function getData<T>(endpoint: string): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseURL}/${endpoint}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}
