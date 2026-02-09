export interface I_languageResponse {
  id: string;
  name: string;
  code: string;
}

export interface I_voiceResponse {
  id: string;
  name: string;
  tag: string;
  language: string;
}

export interface I_promptResponse {
  id: string;
  name: string;
  description: string;
}

export interface I_modelResponse {
  id: string;
  name: string;
  description: string;
}
