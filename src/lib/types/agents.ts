export interface I_saveAgentBody {
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
