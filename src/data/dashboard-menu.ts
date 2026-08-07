import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  List,
  Package,
  ShoppingCart,
  Tag,
  Upload,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

export const dashboardMenuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employees',
    path: '/employees',
    icon: Users,
    children: [
      {
        title: 'All Employees',
        path: '/employees',
        icon: List,
      },
      {
        title: 'Add Employee',
        path: '/employees/new',
        icon: UserPlus,
      },
      {
        title: 'Roles & Shifts',
        path: '/employees/roles',
        icon: CalendarDays,
      },
      {
        title: 'Attendance',
        path: '/employees/attendance',
        icon: UserCheck,
      },
    ],
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: Package,
    children: [
      {
        title: 'Stock Overview',
        path: '/inventory',
        icon: Boxes,
      },
      {
        title: 'Stock Logs',
        path: '/inventory/logs',
        icon: ClipboardList,
      },
      {
        title: 'Low Stock Alerts',
        path: '/inventory/alerts',
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: 'Products',
    path: '/products',
    icon: ShoppingCart,
    children: [
      {
        title: 'All Products',
        path: '/products',
        icon: List,
      },
      {
        title: 'Upload Product',
        path: '/products/new',
        icon: Upload,
      },
      {
        title: 'Categories',
        path: '/products/categories',
        icon: Tag,
      },
    ],
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: FileText,
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Transactions',
    path: '/transactions',
    icon: CreditCard,
  },
] as const;
