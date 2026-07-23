import {
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  Palette,
  Globe,
  Key,
  Smartphone,
  Eye,
} from "lucide-react";

const accountMenuItems = [
  { title: "Public profile", path: "/settings/profile", icon: User },
  { title: "Account", path: "/settings/account", icon: Key },
  { title: "Appearance", path: "/settings/appearance", icon: Palette },
  { title: "Notifications", path: "/settings/notifications", icon: Bell },
] as const;

const accessMenuItems = [
  { title: "Password & security", path: "/settings/password", icon: Shield },
  { title: "Sessions", path: "/settings/sessions", icon: Smartphone },
  { title: "Privacy", path: "/settings/privacy", icon: Eye },
] as const;

const businessMenuItems = [
  { title: "Team members", path: "/settings/members", icon: Users },
  { title: "Billing & plans", path: "/settings/billings", icon: CreditCard },
  { title: "Integrations", path: "/settings/integrations", icon: Globe },
] as const;

export const settingsMenuItems = [
  {
    title: "Account",
    children: accountMenuItems,
  },
  {
    title: "Access",
    children: accessMenuItems,
  },
  {
    title: "Business",
    children: businessMenuItems,
  },
] as const;
