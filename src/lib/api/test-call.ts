import { I_testCallBody, I_testCallResponse } from "../types/test-call";
import { postData } from "./client";

export async function makeTestCall(
  payload: I_testCallBody,
  id: string,
): Promise<I_testCallResponse> {
  const response = await postData<I_testCallResponse>(
    `agents/${id}/test-call`,
    payload,
  );

  return response;
}
