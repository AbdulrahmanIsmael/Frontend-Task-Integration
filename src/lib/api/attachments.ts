// TASK2: write task2 api calls
import {
  I_registerAttachmentResponse,
  I_signedURLResponse,
  I_uploadFileResponse,
} from "../types/attachements";
import { postData, putFile } from "@/lib/api/client";

async function getSignedURL(): Promise<I_signedURLResponse> {
  const response = await postData<I_signedURLResponse>(
    "attachments/upload-url",
  );

  return response;
}

export async function uploadFile(file: File): Promise<I_uploadFileResponse> {
  const signedUrl = await getSignedURL();

  const response = await putFile<I_uploadFileResponse>(
    signedUrl.signedUrl,
    file,
  );

  return response;
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

  const response = await postData<I_registerAttachmentResponse>(
    "attachments",
    body,
  );

  return response;
}
