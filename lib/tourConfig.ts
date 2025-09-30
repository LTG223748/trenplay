// lib/tourConfig.ts
import { Step } from "react-joyride";

export const tourSteps: Step[] = [
  // 🔹 Sidebar
  {
    target: "#nav-home",
    content: "This is your Home dashboard. It’s where you’ll land when you log in.",
  },
  {
    target: "#nav-leaderboard",
    content: "The Leaderboard shows top players ranked by ELO and winnings.",
  },
  {
    target: "#nav-tournaments",
    content: "Tournaments are larger events with bigger stakes and rewards.",
  },
  {
    target: "#nav-profile",
    content: "Profile is where you can manage your avatar, info, and stats.",
  },
  {
    target: "#nav-matches",
    content: "Matches is the main hub for joining and creating live games.",
  },
  {
    target: "#nav-friends",
    content: "Friends lets you add and manage people you play with often.",
  },
  {
    target: "#nav-refer",
    content: "Refer friends and earn TrenCoin bonuses when they join.",
  },
  {
    target: "#nav-howto",
    content: "How To Use explains everything about playing on TrenPlay.",
  },

  // 🔹 Header / Top Bar
  {
    target: "#wallet-balance",
    content: "Here’s your TrenCoin balance. You’ll use TC to enter matches.",
  },
  {
    target: "#division-badge",
    content: "This badge shows your current division — climb higher by winning!",
  },
  {
    target: "#profile-avatar",
    content: "Click here to access your account and settings.",
  },

  // 🔹 Core Features
  {
    target: "#quick-join",
    content: "Quick Join finds you a match instantly with another player.",
  },
  {
    target: "#matches-grid",
    content: "This grid shows all active matches. Join one or create your own.",
  },
  {
    target: "#trust-badge",
    content: "Trusted players have this badge — they’ve had no disputes.",
  },
  {
    target: "#trenbot-button",
    content: "Ask TrenBot any questions about TrenPlay if you are confused.",
  },
];
