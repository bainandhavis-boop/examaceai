import { useEffect, useRef } from "react";
import { trackPageView } from "../lib/analytics";

type AppPage = "landing" | "onboarding";

export function useTrackPageView(page: AppPage | null) {
  const lastTrackedPage = useRef<string | null>(null);

  useEffect(() => {
    if (!page || lastTrackedPage.current === page) return;
    lastTrackedPage.current = page;
    trackPageView(page);
  }, [page]);
}

export function useTrackDashboardTab(tab: string) {
  const lastTrackedTab = useRef<string | null>(null);

  useEffect(() => {
    const page = `dashboard/${tab}` as const;
    if (lastTrackedTab.current === page) return;
    lastTrackedTab.current = page;
    trackPageView(page);
  }, [tab]);
}
