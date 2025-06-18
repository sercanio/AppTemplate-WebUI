import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { 
  Shield, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Key,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Switch } from "../../components/ui/switch";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  RolesManagementService,
  type Role,
  type Permission,
} from "../services/rolesManagementService";

interface PermissionsByFeature {
  [feature: string]: Permission[];
}

export default function RolesManagement() {
  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  
  // Form states
  const [newRoleName, setNewRoleName] = useState("");
  const [editRoleName, setEditRoleName] = useState("");
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Search state
  const [permissionSearch, setPermissionSearch] = useState("");

  // Load roles and permissions on mount
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        RolesManagementService.getRoles(0, 100),
        RolesManagementService.getAllPermissions()
      ]);
      
      setRoles(rolesData.items);
      setAllPermissions(permissionsData.items);
      
      // Select first role if available
      if (rolesData.items.length > 0) {
        handleRoleSelect(rolesData.items[0]);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast.error("Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleRoleSelect = async (role: Role) => {
    try {
      setSelectedRole(role);
      setPermissionsLoading(true);
      const permissions = await RolesManagementService.getRolePermissions(role.id);
      setRolePermissions(permissions);
    } catch (error) {
      console.error("Failed to load role permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handlePermissionToggle = async (permission: Permission, isGranted: boolean) => {
    if (!selectedRole) return;
    
    try {
      setUpdatingPermission(permission.id);
      await RolesManagementService.updateRolePermission(selectedRole.id, {
        permissionId: permission.id,
        operation: isGranted ? "Add" : "Remove"
      });
      
      // Update local state - use the full permission object with name
      if (isGranted) {
        setRolePermissions(prev => [...prev, permission]);
      } else {
        setRolePermissions(prev => prev.filter(p => p.name !== permission.name));
      }
      
      toast.success("Permission updated successfully");
    } catch (error) {
      console.error("Failed to update permission:", error);
      toast.error("Failed to update permission");
    } finally {
      setUpdatingPermission(null);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setCreating(true);
      const newRole = await RolesManagementService.createRole({ name: newRoleName });
      setRoles(prev => [...prev, newRole]);
      setNewRoleName("");
      setIsCreateModalOpen(false);
      toast.success("Role created successfully");
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error("Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  const handleEditRole = async () => {
    if (!roleToEdit || !editRoleName.trim()) return;

    try {
      setUpdating(true);
      const updatedRole = await RolesManagementService.updateRole(roleToEdit.id, { name: editRoleName });
      setRoles(prev => prev.map(role => role.id === roleToEdit.id ? updatedRole : role));
      if (selectedRole?.id === roleToEdit.id) {
        setSelectedRole(updatedRole);
      }
      setIsEditModalOpen(false);
      setRoleToEdit(null);
      setEditRoleName("");
      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      setDeleting(true);
      await RolesManagementService.deleteRole(roleToDelete.id);
      setRoles(prev => prev.filter(role => role.id !== roleToDelete.id));
      if (selectedRole?.id === roleToDelete.id) {
        setSelectedRole(null);
        setRolePermissions([]);
      }
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  // Group permissions by feature
  const permissionsByFeature: PermissionsByFeature = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.feature]) {
      acc[permission.feature] = [];
    }
    acc[permission.feature].push(permission);
    return acc;
  }, {} as PermissionsByFeature);

  // Filter permissions based on search
  const filteredPermissionsByFeature = Object.entries(permissionsByFeature).reduce((acc, [feature, permissions]) => {
    const filteredPermissions = permissions.filter(permission =>
      permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      feature.toLowerCase().includes(permissionSearch.toLowerCase())
    );
    if (filteredPermissions.length > 0) {
      acc[feature] = filteredPermissions;
    }
    return acc;
  }, {} as PermissionsByFeature);

  const isPermissionGranted = (permissionName: string) => {
    return rolePermissions?.some(p => p.name === permissionName) || false;
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-8 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage roles and permissions in the system</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedRole?.id === role.id ? 'bg-muted border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{role.name}</p>
                      {role.userCount !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {role.userCount} users assigned
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleToEdit(role);
                          setEditRoleName(role.name);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleToDelete(role);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {selectedRole 
                ? `Permissions for ${selectedRole.name}`
                : "Select a role to manage permissions"
              }
            </CardTitle>
            {selectedRole && (
              <CardDescription>
                Manage permissions for the selected role
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedRole ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a role from the list to manage its permissions</p>
              </div>
            ) : permissionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-8 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Permissions by Feature */}
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {Object.entries(filteredPermissionsByFeature).map(([feature, permissions]) => (
                    <div key={feature} className="space-y-3">
                      <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {feature.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {feature}
                        <Badge variant="secondary" className="ml-auto">
                          {permissions.filter(p => isPermissionGranted(p.name)).length}/{permissions.length}
                        </Badge>
                      </h3>
                      <div className="space-y-2 pl-8">
                        {permissions.map((permission) => {
                          const isGranted = isPermissionGranted(permission.name);
                          return (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{permission.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {updatingPermission === permission.id && (
                                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                )}
                                <Switch
                                  checked={isGranted}
                                  onCheckedChange={(checked) => handlePermissionToggle(permission, checked)}
                                  disabled={updatingPermission === permission.id}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Role Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Enter a name for the new role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Enter role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewRoleName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the role name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Enter role name"
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                setRoleToEdit(null);
                setEditRoleName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRole} disabled={updating}>
              {updating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRole}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
