import { TabsList, TabsTrigger } from "../../components/ui/tabs";
import { User, Shield, Bell, Settings } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

export function ProfileTabs() {
  const { setActiveTab } = useProfile();

  return (
    <TabsList className="grid w-full grid-cols-4 mb-6">
      <TabsTrigger
        value="profile"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("profile")}
      >
        <User className="h-4 w-4" />
        Profile
      </TabsTrigger>
      <TabsTrigger
        value="security"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("security")}
      >
        <Shield className="h-4 w-4" />
        Security
      </TabsTrigger>
      <TabsTrigger
        value="notifications"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("notifications")}
      >
        <Bell className="h-4 w-4" />
        Notifications
      </TabsTrigger>
      <TabsTrigger
        value="settings"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("settings")}
      >
        <Settings className="h-4 w-4" />
        Settings
      </TabsTrigger>
    </TabsList>
  );
}
