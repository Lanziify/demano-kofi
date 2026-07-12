import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  CreditCard,
  UserPlus,
  UserCheck,
  CalendarDays,
  Boxes,
  ClipboardList,
  AlertTriangle,
  Tag,
  Upload,
  List,
} from 'lucide-react';

export const dashboardMenuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employees',
    path: '/dashboard/employees',
    icon: Users,
    children: [
      {
        title: 'All Employees',
        path: '/dashboard/employees',
        icon: List,
      },
      {
        title: 'Add Employee',
        path: '/dashboard/employees/new',
        icon: UserPlus,
      },
      {
        title: 'Roles & Shifts',
        path: '/dashboard/employees/roles',
        icon: CalendarDays,
      },
      {
        title: 'Attendance',
        path: '/dashboard/employees/attendance',
        icon: UserCheck,
      },
    ],
  },
  {
    title: 'Inventory',
    path: '/dashboard/inventory',
    icon: Package,
    children: [
      {
        title: 'Stock Overview',
        path: '/dashboard/inventory',
        icon: Boxes,
      },
      {
        title: 'Stock Logs',
        path: '/dashboard/inventory/logs',
        icon: ClipboardList,
      },
      {
        title: 'Low Stock Alerts',
        path: '/dashboard/inventory/alerts',
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: 'Products',
    path: '/dashboard/products',
    icon: ShoppingCart,
    children: [
      {
        title: 'All Products',
        path: '/dashboard/products',
        icon: List,
      },
      {
        title: 'Upload Product',
        path: '/dashboard/products/new',
        icon: Upload,
      },
      {
        title: 'Categories',
        path: '/dashboard/products/categories',
        icon: Tag,
      },
    ],
  },
  {
    title: 'Orders',
    path: '/dashboard/orders',
    icon: FileText,
  },
  {
    title: 'Analytics',
    path: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Transactions',
    path: '/dashboard/transactions',
    icon: CreditCard,
  },
] as const;