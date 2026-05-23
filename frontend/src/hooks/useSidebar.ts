import { useAppDispatch, useAppSelector } from '@store/store';
import { toggleSidebar, setSidebarOpen } from '@store/slices/uiSlice';

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const toggle = () => {
    dispatch(toggleSidebar());
  };

  const setOpen = (isOpen: boolean) => {
    dispatch(setSidebarOpen(isOpen));
  };

  return {
    sidebarOpen,
    toggle,
    setOpen,
  };
};
