import { create } from 'zustand';
import { themedToast } from '../../lib/toast';
import {
  RolesManagementService,
  type Role,
  type Permission,
} from '../services/rolesManagementService';

interface PermissionsByFeature {
  [feature: string]: Permission[];
}

interface CreateRoleRequest {
  name: string;
}

interface UpdateRoleRequest {
  name: string;
}

interface UpdateRolePermissionRequest {
  permissionId: string;
  operation: "Add" | "Remove";
}

interface RolesState {
  // Data state
  roles: Role[];
  allPermissions: Permission[];
  rolePermissions: Permission[];
  selectedRole: Role | null;
  
  // UI state
  isLoading: boolean;
  isPermissionsLoading: boolean;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  
  // Form state
  newRoleName: string;
  editRoleName: string;
  roleToEdit: Role | null;
  roleToDelete: Role | null;
  
  // Loading states for operations
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  updatingPermissions: Set<string>;
  
  // Search state
  permissionSearch: string;
  
  // Actions
  loadInitialData: () => Promise<void>;
  handleRoleSelect: (role: Role, showToast?: boolean) => Promise<void>;
  handlePermissionToggle: (permission: Permission, isGranted: boolean) => Promise<void>;
  handleCreateRole: () => Promise<void>;
  handleEditRole: () => Promise<void>;
  handleDeleteRole: () => Promise<void>;
  
  // UI Actions
  setCreateModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setNewRoleName: (name: string) => void;
  setEditRoleName: (name: string) => void;
  setRoleToEdit: (role: Role | null) => void;
  setRoleToDelete: (role: Role | null) => void;
  setPermissionSearch: (search: string) => void;
  
  // Computed
  isPermissionGranted: (permissionName: string) => boolean;
  getFilteredPermissionsByFeature: () => PermissionsByFeature;
  isPermissionUpdating: (permissionId: string) => boolean;
}

