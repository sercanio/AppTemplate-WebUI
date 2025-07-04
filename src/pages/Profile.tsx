import { useAuthStore } from "../auth/store/authStore";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { ProfileProvider } from "../profile/context/profileContext";
import { useProfile } from "../profile/hooks/useProfile";
import { ProfileTabs } from "../profile/components/ProfileTabs";
import { ProfileTab } from "../profile/components/ProfileTab";
import { SecurityTab } from "../profile/components/SecurityTab";
import { NotificationsTab } from "../profile/components/NotificationsTab";
import { SettingsTab } from "../profile/components/SettingsTab";
import { AuthWarning } from "../profile/components/AuthWarning";
import { EmailConfirmationAlert } from "../profile/components/EmailConfirmationAlert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background pb-8">      {!isAuthenticated || !user ? (
        <AuthWarning />
      ) : (
        <>
          {/* Page Header */}
          <div className="container mx-auto px-4 py-6 max-w-5xl">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profilePictureUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-ultra-violet to-bittersweet text-white text-lg">
                  {user?.userName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-steel-blue via-yellow-green to-sunglow bg-clip-text text-transparent mb-2">
                  {user?.userName || "Profile Settings"}
                </h1>
                <p className="text-muted-foreground mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <ProfileProvider user={user}>
              <EmailConfirmationAlert user={user} />
              <ProfileContent />
            </ProfileProvider>
          </div>
        </>
      )}
    </div>
  );
}

// Separate component to access the context
function ProfileContent() {
  const { activeTab } = useProfile();

  return (
    <Tabs value={activeTab} className="w-full">
      <ProfileTabs />
      {/* <StatusMessages /> */}

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}
