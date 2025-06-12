"use client";

import Spline from "@splinetool/react-spline";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";

export default function SplineScene() {
  const { openJournal, openLogout, openLogin } = useSocialJournalStore();

  function onLoad(spline: unknown) {
    if (typeof window !== "undefined") {
      (window as Window & { splineApp?: unknown }).splineApp = spline;
    }
  }

  function onSplineMouseDown(e: { target: { name: string } }) {
    if (e.target.name === "Chair") {
      setTimeout(() => {
        openJournal();
      }, 1000);
    } else if (e.target.name === "Towel") {
      setTimeout(() => {
        openLogout();
      }, 1500);
    } else if (e.target.name === "Letter Cover") {
      console.log(
        "Letter Cover has been clicked! Opening login drawer in 1 second..."
      );
      setTimeout(() => {
        openLogin();
      }, 1500);
    }
  }

  return (
    <Spline
      scene="https://prod.spline.design/8xw1nQicecSILnnd/scene.splinecode"
      onLoad={onLoad}
      onSplineMouseDown={onSplineMouseDown}
    />
  );
}
