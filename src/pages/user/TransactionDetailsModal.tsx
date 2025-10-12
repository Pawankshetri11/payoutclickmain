import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wallet, FileText, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
}

export function TransactionDetailsModal({ open, onOpenChange, transaction }: TransactionDetailsModalProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction && open) {
      fetchTransactionDetails();
    }
  }, [transaction, open]);

  const fetchTransactionDetails = async () => {
    if (!transaction) return;
    
    setLoading(true);
    try {
      // Screenshot feature removed - column doesn't exist in withdrawals table
      setScreenshot(null);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>Complete information about this transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">{transaction.id.substring(0, 16)}...</span>
                </div>
                {/* Admin-provided payment details (only shown in modal) */}
                {transaction.rawData?.description && (
                  <>
                    {transaction.rawData.description.includes('Admin Transaction ID:') && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Payment Txn ID:</span>
                        <span className="font-mono text-xs">
                          {transaction.rawData.description.match(/Admin Transaction ID:\s*([^|]+)/)?.[1]?.trim()}
                        </span>
                      </div>
                    )}
                    {transaction.rawData.description.includes('Method:') && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium">
                          {transaction.rawData.description.match(/Method:\s*([^\n]+)/)?.[1]?.trim()}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{transaction.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className={`font-bold text-lg ${
                    transaction.isNegative ? 'text-destructive' : 'text-success'
                  }`}>
                    {transaction.isNegative ? '-' : '+'}₹{Math.abs(transaction.amount)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(transaction.date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{transaction.category}</span>
                </div>
              </div>
            </div>

          {/* Description */}
          {transaction.title && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{transaction.title}</p>
            </div>
          )}

          {/* Fee breakdown for withdrawals */}
          {transaction.type === 'withdrawal' && (
            <div className="p-4 bg-muted/10 rounded-lg border border-border/50 space-y-1">
              <p className="text-sm text-muted-foreground">Platform fee (20%): ₹{(Math.abs(transaction.amount) * 0.20).toFixed(2)}</p>
              <p className="text-sm text-foreground font-medium">Net received: ₹{(Math.abs(transaction.amount) * 0.80).toFixed(2)}</p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
