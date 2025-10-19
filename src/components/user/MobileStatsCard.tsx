import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, Clock, Star } from "lucide-react";

interface MobileStatsCardProps {
  balance: number;
  totalEarnings: number;
  completedTasks: number;
  level: string;
}

export function MobileStatsCard({ balance, totalEarnings, completedTasks, level }: MobileStatsCardProps) {
  return (
    <Card className="mx-4 mb-6 bg-gradient-primary shadow-lg border-0">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-foreground">₹{balance.toFixed(2)}</div>
            <div className="text-xs text-primary-foreground/80">Available Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-foreground">₹{totalEarnings.toFixed(2)}</div>
            <div className="text-xs text-primary-foreground/80">Total Earnings</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-primary-foreground/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground/90">{completedTasks} Tasks Done</span>
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              <Star className="h-3 w-3 mr-1" />
              {level}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}