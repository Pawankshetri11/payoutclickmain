import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatCard({ title, value, change, icon: Icon, variant = "default" }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-gradient-to-br from-success/5 to-success/10";
      case "warning":
        return "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10";
      case "destructive":
        return "border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10";
      default:
        return "border-primary/20 bg-gradient-card";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "text-success bg-success/10";
      case "warning":
        return "text-warning bg-warning/10";
      case "destructive":
        return "text-destructive bg-destructive/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <Card className={`${getVariantStyles()} border shadow-elegant transition-all duration-300 hover:shadow-glow hover:scale-105`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${getIconStyles()}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}