import { toast } from "sonner";

export type AppErrorContent = {
  title: string;
  body: string;
};

export const ERROR_MESSAGES = {
  default: {
    title: "We couldn't process your request.",
    body: "Please check your internet connection, try again, or upload a clearer image.",
  },
  network: {
    title: "We couldn't reach our servers.",
    body: "Please check your internet connection and try again.",
  },
  imageAnalysis: {
    title: "We couldn't analyze your question.",
    body: "Please check your internet connection, try again, or upload a clearer image.",
  },
  imageUpload: {
    title: "We couldn't upload your image.",
    body: "Please try selecting the image again or choose a file smaller than 5MB.",
  },
  pdfProcessing: {
    title: "We couldn't process your PDF.",
    body: "Please check your internet connection and try a text-based PDF, or use Snap & Solve for scanned pages.",
  },
  pdfScanned: {
    title: "This PDF couldn't be read as text.",
    body: "Scanned PDFs work best page-by-page with Snap & Solve. Try a digital PDF or a clearer scan.",
  },
  pdfNoQuestions: {
    title: "No questions were found in this PDF.",
    body: "Try a simpler or cleaner PDF, or double-check the exam type and subject you selected.",
  },
  literature: {
    title: "We couldn't generate the explanation.",
    body: "Please check your internet connection and try again in a moment.",
  },
  examGenerate: {
    title: "We couldn't generate your mock exam.",
    body: "Please check your internet connection and try again. You may need to load sample questions first.",
  },
  examSubmit: {
    title: "We couldn't save your exam results.",
    body: "Please check your internet connection and try submitting again.",
  },
  seedQuestions: {
    title: "We couldn't load sample questions.",
    body: "Please check your internet connection and try again.",
  },
  profile: {
    title: "We couldn't create your profile.",
    body: "Please check your internet connection and try again.",
  },
  auth: {
    title: "We couldn't sign you in.",
    body: "Please check your email and password, then try again.",
  },
  authInvalidPassword: {
    title: "That password didn't work.",
    body: "Please check your password and try again.",
  },
  authWrongFlow: {
    title: "We couldn't complete sign in.",
    body: "Double-check your details or try signing up instead.",
  },
  audioPlayback: {
    title: "Audio playback failed.",
    body: "Please try again or read the explanation on screen.",
  },
} as const satisfies Record<string, AppErrorContent>;

export function showErrorToast(error: AppErrorContent) {
  toast.error(error.title, {
    description: error.body,
    duration: 5000,
  });
}

export function showValidationToast(error: AppErrorContent) {
  toast.error(error.title, {
    description: error.body,
    duration: 4000,
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.toLowerCase();
  return String(error).toLowerCase();
}

function isNetworkError(message: string): boolean {
  return (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("internet")
  );
}

export function resolveImageAnalysisError(error: unknown): AppErrorContent {
  const message = getErrorMessage(error);
  if (isNetworkError(message)) return ERROR_MESSAGES.network;
  if (message.includes("upload")) return ERROR_MESSAGES.imageUpload;
  if (message.includes("image not found")) return ERROR_MESSAGES.imageUpload;
  return ERROR_MESSAGES.imageAnalysis;
}

export function resolvePdfProcessingError(error: unknown): AppErrorContent {
  const message = getErrorMessage(error);
  if (isNetworkError(message)) return ERROR_MESSAGES.network;
  if (message.includes("could not extract text") || message.includes("scanned")) {
    return ERROR_MESSAGES.pdfScanned;
  }
  if (message.includes("no questions were found")) return ERROR_MESSAGES.pdfNoQuestions;
  if (message.includes("could not parse questions")) return ERROR_MESSAGES.pdfNoQuestions;
  return ERROR_MESSAGES.pdfProcessing;
}

export function resolveLiteratureError(error: unknown): AppErrorContent {
  const message = getErrorMessage(error);
  if (isNetworkError(message)) return ERROR_MESSAGES.network;
  return ERROR_MESSAGES.literature;
}

export function resolveExamError(error: unknown): AppErrorContent {
  const message = getErrorMessage(error);
  if (isNetworkError(message)) return ERROR_MESSAGES.network;
  return ERROR_MESSAGES.examGenerate;
}

export function resolveExamSubmitError(error: unknown): AppErrorContent {
  const message = getErrorMessage(error);
  if (isNetworkError(message)) return ERROR_MESSAGES.network;
  return ERROR_MESSAGES.examSubmit;
}

export function resolveProfileError(error: unknown): AppErrorContent {
  const message = getErrorMessage(error);
  if (isNetworkError(message)) return ERROR_MESSAGES.network;
  return ERROR_MESSAGES.profile;
}

export function resolveAuthError(
  error: unknown,
  flow: "signIn" | "signUp"
): AppErrorContent {
  const message = getErrorMessage(error);
  if (message.includes("invalid password")) return ERROR_MESSAGES.authInvalidPassword;
  if (flow === "signIn") {
    return {
      title: "We couldn't sign you in.",
      body: "Check your email and password, or try signing up instead.",
    };
  }
  return {
    title: "We couldn't create your account.",
    body: "Check your details, or try signing in if you already have an account.",
  };
}
