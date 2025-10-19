import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign } from "lucide-react";

interface ReferralEarningsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
}

interface CommissionRecord {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

export function ReferralEarningsModal({
  open,
  onOpenChange,
  referredUserId,
  referredUserName,
  referredUserEmail,
}: ReferralEarningsModalProps) {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchCommissions();
    }
  }, [open, referredUserId]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      // Fetch all commission transactions related to this referred user
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, description, created_at, status')
        .eq('type', 'earning')
        .ilike('description', `%${referredUserEmail}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Error fetching commission history:', error);
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Commission Earnings History
          </DialogTitle>
          <DialogDescription>
            Detailed earnings from <span className="font-semibold">{referredUserName}</span> ({referredUserEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Card */}
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commission Earned</p>
                <p className="text-2xl font-bold text-success">₹{totalEarned.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground">{commissions.length}</p>
              </div>
            </div>
          </div>

          {/* Earnings History Table */}
          <div className="border rounded-lg">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : commissions.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No commission earnings yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="text-sm">
                        {new Date(commission.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {commission.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={commission.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            commission.status === 'completed'
                              ? 'bg-success/10 text-success border-success/20'
                              : ''
                          }
                        >
                          {commission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-success">
                        +₹{commission.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
