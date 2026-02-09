import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dispatch, SetStateAction } from "react";
import { I_saveAgentBody, I_formValidate } from "./types/agents";
import { I_testCallBody } from "./types/test-call";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setToast = (
  setState: Dispatch<SetStateAction<boolean>>,
  milliseconds: number,
): void => {
  setState(true);
  setTimeout(() => setState(false), milliseconds);
};

export const validateForm = (
  form: I_saveAgentBody,
  setErrorStatus: Dispatch<SetStateAction<I_formValidate>>,
  setError: Dispatch<SetStateAction<boolean>>,
  isTestCall?: boolean,
  testCallForm?: I_testCallBody,
): boolean => {
  const errors: I_formValidate = {
    name: !!form.name,
    callType: !!form.callType,
    language: !!form.language,
    model: !!form.model,
    prompt: !!form.prompt,
    voice: !!form.voice,
    phone: true,
  };
  if (isTestCall && testCallForm) errors.phone = !!testCallForm?.phoneNumber;

  setErrorStatus(errors);

  const isValid = Object.values(errors).every((value) => Boolean(value));

  if (!isValid) {
    setToast(setError, 2500);
  }

  return isValid;
};
