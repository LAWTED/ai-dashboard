"use client";

import Spline from "@splinetool/react-spline";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";

export default function SplineScene() {
  const { openJournal, openLogout } = useSocialJournalStore();

  function onLoad(spline: unknown) {
    if (typeof window !== 'undefined') {
      (window as Window & { splineApp?: unknown }).splineApp = spline;
    }
  }

  function onSplineMouseDown(e: { target: { name: string } }) {
    console.log('Spline mouse down', e.target.name);
    if (e.target.name === 'Books' || e.target.name === 'plant') {
      console.log('Plant has been clicked! Opening social journal...');
      openJournal();
    } else if (e.target.name === 'Towel') {
      console.log('Towel has been clicked! Opening logout drawer...');
      openLogout();
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