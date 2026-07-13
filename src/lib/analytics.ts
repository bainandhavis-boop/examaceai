import { track } from "@vercel/analytics";

export const AnalyticsEvents = {
  PAGE_VIEW: "page_view",
  SIGN_IN: "sign_in",
  ANONYMOUS_SIGN_IN: "anonymous_sign_in",
  DEMO_QUESTION_OPENED: "demo_question_opened",
  DEMO_QUESTION_TRY_OWN: "demo_question_try_own",
  QUESTION_SOLVED: "question_solved",
} as const;

type PageName = "landing" | "onboarding" | "dashboard" | `dashboard/${string}`;

export function trackPageView(page: PageName) {
  track(AnalyticsEvents.PAGE_VIEW, { page });
}

export function trackSignIn(flow: "signIn" | "signUp") {
  track(AnalyticsEvents.SIGN_IN, { method: "password", flow });
}

export function trackAnonymousSignIn() {
  track(AnalyticsEvents.ANONYMOUS_SIGN_IN);
}

export function trackDemoQuestionOpened() {
  track(AnalyticsEvents.DEMO_QUESTION_OPENED);
}

export function trackDemoQuestionTryOwn() {
  track(AnalyticsEvents.DEMO_QUESTION_TRY_OWN);
}

export function trackQuestionSolved(properties?: {
  subject?: string;
  source?: "image" | "pdf";
}) {
  track(AnalyticsEvents.QUESTION_SOLVED, properties);
}
