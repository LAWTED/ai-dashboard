import SocialJournalClient from "./components/social-journal-client";

export function generateViewport() {
  return {
    themeColor: "#C8D4DC",
  };
}

export default function SocialJournalPage() {
  return <SocialJournalClient />;
}
