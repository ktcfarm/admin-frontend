import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Store,
  UserCheck,
  Truck,
  ReceiptText,
  Palette,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Building2,
  ChevronRight as BreadcrumbSeparator
} from 'lucide-react';
import { navConfig } from '../core/config/nav.config.js';
import { ROUTES, useCopy } from '../core/constants/index.js';
import { useAuthStore } from '../core/auth/auth.store.js';
import { useUiStore } from '../core/ui/ui.store.js';
import { usePermission } from '../core/rbac/usePermission.js';
import { useLogout } from '../features/auth/hooks/useAuth.js';
import { SearchBar, Select } from '../shared/components/index.js';
import { cn } from '../shared/utils/cn.js';

const iconMap = {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Store,
  UserCheck,
  Truck,
  ReceiptText,
  Palette
};

function NavItem({ item, label, collapsed }) {
  const isAllowed = usePermission(item.requiredAction);
  if (!isAllowed) {
    return null;
  }

  const IconComponent = iconMap[item.iconName] || LayoutDashboard;

  return (
    <NavLink
      to={item.path}
      end={item.path === ROUTES.DASHBOARD}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors select-none',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-[#FACC15] text-[#0E4B2E] font-semibold shadow-sm'
            : 'text-white/80 hover:bg-[#0A3A23] hover:text-white'
        )
      }
    >
      <IconComponent className="w-5 h-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const copy = useCopy();

  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const staffAssignments = useAuthStore((state) => state.staffAssignments);
  const activeHubId = useAuthStore((state) => state.activeHubId);
  const setActiveHub = useAuthStore((state) => state.setActiveHub);

  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);

  const logoutMutation = useLogout({
    onSettled: () => {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const breadcrumbs = useMemo(() => {
    const pathname = location.pathname;
    const rootLabel = copy.nav.commandCenter;

    if (pathname === ROUTES.DASHBOARD || pathname === '') {
      return [{ label: rootLabel, path: ROUTES.DASHBOARD }];
    }

    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: rootLabel, path: ROUTES.DASHBOARD }];
    let accumulated = '';

    for (const segment of segments) {
      accumulated += `/${segment}`;
      const matchedNav = navConfig.find((item) => item.path === accumulated);
      const label = matchedNav
        ? copy.nav[matchedNav.labelKey] || matchedNav.label
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      crumbs.push({ label, path: accumulated });
    }

    return crumbs;
  }, [location.pathname, copy]);

  const userInitials = useMemo(() => {
    const name = user?.name || user?.fullName || copy.shell.defaultAdminName;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [user, copy]);

  const hubOptions = useMemo(() => {
    if (!Array.isArray(staffAssignments)) return [];
    return staffAssignments.map((assignment) => {
      const hubId = assignment.hubId || assignment.id;
      const hubName = assignment.hubName || assignment.name || hubId;
      return { value: hubId, label: hubName };
    });
  }, [staffAssignments]);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-ktc-canvas">
      <aside
        className={cn(
          'bg-[#0E4B2E] text-white h-screen flex flex-col shrink-0 transition-all duration-300 z-40 relative',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div
          className={cn(
            'h-16 shrink-0 flex items-center border-b border-[#0A3A23]',
            sidebarCollapsed ? 'justify-center px-2' : 'px-4 justify-start'
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#FACC15] flex items-center justify-center shrink-0 text-[#0E4B2E] font-black text-lg shadow-sm">
              {copy.common.brandInitial}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight leading-none text-white truncate">
                  {copy.common.brandName}
                </span>
                <span className="text-[10px] text-white/60 font-medium tracking-wider uppercase mt-1 truncate">
                  {copy.common.portalShortTagline}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navConfig.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              label={copy.nav[item.labelKey] || item.label}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-[#0A3A23] shrink-0 space-y-2">
          <div
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-lg bg-[#0A3A23]/60 text-xs text-white/80',
              sidebarCollapsed && 'justify-center p-2'
            )}
            title={copy.shell.systemStatusTitle}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white truncate">
                  {copy.shell.operationalStatus}
                </span>
                <span className="text-[10px] text-white/50 truncate">
                  {copy.shell.mandiCoreLive}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? copy.shell.expandSidebar : copy.shell.collapseSidebar}
            aria-label={sidebarCollapsed ? copy.shell.expandSidebar : copy.shell.collapseSidebar}
            className={cn(
              'w-full flex items-center rounded-lg text-xs font-medium text-white/75 hover:bg-[#0A3A23] hover:text-white transition-colors',
              sidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">{copy.shell.collapseSidebar}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 shrink-0 z-30 bg-white border-b border-gray-200 px-6 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                  {idx > 0 && <BreadcrumbSeparator className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                  {isLast ? (
                    <span className="font-semibold text-gray-800 truncate" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <NavLink
                      to={crumb.path}
                      className="hover:text-gray-900 transition-colors truncate"
                    >
                      {crumb.label}
                    </NavLink>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar
              placeholder={copy.shell.searchPlaceholder}
              shortcutHint={copy.shell.shortcutHint}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-colors',
                  language === 'EN'
                    ? 'bg-[#0E4B2E] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('HI')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-colors',
                  language === 'HI'
                    ? 'bg-[#0E4B2E] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                HI
              </button>
            </div>

            {hubOptions.length > 0 && (
              <div className="w-44">
                <Select
                  size="sm"
                  leftIcon={Building2}
                  options={hubOptions}
                  value={activeHubId || ''}
                  placeholder={copy.shell.selectHubPlaceholder}
                  onChange={(e) => setActiveHub(e.target.value)}
                />
              </div>
            )}

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#0E4B2E] text-white font-bold text-xs flex items-center justify-center">
                  {userInitials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">
                    {user?.name || user?.fullName || copy.shell.defaultStaffName}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {activeRole || copy.shell.defaultRoleLabel}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.name || user?.fullName || copy.shell.defaultStaffName}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {user?.email || user?.phone || user?.identifier || copy.shell.defaultStaffEmail}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#0E4B2E]">
                      <ShieldCheck className="w-3 h-3" />
                      {activeRole || copy.shell.defaultRoleLabel}
                    </div>
                  </div>

                  <div className="px-1 py-1">
                    <button
                      type="button"
                      disabled={logoutMutation.isPending}
                      onClick={() => {
                        setProfileOpen(false);
                        logoutMutation.mutate();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {logoutMutation.isPending ? copy.shell.loggingOut : copy.shell.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-ktc-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
