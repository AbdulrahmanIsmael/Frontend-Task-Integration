import { I_saveAgentBody, I_saveAgentResponse } from "../types/agents";
import { postData, putData } from "@/lib/api/client";

export async function updateAgent(payload: I_saveAgentBody, id: string) {
  const response = await putData<I_saveAgentResponse>(`agents/${id}`, payload);

  return response;
}

export async function saveAgent(payload: I_saveAgentBody) {
  const response = await postData<I_saveAgentResponse>("agents", payload);

  return response;
}
