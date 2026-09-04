import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: "green" | "gold" | "blue" | "red";
}

const colorMap = {
  green: "bg-brand-green/10 text-brand-green",
  gold: "bg-brand-gold/10 text-brand-gold",
  blue: "bg-blue-500/10 text-blue-400",
  red: "bg-red-500/10 text-red-400",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "green",
}: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs text-brand-green font-medium bg-brand-green/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-500 text-sm mt-1">{title}</div>
    </div>
  );
}
