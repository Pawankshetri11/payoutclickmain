import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, RefreshCw, Home } from "lucide-react";

const Maintenance = () => {
  useEffect(() => {
    console.log("Maintenance mode active");
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-card border-border/50 shadow-elegant">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-warning/10 rounded-full">
              <Wrench className="h-16 w-16 text-warning animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Under Maintenance</h1>
            <p className="text-muted-foreground text-lg">
              We're currently performing scheduled maintenance
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Our team is working hard to improve your experience. We'll be back shortly!
            </p>
            <p className="text-xs text-muted-foreground">
              Expected downtime: 1-2 hours
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              className="gap-2 bg-gradient-primary"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Need urgent assistance? Contact us at support@example.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