export const useRolesStore = create<RolesState>()((set, get) => ({
  // Initial state
  roles: [],
  allPermissions: [],
  rolePermissions: [],
  selectedRole: null,
  isLoading: true,
  isPermissionsLoading: false,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteDialogOpen: false,
  newRoleName: '',
  editRoleName: '',
  roleToEdit: null,
  roleToDelete: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  updatingPermissions: new Set(),
  permissionSearch: '',

  loadInitialData: async () => {
    try {
      set({ isLoading: true });
      const [rolesData, permissionsData] = await Promise.all([
        RolesManagementService.getRoles(0, 100),
        RolesManagementService.getAllPermissions()
      ]);
      
      set({
        roles: rolesData.items,
        allPermissions: permissionsData.items,
        isLoading: false
      });
      
      // Select first role if available (without showing toast)
      if (rolesData.items.length > 0) {
        await get().handleRoleSelect(rolesData.items[0], false);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      set({ isLoading: false });
      themedToast.error('Failed to load roles and permissions');
      throw error;
    }
  },

  handleRoleSelect: async (role: Role, showToast: boolean = true) => {
    try {
      set({ selectedRole: role, isPermissionsLoading: true });
      const permissions = await RolesManagementService.getRolePermissions(role.id);
      set({ rolePermissions: permissions, isPermissionsLoading: false });
      
      if (showToast) {
        themedToast.success(`Loaded permissions for ${role.name}`);
      }
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      set({ isPermissionsLoading: false });
      themedToast.error('Failed to load role permissions');
      throw error;
    }
  },

  handlePermissionToggle: async (permission: Permission, isGranted: boolean) => {
    const { selectedRole, rolePermissions } = get();
    if (!selectedRole) return;
    
    // Add permission to updating set
    set(state => ({
      updatingPermissions: new Set([...state.updatingPermissions, permission.id])
    }));

    try {
      const updateData: UpdateRolePermissionRequest = {
        permissionId: permission.id,
        operation: isGranted ? "Add" : "Remove"
      };

      await RolesManagementService.updateRolePermission(selectedRole.id, updateData);
      
      // Update local state
      if (isGranted) {
        set({ rolePermissions: [...rolePermissions, permission] });
        themedToast.success(`Permission granted: "${permission.name}" added to ${selectedRole.name}`);
      } else {
        set({ 
          rolePermissions: rolePermissions.filter(p => p.name !== permission.name) 
        });
        themedToast.success(`Permission revoked: "${permission.name}" removed from ${selectedRole.name}`);
      }
    } catch (error) {
      console.error('Failed to update permission:', error);
      themedToast.error('Failed to update permission');
      throw error;
    } finally {
      // Remove permission from updating set
      set(state => {
        const newUpdatingPermissions = new Set(state.updatingPermissions);
        newUpdatingPermissions.delete(permission.id);
        return { updatingPermissions: newUpdatingPermissions };
      });
    }
  },

  handleCreateRole: async () => {
    const { newRoleName } = get();
    
    if (!newRoleName.trim()) {
      themedToast.error('Role name is required');
      return;
    }

    try {
      set({ isCreating: true });
      
      const createData: CreateRoleRequest = { name: newRoleName };
      const newRole = await RolesManagementService.createRole(createData);
      
      set(state => ({
        roles: [...state.roles, newRole],
        newRoleName: '',
        isCreateModalOpen: false,
        isCreating: false
      }));
      
      themedToast.success(`Role "${newRole.name}" created successfully`);
    } catch (error) {
      console.error('Failed to create role:', error);
      set({ isCreating: false });
      themedToast.error('Failed to create role');
      throw error;
    }
  },

  handleEditRole: async () => {
    const { roleToEdit, editRoleName } = get();
    if (!roleToEdit || !editRoleName.trim()) return;

    const originalName = roleToEdit.name;
    
    try {
      set({ isUpdating: true });
      
      const updateData: UpdateRoleRequest = { name: editRoleName };
      const updatedRole = await RolesManagementService.updateRole(roleToEdit.id, updateData);
      
      set(state => ({
        roles: state.roles.map(role => role.id === roleToEdit.id ? updatedRole : role),
        selectedRole: state.selectedRole?.id === roleToEdit.id ? updatedRole : state.selectedRole,
        isEditModalOpen: false,
        roleToEdit: null,
        editRoleName: '',
        isUpdating: false
      }));
      
      themedToast.success(`Role updated: "${originalName}" renamed to "${updatedRole.name}"`);
    } catch (error) {
      console.error('Failed to update role:', error);
      set({ isUpdating: false });
      themedToast.error('Failed to update role');
      throw error;
    }
  },

  handleDeleteRole: async () => {
    const { roleToDelete, selectedRole } = get();
    if (!roleToDelete) return;

    const deletedRoleName = roleToDelete.name;
    
    try {
      set({ isDeleting: true });
      
      await RolesManagementService.deleteRole(roleToDelete.id);
      
      set(state => ({
        roles: state.roles.filter(role => role.id !== roleToDelete.id),
        selectedRole: selectedRole?.id === roleToDelete.id ? null : selectedRole,
        rolePermissions: selectedRole?.id === roleToDelete.id ? [] : state.rolePermissions,
        isDeleteDialogOpen: false,
        roleToDelete: null,
        isDeleting: false
      }));
      
      themedToast.success(`Role "${deletedRoleName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete role:', error);
      set({ isDeleting: false });
      themedToast.error('Failed to delete role');
      throw error;
    }
  },

  // UI Actions
  setCreateModalOpen: (open: boolean) => {
    set({ isCreateModalOpen: open });
    if (!open) {
      set({ newRoleName: '' });
    }
  },

  setEditModalOpen: (open: boolean) => {
    set({ isEditModalOpen: open });
    if (!open) {
      set({ roleToEdit: null, editRoleName: '' });
    }
  },

  setDeleteDialogOpen: (open: boolean) => {
    set({ isDeleteDialogOpen: open });
    if (!open) {
      set({ roleToDelete: null });
    }
  },

  setNewRoleName: (name: string) => set({ newRoleName: name }),
  setEditRoleName: (name: string) => set({ editRoleName: name }),
  setRoleToEdit: (role: Role | null) => set({ roleToEdit: role }),
  setRoleToDelete: (role: Role | null) => set({ roleToDelete: role }),
  setPermissionSearch: (search: string) => set({ permissionSearch: search }),

  // Computed functions
  isPermissionGranted: (permissionName: string) => {
    const { rolePermissions } = get();
    return rolePermissions?.some(p => p.name === permissionName) || false;
  },

  getFilteredPermissionsByFeature: () => {
    const { allPermissions, permissionSearch } = get();
    
    // Group permissions by feature
    const permissionsByFeature: PermissionsByFeature = allPermissions.reduce((acc, permission) => {
      if (!acc[permission.feature]) {
        acc[permission.feature] = [];
      }
      acc[permission.feature].push(permission);
      return acc;
    }, {} as PermissionsByFeature);

    // Filter permissions based on search
    if (!permissionSearch) return permissionsByFeature;

    return Object.entries(permissionsByFeature).reduce((acc, [feature, permissions]) => {
      const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
        feature.toLowerCase().includes(permissionSearch.toLowerCase())
      );
      if (filteredPermissions.length > 0) {
        acc[feature] = filteredPermissions;
      }
      return acc;
    }, {} as PermissionsByFeature);
  },

  isPermissionUpdating: (permissionId: string) => {
    return get().updatingPermissions.has(permissionId);
  },
}));