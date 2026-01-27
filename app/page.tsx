"use client";

import { useState } from "react";
import SplashScreen from "@/components/onboarding/SplashScreen";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import PersonalizeChoice from "@/components/onboarding/PersonalizeChoice";
import RegionSelection from "@/components/onboarding/RegionSelection";
import CountryDrilldown from "@/components/onboarding/CountryDrilldown";
import InterestsSelection from "@/components/onboarding/InterestsSelection";
import SuggestedCreators from "@/components/onboarding/SuggestedCreators";
import { useRouter } from "next/navigation";

type Screen =
  | "splash"
  | "welcome"
  | "personalize"
  | "regions"
  | "countries"
  | "interests"
  | "suggested"
  | "home";

export default function Home() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [userPreferences, setUserPreferences] = useState({
    personalize: false,
    regions: [] as string[],
    countries: [] as string[],
    interests: [] as string[],
  });

  // Flow Handlers
  const goNext = (screen: Screen) => setCurrentScreen(screen);

  const handlePersonalizeChoice = (choice: "personalize" | "all") => {
    setUserPreferences((prev) => ({ ...prev, personalize: choice === "personalize" }));
    if (choice === "personalize") {
      goNext("regions");
    } else {
      // Skip personalization steps
      goNext("suggested");
    }
  };

  const handleRegionsNext = (regions: string[]) => {
    setUserPreferences((prev) => ({ ...prev, regions }));
    // Logic: If regions selected, show countries optional? Or just go to interests?
    // Spec says: "Screen 5: Country Drill-down (Optional) - Only shows if user selected a region"
    if (regions.length > 0) {
      goNext("countries");
    } else {
      goNext("interests");
    }
  };

  const handleCountriesNext = (countries: string[]) => {
    setUserPreferences((prev) => ({ ...prev, countries }));
    goNext("interests");
  };

  const handleInterestsNext = (interests: string[]) => {
    setUserPreferences((prev) => ({ ...prev, interests }));
    goNext("suggested");
  };

  // Render Logic
  switch (currentScreen) {
    case "splash":
      return <SplashScreen onFinish={() => goNext("welcome")} />;
    case "welcome":
      return <WelcomeScreen onNext={() => goNext("personalize")} />;
    case "personalize":
      return (
        <PersonalizeChoice
          onBack={() => goNext("welcome")}
          onNext={handlePersonalizeChoice}
        />
      );
    case "regions":
      return (
        <RegionSelection
          onBack={() => goNext("personalize")}
          onNext={handleRegionsNext}
          onSkip={() => goNext("suggested")} // Skip to everything
        />
      );
    case "countries":
      return (
        <CountryDrilldown
          selectedRegionIds={userPreferences.regions}
          onBack={() => goNext("regions")}
          onNext={handleCountriesNext}
        />
      );
    case "interests":
      return (
        <InterestsSelection
          onBack={() =>
            userPreferences.regions.length > 0 ? goNext("countries") : goNext("regions")
          }
          onNext={handleInterestsNext}
          onSkip={() => goNext("suggested")}
        />
      );
    case "suggested":
      return <SuggestedCreators onFinish={() => {
        // In a real app, save preferences here
        router.push("/home");
      }} />;
    case "home":
      return null; // Should redirect
    default:
      return null;
  }
}
