export type NavigationItem = {
  label: string;
  path: string;
  icon: "dashboard" | "work-orders";
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/app/dashboard",
    icon: "dashboard",
  },
  {
    label: "Work Orders",
    path: "/app/work-orders",
    icon: "work-orders",
  },
];