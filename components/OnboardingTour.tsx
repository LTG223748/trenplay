"use client";

import { useState } from "react";
import Joyride, { Step, CallBackProps } from "react-joyride";

type OnboardingTourProps = {
  onFinish: () => void;
};

export default function OnboardingTour({ onFinish }: OnboardingTourProps) {
  const [run, setRun] = useState(true);

  const steps: Step[] = [
    {
      target: "#wallet-balance",
      content: "This is your TrenCoin balance. You’ll use TC to join matches.",
    },
    {
      target: "#quick-join",
      content: "Quick Join finds you a match instantly.",
    },
    {
      target: "#matches-grid",
      content: "Here’s the live matches list. Join or create your own.",
    },
    {
      target: "#trust-badge",
      content: "Trusted players have badges showing no disputes.",
    },
    {
      target: "#sidebar",
      content: "Use the sidebar to navigate between divisions, games, and settings.",
    },
    {
      target: "#trenbot",
      content: "TrenBot helps automate matchmaking and dispute resolution.",
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false);
      onFinish(); // ✅ notify parent (_app.tsx)
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      styles={{
        options: {
          primaryColor: "#facc15", // yellow
          backgroundColor: "#1a1a2e",
          textColor: "#fff",
          zIndex: 9999, // ensure overlay stays above everything
        },
      }}
      callback={handleCallback}
    />
  );
}

