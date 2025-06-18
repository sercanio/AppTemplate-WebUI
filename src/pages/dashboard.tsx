import { useState, useEffect } from "react";
import { Users, Activity, TrendingUp, DollarSign, ShieldCheck, Shield, Key } from "lucide-react";
import {
  StatisticsService,
  type DashboardStatistics,
} from "../services/statisticsService";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Dashboard() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const stats = await StatisticsService.getDashboardStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
        toast.error("Failed to load dashboard statistics");
        // Set fallback statistics
        setStatistics({
          userCount: 0,
          activeSessions: 0,
          growthRate: 0,
          revenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="p-2 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Here's what's happening today.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">{formatNumber(statistics?.userCount || 0)}</h3>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  {statistics?.userTrends && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {statistics.userTrends.totalUsersThisMonth} this month
                    </p>
                  )}
                </>
              )}
            </div>
            <Users className="h-8 w-8 text-steel-blue" />
          </div>
        </div>
        
        {/* Active Sessions Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">{formatNumber(statistics?.activeSessions || 0)}</h3>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                </>
              )}
            </div>
            <Activity className="h-8 w-8 text-yellow-green" />
          </div>
        </div>
        
        {/* Growth Rate Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <h3 className={`text-2xl font-bold ${
                    (statistics?.growthRate || 0) >= 0 ? 'text-yellow-green' : 'text-bittersweet'
                  }`}>
                    {(statistics?.growthRate || 0) >= 0 ? '+' : ''}{statistics?.growthRate || 0}%
                  </h3>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  {statistics?.userTrends && (
                    <p className="text-xs text-muted-foreground mt-1">
                      vs last month ({statistics.userTrends.totalUsersLastMonth})
                    </p>
                  )}
                </>
              )}
            </div>
            <TrendingUp className={`h-8 w-8 ${
              (statistics?.growthRate || 0) >= 0 ? 'text-yellow-green' : 'text-bittersweet'
            }`} />
          </div>
        </div>
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Registration Trends */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium mb-4">Daily Registrations (Last 10 Days)</h3>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : statistics?.userTrends ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total registrations this period: {Object.values(statistics.userTrends.dailyRegistrations).reduce((a, b) => a + b, 0)}
                </span>
                <span className={`font-medium ${
                  statistics.userTrends.growthPercentage >= 0 ? 'text-yellow-green' : 'text-bittersweet'
                }`} 
                title={`Growth: ${statistics.userTrends.growthPercentage}%`}>
                  {statistics.userTrends.growthPercentage >= 0 ? '+' : ''}{statistics.userTrends.growthPercentage}%
                </span>
              </div>
              
              {/* Simple bar chart visualization */}
              <div className="grid grid-cols-10 gap-1 h-20 items-end">
                {Object.entries(statistics.userTrends.dailyRegistrations)
                .slice(0, 10) 
                  .map(([date, count]) => {
                    const maxCount = Math.max(...Object.values(statistics.userTrends!.dailyRegistrations));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div key={date} className="flex flex-col items-center h-full justify-end">
                        <div 
                          className="w-full bg-steel-blue rounded-sm min-h-[2px] transition-all"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${date}: ${count} registrations`}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {date.split('-')[1]}
                        </span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No data available
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium mb-4">System Status</h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-sm font-medium text-yellow-green">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API</span>
                  <span className="text-sm font-medium text-yellow-green">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="text-sm font-medium text-sunglow">
                    Warning
                  </span>
                </div>
                {statistics?.authStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Login Success Rate</span>
                      <span className="text-sm font-medium text-yellow-green">
                        {statistics.authStats.successfulLogins + statistics.authStats.failedLogins > 0 
                          ? Math.round((statistics.authStats.successfulLogins / 
                            (statistics.authStats.successfulLogins + statistics.authStats.failedLogins)) * 100)
                          : 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">2FA Adoption</span>
                      <span className={`text-sm font-medium ${
                        statistics.authStats.twoFactorEnabled > 0 ? 'text-yellow-green' : 'text-sunglow'
                      }`}>
                        {statistics.authStats.twoFactorEnabled}/{statistics.userCount} users
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Additional Security Metrics */}
      {!loading && statistics?.authStats && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-steel-blue" />
                Authentication Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Successful Logins:</span>
                  <span className="font-medium text-yellow-green">{statistics.authStats.successfulLogins}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Failed Attempts:</span>
                  <span className="font-medium text-bittersweet">{statistics.authStats.failedLogins}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Sessions:</span>
                  <span className="font-medium">{statistics.authStats.activeSessions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-yellow-green" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">2FA Enabled:</span>
                  <span className="font-medium">{statistics.authStats.twoFactorEnabled} users</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Authenticator Apps:</span>
                  <span className="font-medium">{statistics.authStats.totalUsersWithAuthenticator} users</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security Score:</span>
                  <span className={`font-medium ${
                    statistics.authStats.twoFactorEnabled / statistics.userCount > 0.5 ? 'text-yellow-green' : 'text-sunglow'
                  }`}>
                    {statistics.userCount > 0 
                      ? Math.round((statistics.authStats.twoFactorEnabled / statistics.userCount) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-sunglow" />
                Session Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Session Rate:</span>
                  <span className="font-medium">
                    {statistics.userCount > 0 
                      ? Math.round((statistics.authStats.activeSessions / statistics.userCount) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peak Sessions:</span>
                  <span className="font-medium">{Math.max(statistics.authStats.activeSessions, 1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-yellow-green">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role & Permission Analytics */}
      {!loading && statistics?.roleStats && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Role & Permission Analytics</h2>
            <p className="text-muted-foreground">
              Overview of roles, permissions, and access distribution in your system
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Roles */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.roleStats.totalRoles}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Active system roles
                </div>
              </CardContent>
            </Card>

            {/* Total Permissions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.roleStats.totalPermissions}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Key className="h-3 w-3" />
                  Available permissions
                </div>
              </CardContent>
            </Card>

            {/* Average Permissions per Role */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Permissions/Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    Object.values(statistics.roleStats.permissionsPerRole).reduce((a, b) => a + b, 0) / 
                    statistics.roleStats.totalRoles
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Permission density
                </div>
              </CardContent>
            </Card>

            {/* Most Permissive Role */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Most Permissive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {Object.entries(statistics.roleStats.permissionsPerRole)
                    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {Object.entries(statistics.roleStats.permissionsPerRole)
                    .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} permissions
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Permissions per Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-steel-blue" />
                  Permissions per Role
                </CardTitle>
                <CardDescription>
                  Number of permissions assigned to each role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statistics.roleStats.permissionsPerRole)
                    .sort(([,a], [,b]) => b - a)
                    .map(([role, count]) => {
                      const percentage = (count / statistics.roleStats!.totalPermissions) * 100;
                      return (
                        <div key={role} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{role}</span>
                            <span className="text-muted-foreground">{count} permissions</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-steel-blue h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Users per Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-green" />
                  Users per Role
                </CardTitle>
                <CardDescription>
                  Distribution of users across different roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statistics.roleStats.usersPerRole)
                    .sort(([,a], [,b]) => b - a)
                    .map(([role, count]) => {
                      const totalUsers = Object.values(statistics.roleStats!.usersPerRole).reduce((a, b) => a + b, 0);
                      const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                      return (
                        <div key={role} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{role}</span>
                            <span className="text-muted-foreground">{count} users</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-yellow-green h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions by Feature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-sunglow" />
                Permissions by Feature
              </CardTitle>
              <CardDescription>
                Breakdown of permissions organized by system features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(statistics.roleStats.permissionsByFeature)
                  .sort(([,a], [,b]) => b - a)
                  .map(([feature, count]) => (
                    <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-sunglow/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-sunglow capitalize">
                            {feature.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium capitalize">{feature}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
