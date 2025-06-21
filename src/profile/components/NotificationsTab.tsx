import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Loader2 } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

export function NotificationsTab() {
  const { state, updateNotificationSettings, handleNotificationUpdate } =
    useProfile();
  const { isSaving, notificationSettings } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleNotificationUpdate(e);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({ emailNotifications: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">In-App Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the application
                </p>
              </div>
              <Switch
                checked={notificationSettings.inAppNotifications}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({ inAppNotifications: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) =>
                  updateNotificationSettings({ pushNotifications: checked })
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-8 bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
