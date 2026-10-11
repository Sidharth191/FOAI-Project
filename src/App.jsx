import { SCREENS, useKairos } from "./state/useKairos.js";
import WelcomePlaceholder from "./components/placeholders/WelcomePlaceholder.jsx";
import SurveyPlaceholder from "./components/placeholders/SurveyPlaceholder.jsx";
import ProcessingPlaceholder from "./components/placeholders/ProcessingPlaceholder.jsx";
import ProfileConfirmationPlaceholder from "./components/placeholders/ProfileConfirmationPlaceholder.jsx";
import SettingsPlaceholder from "./components/placeholders/SettingsPlaceholder.jsx";
import Homepage from "./screens/Homepage/Homepage.jsx";

export default function App() {
  const {
    screen,
    setScreen,
    profile,
    reading,
    insights,
    status,
    completeSurvey,
    confirmProfile,
    applyProfile,
    refresh,
  } = useKairos();

  switch (screen) {
    case SCREENS.WELCOME:
      return <WelcomePlaceholder onStart={() => setScreen(SCREENS.SURVEY)} />;
    case SCREENS.SURVEY:
      return <SurveyPlaceholder onComplete={completeSurvey} />;
    case SCREENS.PROCESSING:
      return <ProcessingPlaceholder />;
    case SCREENS.CONFIRM:
      return (
        <ProfileConfirmationPlaceholder
          onConfirm={confirmProfile}
          onBack={() => setScreen(SCREENS.SURVEY)}
        />
      );
    case SCREENS.HOMEPAGE:
      return (
        <Homepage
          profile={profile}
          reading={reading}
          insights={insights}
          status={status}
          onRefresh={refresh}
          onOpenSettings={() => setScreen(SCREENS.SETTINGS)}
        />
      );
    case SCREENS.SETTINGS:
      return (
        <SettingsPlaceholder
          profile={profile}
          onApplyProfile={applyProfile}
          onBack={() => setScreen(SCREENS.HOMEPAGE)}
        />
      );
    default:
      return <WelcomePlaceholder onStart={() => setScreen(SCREENS.SURVEY)} />;
  }
}
