"use client";

import { Check, ChevronDown, FileText, Phone, Upload, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerAttachment, uploadFile } from "@/lib/api/attachments";
import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useLanguages } from "@/hooks/use-languages";
import { useModels } from "@/hooks/use-models";
import { usePrompts } from "@/hooks/use-prompts";
import { useVoices } from "@/hooks/use-voices";
import { I_saveAgentBody } from "@/lib/types/agents";
import { saveAgent, updateAgent } from "@/lib/api/agents";
import { I_testCallBody } from "@/lib/types/test-call";
import { makeTestCall } from "@/lib/api/test-call";
import { setToast, validateForm } from "@/lib/utils";

interface UploadedFile {
  name: string;
  size: number;
  file: File;
  status: "uploading" | "success" | "error";
  notAcceptedExt?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">{badge} required</Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export interface AgentFormInitialData {
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}

export function AgentForm({ mode, initialData }: AgentFormProps) {
  const [agentId, setAgentId] = useState<string | null>(null);
  // Form state — initialized from initialData when provided
  const [agentName, setAgentName] = useState<string>(
    initialData?.agentName ?? "",
  );
  const [callType, setCallType] = useState<string>(initialData?.callType ?? "");
  const [language, setLanguage] = useState<string>(initialData?.language ?? "");
  const [voice, setVoice] = useState<string>(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState<string>(initialData?.prompt ?? "");
  const [model, setModel] = useState<string>(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);
  const [description, setDescription] = useState<string>(
    initialData?.description ?? "",
  );
  const [attachments, setAttachments] = useState<string[]>([]);

  // Call Script
  const [callScript, setCallScript] = useState<string>(
    initialData?.callScript ?? "",
  );

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState<string>(
    initialData?.serviceDescription ?? "",
  );

  // Reference Data
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Call
  const [testFirstName, setTestFirstName] = useState<string>("");
  const [testLastName, setTestLastName] = useState<string>("");
  const [testGender, setTestGender] = useState<string>("");
  const [testPhone, setTestPhone] = useState<string>("");

  // TASK3: Tools
  const [allowHangUp, setAllowHangUp] = useState<boolean>(false);
  const [allowCallback, setAllowCallback] = useState<boolean>(false);
  const [liveTransfer, setLiveTransfer] = useState<boolean>(false);

  const [successToast, setSuccessToast] = useState<boolean>(false);
  const [testCall, setTestCall] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>("");

  // BONUS: handling error for saving agent
  const [saveError, setSaveError] = useState<string | null>("");
  const [isFilled, setIsFilled] = useState({
    name: true,
    callType: true,
    language: true,
    voice: true,
    prompt: true,
    model: true,
    phone: true,
  });

  // TASK: Basic Settings
  const { languages, langLoading } = useLanguages();
  const { voices, voicesLoading } = useVoices();
  const { prompts, promptsLoading } = usePrompts();
  const { models, modelsLoading } = useModels();

  // Badge counts for required fields
  const basicSettingsMissing = [
    agentName,
    callType,
    language,
    voice,
    prompt,
    model,
  ].filter((v) => !v).length;

  // File upload handlers
  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  // TASK4: Collected form data
  const formData: I_saveAgentBody = {
    name: agentName || null,
    description,
    callType: callType || null,
    language: language || null,
    voice: voice || null,
    prompt: prompt || null,
    model: model || null,
    latency: latency[0],
    speed: speed[0],
    callScript,
    serviceDescription,
    attachments,
    tools: {
      allowCallback,
      allowHangUp,
      liveTransfer,
    },
  };

  // TASK4: Test Call form data
  const testCallData: I_testCallBody = {
    firstName: testFirstName,
    lastName: testLastName,
    gender: testGender,
    phoneNumber: testPhone,
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      let newFiles: UploadedFile[] = [];

      // TASK2: add files first, indicating uploading status
      const filesArray = Array.from(files);
      newFiles = filesArray.map((file) => ({
        name: file.name,
        size: file.size,
        file,
        status: "uploading",
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // TASK2: upload each file to the signed url
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (ACCEPTED_TYPES.includes(ext)) {
          try {
            const fileUpload = await uploadFile(file);
            console.log(fileUpload);

            const attachmentResponse = await registerAttachment(
              fileUpload.key,
              file.name,
              file.size,
              file.type,
            );
            setAttachments((prev) => [...prev, attachmentResponse.id]);

            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, status: "success" } : f,
              ),
            );
          } catch {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, status: "error" } : f,
              ),
            );
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, status: "error", notAcceptedExt: true }
                : f,
            ),
          );
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSaveAgent = async (
    e: React.MouseEvent | null,
    toast: boolean = true,
  ) => {
    if (!validateForm(formData, setIsFilled, setSaveError)) return "0";
    const agentResponse = agentId
      ? await updateAgent(formData, agentId)
      : await saveAgent(formData);

    if (toast) {
      setTestCall(false);
      setToast(setSuccessToast, 2500);
    }

    setAgentId(agentResponse.id);
    return agentResponse.id;
  };

  const handleTestCall = async () => {
    if (!validateForm(formData, setIsFilled, setSaveError, true, testCallData))
      return;
    if (!agentId) {
      const newAgentId = await handleSaveAgent(null, false);
      const testCallResponse = await makeTestCall(testCallData, newAgentId);
      if (testCallResponse.success) {
        setCallStatus(testCallResponse.status);
        setSuccessToast(false);
        setToast(setTestCall, 2500);
      }
    } else {
      const testCallResponse = await makeTestCall(testCallData, agentId);
      if (testCallResponse.success) {
        setCallStatus(testCallResponse.status);
        setSuccessToast(false);
        setToast(setTestCall, 2500);
      }
    }
  };

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

  return (
    <div className="relative flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button onClick={handleSaveAgent} className="cursor-pointer">
          {saveLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Collapsible Sections */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Settings */}
          <CollapsibleSection
            title="Basic Settings"
            description="Add some information about your agent to get started."
            badge={basicSettingsMissing}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">
                  Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. Sales Assistant"
                  value={agentName}
                  onChange={(e) => {
                    setIsFilled((prev) => ({ ...prev, name: true }));
                    setAgentName(e.target.value);
                  }}
                />
                {!isFilled.name && (
                  <span className="text-xs text-red-600 font-medium">
                    Please write the agent name!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Call Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={callType}
                  onValueChange={(value) => {
                    setIsFilled((prev) => ({ ...prev, callType: true }));
                    setCallType(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive Calls)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Make Calls)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!isFilled.callType && (
                  <span className="text-xs text-red-600 font-medium">
                    Please select the call type!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Language <span className="text-destructive">*</span>
                </Label>
                {langLoading ? (
                  <Spinner className="h-8 w-8 mx-auto" />
                ) : (
                  <Select
                    value={language}
                    onValueChange={(value) => {
                      setIsFilled((prev) => ({ ...prev, language: true }));
                      setLanguage(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* // TASK: write fetched languages */}
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isFilled.language && (
                  <span className="text-xs text-red-600 font-medium">
                    Please select the language!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Voice <span className="text-destructive">*</span>
                </Label>
                {voicesLoading ? (
                  <Spinner className="h-8 w-8 mx-auto" />
                ) : (
                  <Select
                    value={voice}
                    onValueChange={(value) => {
                      setIsFilled((prev) => ({ ...prev, voice: true }));
                      setVoice(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* // TASK: write fetched voices */}
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} <Tag tag={voice.tag} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isFilled.voice && (
                  <span className="text-xs text-red-600 font-medium">
                    Please select the voice!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Prompt <span className="text-destructive">*</span>
                </Label>
                {promptsLoading ? (
                  <Spinner className="h-8 w-8 mx-auto" />
                ) : (
                  <Select
                    value={prompt}
                    onValueChange={(value) => {
                      setIsFilled((prev) => ({ ...prev, prompt: true }));
                      setPrompt(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* // TASK: write fetched prompts */}
                      {prompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          {prompt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isFilled.prompt && (
                  <span className="text-xs text-red-600 font-medium">
                    Please select the prompt!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Model <span className="text-destructive">*</span>
                </Label>
                {modelsLoading ? (
                  <Spinner className="h-8 w-8 mx-auto" />
                ) : (
                  <Select
                    value={model}
                    onValueChange={(value) => {
                      setIsFilled((prev) => ({ ...prev, model: true }));
                      setModel(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* // TASK: write fetched models */}
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isFilled.model && (
                  <span className="text-xs text-red-600 font-medium">
                    Please select the call model!
                  </span>
                )}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latency ({latency[0].toFixed(1)}s)</Label>
                  <Slider
                    value={latency}
                    onValueChange={setLatency}
                    min={0.3}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.3s</span>
                    <span>1.0s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speed ({speed[0]}%)</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={90}
                    max={130}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>130%</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Call Script */}
          <CollapsibleSection
            title="Call Script"
            description="What would you like the AI agent to say during the call?"
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Write your call script here..."
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {callScript.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 4: Service/Product Description */}
          <CollapsibleSection
            title="Service/Product Description"
            description="Add a knowledge base about your service or product."
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your service or product..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {serviceDescription.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 5: Reference Data */}
          <CollapsibleSection
            title="Reference Data"
            description="Enhance your agent's knowledge base with uploaded files."
          >
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                  // TASK: each input has to be labled with Next.js, and adding title sovles the warning msg
                  title="hidden upload input"
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
                </p>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* // TASK2: display checkmark if file is uploaded successfully or X mark if not */}
                        {f.status === "uploading" && <Spinner />}
                        {f.status === "success" && (
                          <Check
                            className="text-green-600 h-4 w-4"
                            aria-label="uploaded successfully"
                          />
                        )}
                        {f.status === "error" && (
                          <X
                            className="text-red-600 h-4 w-4"
                            aria-label="Uploading failed, try again"
                          />
                        )}
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(f.size)}
                        </span>
                        {/* // TASK2: Display message for unsupported files types */}
                        {f.notAcceptedExt && (
                          <span className="ml-3 text-red-600 text-xs">
                            Unsupported File Type
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">No Files Available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 6: Tools */}
          <CollapsibleSection
            title="Tools"
            description="Tools that allow the AI agent to perform call-handling actions and manage session control."
          >
            <FieldGroup className="w-full">
              <FieldLabel htmlFor="switch-hangup">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow hang up</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to hang up the
                      call
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-hangup"
                    checked={allowHangUp}
                    onCheckedChange={() => setAllowHangUp((prev) => !prev)}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-callback">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow callback</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to make
                      callbacks
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-callback"
                    checked={allowCallback}
                    onCheckedChange={() => setAllowCallback((prev) => !prev)}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-transfer">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Live transfer</FieldTitle>
                    <FieldDescription>
                      Select if you want to transfer the call to a human agent
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-transfer"
                    checked={liveTransfer}
                    onCheckedChange={() => setLiveTransfer((prev) => !prev)}
                  />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </CollapsibleSection>
        </div>

        {/* Right Column — Sticky Test Call Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Test Call
                </CardTitle>
                <CardDescription>
                  Make a test call to preview your agent. Each test call will
                  deduct credits from your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="test-first-name">First Name</Label>
                      <Input
                        id="test-first-name"
                        placeholder="John"
                        value={testFirstName}
                        onChange={(e) => setTestFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-last-name">Last Name</Label>
                      <Input
                        id="test-last-name"
                        placeholder="Doe"
                        value={testLastName}
                        onChange={(e) => setTestLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={testGender} onValueChange={setTestGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <PhoneInput
                      defaultCountry="EG"
                      value={testPhone}
                      onChange={(value) => {
                        setIsFilled((prev) => ({ ...prev, phone: true }));
                        setTestPhone(value);
                      }}
                      placeholder="Enter phone number"
                    />
                    {!isFilled.phone && (
                      <span className="text-xs text-red-600 font-medium">
                        Please write the phone number!
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full cursor-pointer"
                    onClick={handleTestCall}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Start Test Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button onClick={handleSaveAgent} className="cursor-pointer">
            {saveLabel}
          </Button>
        </div>
      </div>

      <span
        className={`${!successToast && "-translate-y-50"} flex items-center gap-3 fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium px-4 py-2 shadow-md transition ease duration-500`}
      >
        <Check className="text-green-800 border border-green-800 p-0.5 rounded-4xl" />{" "}
        Agent Saved Successfully
      </span>

      <span
        className={`${!saveError && "-translate-y-50"} flex items-center gap-3 fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium px-4 py-2 shadow-md transition ease duration-500`}
      >
        <X className="text-red-800 border border-red-800 p-0.5 rounded-4xl" />{" "}
        {saveError}
      </span>

      <span
        className={`${!testCall && "-translate-y-50"} fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-medium px-4 py-2 shadow-md transition ease duration-500`}
      >
        {callStatus}
      </span>
    </div>
  );
}
