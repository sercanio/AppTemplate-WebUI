import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { DangerZone } from "./DangerZone";

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and dangerous actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Additional account settings and preferences will be available here.
          </p>
          <DangerZone />
        </CardContent>
      </Card>
    </div>
  );
}
