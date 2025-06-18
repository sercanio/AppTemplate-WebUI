import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Users,
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton";
import {
  UserManagementService,
  type User,
  type Role,
} from "../services/usersManagementService";
import { RolesManagementService } from "../../roles/services/rolesManagementService";

type SearchField = "username";
type SortField = "username" | "role" | "createdAt";
type SortDirection = "asc" | "desc";

interface UserWithSelection extends User {
  isSelected?: boolean;
}

export default function UsersManagement() {
  // State management
  const [users, setUsers] = useState<UserWithSelection[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField] = useState<SearchField>("username");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("username");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await RolesManagementService.getRoles(0, 100);
        setAvailableRoles(rolesData.items);
      } catch (error) {
        console.error("Failed to load roles:", error);
        toast.error("Failed to load roles");
      }
    };

    loadRoles();
  }, []);

  // Load users with current filters
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      let usersData;

      if (selectedRole && selectedRole !== "") {
        // Use the dedicated role endpoint when filtering by role only
        usersData = await UserManagementService.getUsersByRole(
          selectedRole,
          currentPage,
          pageSize
        );
      } else if (
        searchTerm ||
        sortField !== "username" ||
        sortDirection !== "asc"
      ) {
        // Use dynamic query for search terms or any custom sorting
        let filter = undefined;

        if (searchTerm) {
          filter = {
            field: "IdentityUser.UserName",
            operator: "contains",
            value: searchTerm,
            isCaseSensitive: false,
          };
        }

        const sort = searchTerm
          ? undefined
          : [
              {
                field:
                  sortField === "username"
                    ? "IdentityUser.UserName"
                    : sortField,
                dir: sortDirection as "asc" | "desc",
              },
            ];

        usersData = await UserManagementService.getUsersWithQuery(
          { sort, filter },
          currentPage,
          pageSize
        );
      } else {
        // Default: get all users with default sorting
        usersData = await UserManagementService.getUsers(currentPage, pageSize);
      }

      setUsers(usersData.items.map((user) => ({ ...user, isSelected: false })));
      setTotalPages(usersData.totalPages);
      setTotalCount(usersData.totalCount);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedRole,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  ]);

  // Load users on mount and when dependencies change (excluding search)
  useEffect(() => {
    if (!searchTerm) {
      loadUsers();
    }
  }, [
    selectedRole,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    loadUsers,
    searchTerm,
  ]);

  // Search handler with proper debouncing
  useEffect(() => {
    if (searchTerm) {
      setSearching(true);
      // Reset role filter when searching
      setSelectedRole("");
      const debounceTimer = setTimeout(() => {
        setCurrentPage(0);
        loadUsers().finally(() => setSearching(false));
      }, 800);

      return () => {
        clearTimeout(debounceTimer);
      };
    } else {
      // Clear search immediately when term is empty
      setSearching(false);
      setCurrentPage(0);
      loadUsers();
    }
  }, [searchTerm, searchField, loadUsers]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(0);
  };

  // Handle role filtering
  const handleRoleFilter = (roleId: string) => {
    setSelectedRole(roleId === "all" ? "" : roleId);
    setCurrentPage(0);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle user editing
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleRoleToggle = async (roleId: string, isGranted: boolean) => {
    if (!selectedUser) return;

    try {
      const updateData = {
        operation: isGranted ? "Add" : ("Remove" as "Add" | "Remove"),
        roleId: roleId,
      };

      await UserManagementService.updateUserRoles(selectedUser.id, updateData);

      // Since API only returns roleId and userId, manually update the roles
      const updatedRoles = isGranted
        ? [
            ...(selectedUser.roles || []),
            availableRoles.find((r) => r.id === roleId)!,
          ]
        : (selectedUser.roles || []).filter((role) => role.id !== roleId);

      const updatedUser = {
        ...selectedUser,
        roles: updatedRoles,
      };

      setSelectedUser(updatedUser);

      // Update the user in the list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...updatedUser, isSelected: user.isSelected }
            : user
        )
      );

      toast.success(
        isGranted ? "Role added successfully" : "Role removed successfully"
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role", {
        description:
          "There was an error updating the user's role. Please try again.",
      });
    }
  };

  // Get role icon
  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return <ShieldCheck className="h-3 w-3" />;
      case "moderator":
        return <Shield className="h-3 w-3" />;
      default:
        return <UserCheck className="h-3 w-3" />;
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="p-2 md:p-6 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage users and their roles in the system
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-2 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-start md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-0 top-1/2 ml-auto transform -translate-y-1/2 h-4 w-8 
                           text-muted-foreground"
              />
              <Input
                placeholder="Search users by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 md:pl-10"
              />
              {searching && (
                <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Role Filter */}
            <Select
              value={selectedRole || "all"}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {totalCount} Users
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="border rounded-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center">
                      Username
                      {renderSortIndicator("username")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Roles
                      {renderSortIndicator("role")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Joined
                      {renderSortIndicator("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt={user.userName || "No Username"}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {user.userName || "No Username"}
                            </p>
                            {!user.mailConfirmed && (
                              <p className="text-xs text-bittersweet">
                                Email not verified
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getRoleIcon(role.name)}
                              <span className="ml-1">{role.name}</span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-xs text-muted-foreground">
                            Last login:{" "}
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Total Users Count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Total users: <span className="font-medium">{totalCount}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Manage user roles and permissions
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                {selectedUser.profilePictureUrl ? (
                  <img
                    src={selectedUser.profilePictureUrl}
                    alt={selectedUser.userName || "No Username"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">
                    {selectedUser.userName || "No Username"}
                  </h3>
                </div>
              </div>

              {/* Current Roles */}
              <div>
                <h4 className="font-medium mb-2">Current Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedUser.roles || []).map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {getRoleIcon(role.name)}
                      <span className="ml-1">{role.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Manage Roles */}
              <div>
                <h4 className="font-medium mb-4">Manage Roles</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableRoles
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((role) => {
                      const isGranted = (selectedUser.roles || []).some(
                        (userRole) => userRole.id === role.id
                      );
                      return (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role.name)}
                            <span className="font-medium">{role.name}</span>
                          </div>
                          <Checkbox
                            checked={isGranted}
                            onCheckedChange={(checked) =>
                              handleRoleToggle(role.id, !!checked)
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
