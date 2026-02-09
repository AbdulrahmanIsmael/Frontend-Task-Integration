export interface I_testCallBody {
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
}

export interface I_testCallResponse {
  success: boolean;
  callId: string;
  agentId: string;
  status: string;
}
