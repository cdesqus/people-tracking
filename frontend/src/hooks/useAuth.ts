import { useAppDispatch, useAppSelector } from '@store/store';
import { setUser, logout, setAuthError, clearError } from '@store/slices/authSlice';
import { User } from '@types/index';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  const handleSetUser = (userData: User) => {
    dispatch(setUser(userData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSetError = (errorMsg: string | null) => {
    dispatch(setAuthError(errorMsg));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // Check if user has a specific role
  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (typeof role === 'string') {
      return user.role === role;
    }
    return role.includes(user.role);
  };

  // Check if user has permission (for fine-grained access control)
  const hasPermission = (permission: string) => {
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      admin: [
        'view:all',
        'edit:all',
        'delete:all',
        'manage:users',
        'manage:settings',
        'view:reports',
      ],
      manager: [
        'view:all',
        'edit:employees',
        'edit:visitors',
        'view:reports',
      ],
      operator: [
        'view:cameras',
        'view:alerts',
        'edit:alerts',
        'view:detections',
      ],
      security: [
        'view:cameras',
        'view:alerts',
        'view:detections',
        'view:timeline',
      ],
      receptionist: [
        'manage:visitors',
        'manage:employees',
        'view:badges',
        'print:badges',
      ],
      viewer: ['view:dashboard', 'view:reports'],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser: handleSetUser,
    logout: handleLogout,
    setError: handleSetError,
    clearError: handleClearError,
    hasRole,
    hasPermission,
  };
};
