import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserDashboardLayout } from '@/components/user/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAvailableReviewProfiles } from '@/hooks/useAvailableReviewProfiles';
import { useTasks } from '@/hooks/useTasks';
import { useJobs } from '@/hooks/useJobs';
import { useReviews } from '@/hooks/useReviews';
import { ExternalLink, Clock, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ReviewTask() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { submitTask } = useTasks();
  const { profiles, loading, lockedUntil, selectProfile, completeReview } = useAvailableReviewProfiles(jobId || '');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { reviews, loading: reviewsLoading } = useReviews(selectedProfile?.id);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const job = jobs.find(j => j.id === jobId);

  useEffect(() => {
    if (!jobId || !job) {
      navigate('/dashboard/tasks');
      return;
    }

    if (job.type !== 'review' as any) {
      navigate('/dashboard/tasks');
      return;
    }
  }, [jobId, job, navigate]);

  const handleSelectProfile = async (profileId: string) => {
    try {
      const profile = await selectProfile(profileId);
      if (profile) {
        setSelectedProfile(profile);
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  useEffect(() => {
    if (reviews.length > 0 && selectedProfile && !selectedReview) {
      // Auto-select first active review
      const activeReview = reviews.find(r => r.status === 'active');
      if (activeReview) {
        setSelectedReview(activeReview);
      }
    }
  }, [reviews, selectedProfile, selectedReview]);

  const handleImageUpload = async (file: File) => {
    if (!user) return null;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('task-submissions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedProfile || !jobId || !job || !proofImage) {
      toast.error('Please upload a proof image');
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload proof image
      const imageUrl = await handleImageUpload(proofImage);
      if (!imageUrl) {
        toast.error('Failed to upload proof image');
        return;
      }

      // Submit task with proof
      const taskData = await submitTask(jobId, job.amount, { proof_image: imageUrl });
      
      if (taskData) {
        // Mark profile as completed
        await completeReview(selectedProfile.id, taskData.id);
        
        toast.success('Review task submitted for approval!');
        navigate('/dashboard/my-tasks');
      }
    } catch (error) {
      console.error('Error completing review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </UserDashboardLayout>
    );
  }

  if (lockedUntil) {
    const remainingTime = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000 / 60);
    return (
      <UserDashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Profiles Locked</h2>
            <p className="text-muted-foreground mb-4">
              You recently selected a profile. Other profiles will be available in {remainingTime} minutes.
            </p>
            <Button onClick={() => navigate('/dashboard/tasks')}>
              Back to Tasks
            </Button>
          </CardContent>
        </Card>
      </UserDashboardLayout>
    );
  }

  if (selectedProfile) {
    if (reviewsLoading) {
      return (
        <UserDashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </UserDashboardLayout>
      );
    }

    if (reviews.length === 0) {
      return (
        <UserDashboardLayout>
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">No Reviews Available</h2>
              <p className="text-muted-foreground mb-4">
                This profile doesn't have any reviews yet.
              </p>
              <Button onClick={() => setSelectedProfile(null)}>
                Back to Profiles
              </Button>
            </CardContent>
          </Card>
        </UserDashboardLayout>
      );
    }

    return (
      <UserDashboardLayout>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedProfile.title}</CardTitle>
              <Badge>Review Task</Badge>
            </div>
            {selectedProfile.description && (
              <p className="text-muted-foreground">{selectedProfile.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show multiple reviews if available */}
            {reviews.length > 1 && (
              <div className="space-y-2">
                <Label>Select a Review</Label>
                <div className="flex flex-wrap gap-2">
                  {reviews.map((review, index) => (
                    <Button
                      key={review.id}
                      variant={selectedReview?.id === review.id ? "default" : "outline"}
                      onClick={() => setSelectedReview(review)}
                      size="sm"
                    >
                      Review {index + 1} {review.type === 'image_text' ? '(Image + Text)' : '(Text Only)'}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedReview && (
              <>
                {selectedReview.review_image && selectedReview.type === 'image_text' && (
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={selectedReview.review_image} 
                      alt="Review" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                {selectedReview.review_text && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedReview.review_text}</p>
                  </div>
                )}
              </>
            )}

            {selectedProfile.business_link && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Business Profile:</span>
                <a
                  href={selectedProfile.business_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {selectedProfile.business_link}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            <div className="pt-4 border-t space-y-4">
              <div>
                <Label htmlFor="proof-image">Upload Proof Image *</Label>
                <Input
                  id="proof-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a screenshot showing you completed the review
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                After reviewing this business profile and uploading proof, submit for approval to earn ₹{job?.amount}.
              </p>
              <Button 
                onClick={handleComplete}
                disabled={submitting || uploading || !proofImage}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {submitting ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit for Approval'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </UserDashboardLayout>
    );
  }

  if (profiles.length === 0) {
    return (
      <UserDashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Profiles Available</h2>
            <p className="text-muted-foreground mb-4">
              All review profiles have been completed or are currently locked.
            </p>
            <Button onClick={() => navigate('/dashboard/tasks')}>
              Back to Tasks
            </Button>
          </CardContent>
        </Card>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Select a Profile to Review</h1>
          <p className="text-muted-foreground">
            Choose a business profile to review and earn ₹{job?.amount}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{profile.title}</CardTitle>
                {profile.description && (
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleSelectProfile(profile.id)}
                  className="w-full"
                >
                  Select Profile
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Locks for {profile.profile_lock_hours}h after selection
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UserDashboardLayout>
  );
}
