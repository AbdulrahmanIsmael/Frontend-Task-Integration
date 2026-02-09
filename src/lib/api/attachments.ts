// TASK2: write task2 api calls
import {
  I_registerAttachmentResponse,
  I_signedURLResponse,
  I_uploadFileResponse,
} from "../types/attachements";

async function getSignedURL(): Promise<I_signedURLResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/attachments/upload-url`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Something went wrong, please request a new signed url!");
  }

  return response.json();
}

export async function uploadFile(file: File): Promise<I_uploadFileResponse> {
  const signedUrl = await getSignedURL();

  const response = await fetch(`${signedUrl.signedUrl}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      "Something went wrong when uploading the file, please try again later!",
    );
  }

  return response.json();
}

export async function registerAttachment(
  key: string,
  fileName: string,
  fileSize: number,
  fileType: string,
): Promise<I_registerAttachmentResponse> {
  const body = {
    key: key,
    fileName: fileName,
    fileSize: fileSize,
    mimeType: fileType,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/attachments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  return response.json();
}
