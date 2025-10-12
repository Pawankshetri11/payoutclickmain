import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface BulkReviewUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}

export function BulkReviewUpload({ open, onOpenChange, profileId }: BulkReviewUploadProps) {
  const [bulkText, setBulkText] = useState('');
  const [uploading, setUploading] = useState(false);
  const { createReview } = useReviews(profileId);

  const handleBulkUpload = async () => {
    if (!bulkText.trim()) {
      toast.error('Please enter review texts');
      return;
    }

    try {
      setUploading(true);
      
      // Split by line breaks and filter empty lines
      const reviewTexts = bulkText
        .split('\n')
        .map(text => text.trim())
        .filter(text => text.length > 0);

      if (reviewTexts.length === 0) {
        toast.error('No valid review texts found');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Create reviews one by one
      for (const reviewText of reviewTexts) {
        try {
          await createReview({
            profile_id: profileId,
            type: 'text_only',
            review_text: reviewText
          });
          successCount++;
        } catch (error) {
          console.error('Error creating review:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} review(s)`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} review(s)`);
      }

      if (successCount > 0) {
        setBulkText('');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast.error('Failed to upload reviews');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Text Reviews</DialogTitle>
          <DialogDescription>
            Add multiple text-only reviews at once. Enter one review per line.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-reviews">Review Texts (One per line)</Label>
            <Textarea
              id="bulk-reviews"
              placeholder="Enter review texts here, one per line:&#10;Great product! Highly recommend.&#10;Excellent service and quality.&#10;Very satisfied with my purchase."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Total reviews: {bulkText.split('\n').filter(line => line.trim().length > 0).length}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setBulkText('');
                onOpenChange(false);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkUpload} disabled={uploading || !bulkText.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Reviews'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
