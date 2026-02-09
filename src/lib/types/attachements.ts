export interface I_signedURLResponse {
  key: string;
  signedUrl: string;
  expiresIn: number;
}

export interface I_uploadFileResponse {
  success: boolean;
  key: string;
  message: string;
}

export interface I_registerAttachmentBody {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface I_registerAttachmentResponse {
  id: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
