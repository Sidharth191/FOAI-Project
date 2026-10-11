import React from "react";
import Settings from "../../screens/Settings/Settings.jsx";

export default function SettingsPlaceholder({ profile, onApplyProfile, onBack }) {
  return <Settings profile={profile} onApplyProfile={onApplyProfile} onBack={onBack} />;
}
