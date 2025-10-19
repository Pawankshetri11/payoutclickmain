import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReviews, Review } from '@/hooks/useReviews';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, FileText, List } from 'lucide-react';
import { BulkReviewUpload } from './BulkReviewUpload';

interface ReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    title: string;
  } | null;
}

export function ReviewsModal({ open, onOpenChange, profile }: ReviewsModalProps) {
  const { reviews, loading, createReview, updateReview, deleteReview, refetch } = useReviews(profile?.id);
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    type: 'image_text' as 'image_text' | 'text_only',
    review_text: '',
    review_image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const resetForm = () => {
    setFormData({
      type: 'image_text',
      review_text: '',
      review_image: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `review-${Date.now()}.${fileExt}`;
      const filePath = `review-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleCreateReview = async () => {
    if (!profile) return;

    try {
      if (formData.type === 'image_text' && !formData.review_text && !imageFile) {
        toast.error('Please provide both text and image for image_text type');
        return;
      }

      if (formData.type === 'text_only' && !formData.review_text) {
        toast.error('Please provide review text');
        return;
      }

      let imageUrl = formData.review_image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile) || '';
      }

      await createReview({
        profile_id: profile.id,
        type: formData.type,
        review_text: formData.review_text,
        review_image: formData.type === 'image_text' ? imageUrl : undefined
      });

      setAddReviewOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleUpdateReview = async () => {
    if (!selectedReview) return;

    try {
      let imageUrl = formData.review_image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile) || imageUrl;
      }

      await updateReview(selectedReview.id, {
        type: formData.type,
        review_text: formData.review_text,
        review_image: formData.type === 'image_text' ? imageUrl : undefined
      });

      setEditReviewOpen(false);
      setSelectedReview(null);
      resetForm();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setFormData({
      type: review.type,
      review_text: review.review_text || '',
      review_image: review.review_image || ''
    });
    setImagePreview(review.review_image || '');
    setEditReviewOpen(true);
  };

  if (!profile) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Reviews - {profile.title}</DialogTitle>
            <DialogDescription>
              Add multiple reviews for this profile. Users will see these reviews when completing the task.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total Reviews: {reviews.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                  <List className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button onClick={() => setAddReviewOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reviews added yet. Click "Add Review" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Badge variant={review.type === 'image_text' ? 'default' : 'secondary'}>
                          {review.type === 'image_text' ? (
                            <><ImageIcon className="h-3 w-3 mr-1" /> Image + Text</>
                          ) : (
                            <><FileText className="h-3 w-3 mr-1" /> Text Only</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.review_text || '-'}
                      </TableCell>
                      <TableCell>
                        {review.review_image ? (
                          <img src={review.review_image} alt="Review" className="h-10 w-10 object-cover rounded" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.status === 'active' ? 'default' : 'secondary'}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={review.is_used ? 'destructive' : 'outline'}>
                            {review.is_used ? 'Used' : 'Unused'}
                          </Badge>
                          {review.is_used && review.times_used && (
                            <span className="text-xs text-muted-foreground">
                              {review.times_used} time{review.times_used > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this review?')) {
                                deleteReview(review.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Review Modal */}
      <Dialog open={addReviewOpen} onOpenChange={setAddReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
            <DialogDescription>Create a new review for users to post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Review Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'image_text' | 'text_only') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image_text">Image + Text</SelectItem>
                  <SelectItem value="text_only">Text Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Text *</Label>
              <Textarea
                placeholder="Enter the review text that users should post"
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                rows={4}
              />
            </div>

            {formData.type === 'image_text' && (
              <div className="space-y-2">
                <Label>Review Image *</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('add-review-image')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    id="add-review-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setAddReviewOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateReview}>Create Review</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Review Modal */}
      <Dialog open={editReviewOpen} onOpenChange={setEditReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>Update review details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Review Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'image_text' | 'text_only') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image_text">Image + Text</SelectItem>
                  <SelectItem value="text_only">Text Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Text *</Label>
              <Textarea
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                rows={4}
              />
            </div>

            {formData.type === 'image_text' && (
              <div className="space-y-2">
                <Label>Review Image</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('edit-review-image')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Image
                  </Button>
                  <input
                    id="edit-review-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {(imagePreview || formData.review_image) && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || formData.review_image}
                        alt="Review"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setEditReviewOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReview}>Update Review</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      {profile && (
        <BulkReviewUpload
          open={bulkUploadOpen}
          onOpenChange={setBulkUploadOpen}
          profileId={profile.id}
        />
      )}
    </>
  );
}
