import { useEffect } from "react";
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
  Search,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Switch } from "../../components/ui/switch";
import { Skeleton } from "../../components/ui/skeleton";
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
import { useRolesStore } from "../store/rolesStore";
import type { Role } from "../services/rolesManagementService";

export default function RolesManagement() {
  // Store state and actions
  const {
    roles,
    selectedRole,
    isLoading,
    isPermissionsLoading,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    newRoleName,
    editRoleName,
    isCreating,
    isUpdating,
    isDeleting,
    permissionSearch,
    
    // Actions
    loadInitialData,
    handleRoleSelect,
    handlePermissionToggle,
    handleCreateRole,
    handleEditRole,
    handleDeleteRole,
    
    // UI Actions
    setCreateModalOpen,
    setEditModalOpen,
    setDeleteDialogOpen,
    setNewRoleName,
    setEditRoleName,
    setRoleToEdit,
    setRoleToDelete,
    setPermissionSearch,
    
    // Computed
    isPermissionGranted,
    getFilteredPermissionsByFeature,
    isPermissionUpdating,
  } = useRolesStore();

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle role editing
  const handleEditRoleClick = (role: Role) => {
    setRoleToEdit(role);
    setEditRoleName(role.name);
    setEditModalOpen(true);
  };

  const handleDeleteRoleClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const filteredPermissionsByFeature = getFilteredPermissionsByFeature();

  if (isLoading) {
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
        <Button onClick={() => setCreateModalOpen(true)}>
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
                          handleEditRoleClick(role);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoleClick(role);
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
            ) : isPermissionsLoading ? (
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
                          const isUpdating = isPermissionUpdating(permission.id);
                          
                          return (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{permission.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isUpdating && (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                                <Switch
                                  checked={isGranted}
                                  onCheckedChange={(checked) => handlePermissionToggle(permission, checked)}
                                  disabled={isUpdating}
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
      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
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
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
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
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRole} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
