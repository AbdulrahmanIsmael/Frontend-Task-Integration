export async function getData<T>(endpoint: string): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseURL}/${endpoint}`);

  if (!response.ok) {
    throw new Error("Something went wrong!");
  }

  return response.json();
}

export async function postData<T>(
  endpoint: string,
  payload?: object,
): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseURL}/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload) || null,
    headers: payload && {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Something went wrong!");
  }

  return response.json();
}

export async function putFile<T>(url: string, file?: File): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(
      "Something went wrong when uploading the file, please try again later!",
    );
  }

  return response.json();
}

export async function putData<T>(
  endpoint: string,
  payload?: object,
): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseURL}/${endpoint}`, {
    method: "PUT",
    body: JSON.stringify(payload) || null,
    headers: payload && {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Something went wrong, please try again later!");
  }

  return response.json();
}
