import { create } from 'zustand';
import { themedToast } from '../../lib/toast';
import {
  UserManagementService,
  type User,
  type Role,
  type UpdateUserRolesRequest,
  type DynamicQuery,
} from '../services/usersManagementService';
import { RolesManagementService } from '../../roles/services/rolesManagementService';

interface PaginatedUsers {
  items: User[];
  totalPages: number;
  totalCount: number;
}

interface UsersState {
  // Data state
  users: User[];
  availableRoles: Role[];
  selectedUser: User | null;
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  
  // UI state
  isLoading: boolean;
  isSearching: boolean;
  isEditModalOpen: boolean;
  error: string | null;
  updatingRoles: Set<string>;
  
  // Filter state
  searchTerm: string;
  selectedRole: string;
  sortField: 'username' | 'role' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  
  // Actions
  loadUsers: () => Promise<void>;
  loadAvailableRoles: () => Promise<void>;
  searchUsers: (term: string) => Promise<void>;
  filterByRole: (roleId: string) => void;
  sortUsers: (field: 'username' | 'role' | 'createdAt') => void;
  updateUserRoles: (userId: string, updateData: UpdateUserRolesRequest) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setSelectedUser: (user: User | null) => void;
  setEditModalOpen: (open: boolean) => void;
  setSearchTerm: (term: string) => void;
  refreshUsers: () => Promise<void>;
  isRoleUpdating: (roleId: string) => boolean;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  // Initial state
  users: [],
  availableRoles: [],
  selectedUser: null,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalCount: 0,
  isLoading: false,
  isSearching: false,
  isEditModalOpen: false,
  error: null,
  updatingRoles: new Set(),
  searchTerm: '',
  selectedRole: '',
  sortField: 'username',
  sortDirection: 'asc',

  loadAvailableRoles: async () => {
    try {
      const rolesData = await RolesManagementService.getRoles(0, 100);
      set({ availableRoles: rolesData.items });
    } catch (error) {
      console.error('Failed to load roles:', error);
      set({ error: 'Failed to load roles' });
      themedToast.error('Failed to load available roles');
      throw error;
    }
  },

  loadUsers: async () => {
    const { 
      currentPage, 
      pageSize, 
      searchTerm, 
      selectedRole, 
      sortField, 
      sortDirection 
    } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      let usersData: PaginatedUsers;

      if (selectedRole && selectedRole !== '') {
        usersData = await UserManagementService.getUsersByRole(
          selectedRole,
          currentPage,
          pageSize
        );
      } else if (
        searchTerm ||
        sortField !== 'username' ||
        sortDirection !== 'asc'
      ) {
        let filter = undefined;

        if (searchTerm) {
          filter = {
            field: 'IdentityUser.UserName',
            operator: 'contains' as const,
            value: searchTerm,
            isCaseSensitive: false,
          };
        }

        const sort = searchTerm
          ? undefined
          : [
              {
                field:
                  sortField === 'username'
                    ? 'IdentityUser.UserName'
                    : sortField,
                dir: sortDirection,
              },
            ];

        const query: DynamicQuery = { sort, filter };
        usersData = await UserManagementService.getUsersWithQuery(
          query,
          currentPage,
          pageSize
        );
      } else {
        usersData = await UserManagementService.getUsers(currentPage, pageSize);
      }

      set({
        users: usersData.items,
        totalPages: usersData.totalPages,
        totalCount: usersData.totalCount,
        isLoading: false,
      });

      // Only show success toast for explicit user actions, not automatic loads
      if (searchTerm || selectedRole) {
        themedToast.success(`Found ${usersData.totalCount} users`);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      set({ 
        isLoading: false, 
        error: 'Failed to load users' 
      });
      themedToast.error('Failed to load users');
      throw error;
    }
  },

  searchUsers: async (term: string) => {
    set({ 
      searchTerm: term, 
      isSearching: true,
      currentPage: 0,
      selectedRole: ''
    });
    
    try {
      await get().loadUsers();
      if (term) {
        themedToast.success(`Search completed for "${term}"`);
      } else {
        themedToast.success('Search cleared, showing all users');
      }
    } catch (error) {
      themedToast.error('Search failed');
      throw error;
    } finally {
      set({ isSearching: false });
    }
  },

  filterByRole: (roleId: string) => {
    const { availableRoles } = get();
    const roleName = roleId === 'all' 
      ? 'All Users' 
      : availableRoles.find(r => r.id === roleId)?.name || 'Unknown Role';
    
    set({ 
      selectedRole: roleId === 'all' ? '' : roleId,
      currentPage: 0 
    });
    
    get().loadUsers();
    themedToast.success(`Filtering by: ${roleName}`);
  },

  sortUsers: (field: 'username' | 'role' | 'createdAt') => {
    const { sortField, sortDirection } = get();
    
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    
    set({ 
      sortField: field, 
      sortDirection: newDirection,
      currentPage: 0 
    });
    
    get().loadUsers();
    themedToast.success(`Sorted by ${field} (${newDirection})`);
  },

  updateUserRoles: async (userId: string, updateData: UpdateUserRolesRequest) => {
    const { selectedUser, availableRoles } = get();
    if (!selectedUser) return;

    const role = availableRoles.find(r => r.id === updateData.roleId);
    if (!role) {
      themedToast.error('Role not found');
      return;
    }

    const isGranting = updateData.operation === 'Add';
    
    // Add role to updating set
    set(state => ({
      updatingRoles: new Set([...state.updatingRoles, updateData.roleId])
    }));

    try {
      await UserManagementService.updateUserRoles(userId, updateData);

      // Update the selected user's roles
      const updatedRoles = isGranting
        ? [...(selectedUser.roles || []), role]
        : (selectedUser.roles || []).filter(userRole => userRole.id !== updateData.roleId);

      const updatedUser = {
        ...selectedUser,
        roles: updatedRoles,
      };

      set({ selectedUser: updatedUser });

      // Update the user in the list
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? updatedUser : user
        )
      }));

      themedToast.success(
        isGranting 
          ? `"${role.name}" role assigned to ${selectedUser.userName || 'user'}` 
          : `"${role.name}" role removed from ${selectedUser.userName || 'user'}`
      );
    } catch (error) {
      console.error('Failed to update user role:', error);
      themedToast.error(
        isGranting 
          ? `Failed to assign "${role.name}" role` 
          : `Failed to remove "${role.name}" role`
      );
      throw error;
    } finally {
      // Remove role from updating set
      set(state => {
        const newUpdatingRoles = new Set(state.updatingRoles);
        newUpdatingRoles.delete(updateData.roleId);
        return { updatingRoles: newUpdatingRoles };
      });
    }
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().loadUsers();
    themedToast.success(`Navigated to page ${page + 1}`);
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  setEditModalOpen: (open: boolean) => {
    set({ isEditModalOpen: open });
    if (!open) {
      set({ selectedUser: null });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  refreshUsers: async () => {
    try {
      await get().loadUsers();
      themedToast.success('Users list refreshed successfully');
    } catch (error) {
      themedToast.error('Failed to refresh users list');
      throw error;
    }
  },

  isRoleUpdating: (roleId: string) => {
    return get().updatingRoles.has(roleId);
  },
}));