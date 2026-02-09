export interface I_saveAgentBody {
  name: string | null;
  description: string | null;
  callType: string | null;
  language: string | null;
  voice: string | null;
  prompt: string | null;
  model: string | null;
  latency: number;
  speed: number;
  callScript: string | null;
  serviceDescription: string | null;
  attachments: string[];
  tools: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

export interface I_saveAgentResponse {
  id: string;
  name: string;
  description: string;
  callType: string;
  language: string;
  voice: string;
  prompt: string;
  model: string;
  latency: number;
  speed: number;
  callScript: string;
  serviceDescription: string;
  attachments: string[];
  tools: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}
