import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAvailableReviewProfiles } from '@/hooks/useAvailableReviewProfiles';
import { useTasks } from '@/hooks/useTasks';
import { useJobs } from '@/hooks/useJobs';
import { useReviews } from '@/hooks/useReviews';
import { Clock, CheckCircle, Copy, Download, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCountdown } from '@/hooks/useCountdown';

type TaskStage = 'description' | 'profile-selection' | 'review-content';

export default function ReviewTask() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { submitTask } = useTasks();
  const { profiles, loading, lockedUntil, inProgressProfile, selectProfile, completeReview, cancelSelection } = useAvailableReviewProfiles(jobId || '');
  const [taskStage, setTaskStage] = useState<TaskStage>('description');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { reviews, loading: reviewsLoading } = useReviews(selectedProfile?.id);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  
  const globalCountdown = useCountdown(lockedUntil);

  const job = jobs.find(j => j.id === jobId);

  useEffect(() => {
    if (!jobId) {
      navigate('/user/tasks');
      return;
    }

    // Only check job type if jobs are loaded and job is found
    if (jobs.length > 0 && job && job.type !== 'review') {
      navigate('/user/tasks');
      return;
    }
  }, [jobId, job, jobs.length, navigate]);

  // Auto-restore in-progress profile
  useEffect(() => {
    if (inProgressProfile && !selectedProfile) {
      const profile = profiles.find(p => p.id === inProgressProfile);
      if (profile) {
        setSelectedProfile(profile);
        setTaskStage('review-content');
      }
    }
  }, [inProgressProfile, profiles, selectedProfile]);

  const handleSelectProfile = async (profileId: string) => {
    try {
      const profile = await selectProfile(profileId);
      if (profile) {
        setSelectedProfile(profile);
        setTaskStage('review-content');
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  useEffect(() => {
    if (reviews.length > 0 && selectedProfile && !selectedReview) {
      // Auto-select a random review or first one (only ONE review per user)
      const activeReviews = reviews.filter(r => r.status === 'active');
      if (activeReviews.length > 0) {
        // Pick a random review so different users get different templates
        const randomReview = activeReviews[Math.floor(Math.random() * activeReviews.length)];
        setSelectedReview(randomReview);
      }
    }
  }, [reviews, selectedProfile, selectedReview]);

  const handleCancelReview = async () => {
    if (!selectedProfile) return;
    
    // Just navigate back - keep the profile locked
    setTaskStage('profile-selection');
  };

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
        navigate('/user/my-tasks');
      }
    } catch (error) {
      console.error('Error completing review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Stage 1: Show Task Description
  if (taskStage === 'description') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/user/tasks')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>

          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{job?.title || 'Review Job'}</CardTitle>
                  <Badge variant="secondary">Review Task</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Earn</p>
                  <p className="text-2xl font-bold text-primary">₹{job?.amount}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: job?.description || '' }}
              />
              <div className="flex justify-center pt-4 border-t">
                <Button 
                  size="lg"
                  onClick={() => setTaskStage('profile-selection')}
                  className="min-w-[200px]"
                >
                  Select Profile to Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Stage 3: Show Review Content
  if (taskStage === 'review-content' && selectedProfile) {
    if (reviewsLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          </div>
        </div>
      );
    }

    if (reviews.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <h2 className="text-xl font-semibold">No Reviews Available</h2>
                <p className="text-muted-foreground">
                  This profile doesn't have any reviews yet.
                </p>
                <Button onClick={() => {
                  setSelectedProfile(null);
                  setTaskStage('profile-selection');
                }}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profiles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCancelReview}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Button>

          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedProfile.title}</CardTitle>
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Link with Copy */}
              {selectedProfile.business_link && (
                <div className="space-y-2">
                  <Label>Business Profile Link</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={selectedProfile.business_link} 
                      readOnly 
                      className="flex-1 bg-muted/50"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(selectedProfile.business_link, 'Link')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Single Review Content - No Selection Needed */}
              {selectedReview && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                  {selectedReview.review_image && selectedReview.type === 'image_text' && (
                    <div className="space-y-2">
                      <Label>Review Image</Label>
                      <div className="rounded-lg overflow-hidden border bg-background">
                        <img 
                          src={selectedReview.review_image} 
                          alt="Review" 
                          className="w-full h-auto"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(selectedReview.review_image, 'review-image.jpg')}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>
                    </div>
                  )}
                  
                  {selectedReview.review_text && (
                    <div className="space-y-2">
                      <Label>Review Text</Label>
                      <div className="p-4 bg-background rounded-lg border">
                        <p className="whitespace-pre-wrap text-sm">{selectedReview.review_text}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedReview.review_text, 'Text')}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proof-image">Upload Proof Screenshot *</Label>
                  <Input
                    id="proof-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a screenshot showing you completed the review on the business profile
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    💰 Earn ₹{job?.amount} after approval
                  </p>
                </div>

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
        </div>
      </div>
    );
  }

  // Stage 2: Profile Selection
  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <h2 className="text-xl font-semibold">No Profiles Available</h2>
              <p className="text-muted-foreground">
                No review profiles configured for this job.
              </p>
              <Button onClick={() => navigate('/user/tasks')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setTaskStage('description')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold">Select a Profile to Review</h1>
              </div>
              <p className="text-muted-foreground">
                Choose a business profile to review and earn ₹{job?.amount}
              </p>
            </div>
          </div>

          {!globalCountdown.isExpired && (
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-lg animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    Global Cooldown Active
                  </p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    You can start a new review in:
                  </p>
                </div>
                <div className="text-right bg-amber-500/20 px-6 py-3 rounded-lg">
                  <div className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">
                    {String(globalCountdown.hours).padStart(2, '0')}:
                    {String(globalCountdown.minutes).padStart(2, '0')}:
                    {String(globalCountdown.seconds).padStart(2, '0')}
                  </div>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Hours : Minutes : Seconds
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              const ProfileCountdown = ({ targetDate }: { targetDate: Date }) => {
                const countdown = useCountdown(targetDate);
                if (countdown.isExpired) return null;
                
                return (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-center">
                    <div className="text-sm font-mono font-semibold">
                      {String(countdown.hours).padStart(2, '0')}:
                      {String(countdown.minutes).padStart(2, '0')}:
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {profile.status === 'on_cooldown' ? 'Available in' : 'Unlocks in'}
                    </p>
                  </div>
                );
              };

              const canAccess = profile.status === 'available' || profile.status === 'locked_by_you';
              const isLocked = !canAccess;

              return (
                <Card 
                  key={profile.id} 
                  className={`transition-all ${canAccess ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer border-primary/30' : 'opacity-60 border-muted cursor-not-allowed'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{profile.title}</CardTitle>
                      {profile.status === 'locked_by_you' && (
                        <Badge className="shrink-0 bg-green-500/20 text-green-600 border-green-500/30">
                          In Progress
                        </Badge>
                      )}
                      {profile.status === 'locked_by_others' && (
                        <Badge variant="outline" className="shrink-0 bg-amber-500/10 text-amber-600 border-amber-500/30">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {profile.status === 'on_cooldown' && (
                        <Badge variant="outline" className="shrink-0 bg-blue-500/10 text-blue-600 border-blue-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Cooldown
                        </Badge>
                      )}
                      {profile.status === 'available' && (
                        <Badge variant="outline" className="shrink-0 bg-green-500/10 text-green-600 border-green-500/30">
                          Available
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {profile.unlocks_at && isLocked && (
                      <ProfileCountdown targetDate={profile.unlocks_at} />
                    )}
                    
                    <Button 
                      onClick={() => canAccess && handleSelectProfile(profile.id)}
                      className="w-full"
                      disabled={!canAccess}
                      variant={profile.status === 'locked_by_you' ? 'default' : 'outline'}
                    >
                      {profile.status === 'locked_by_you' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Continue Review
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Not Available
                        </>
                      ) : (
                        'Start Review'
                      )}
                    </Button>
                    
                    {profile.status === 'locked_by_you' && (
                      <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                        ✓ You have this profile reserved
                      </p>
                    )}
                    
                    {profile.status === 'locked_by_others' && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                        {!globalCountdown.isExpired 
                          ? '🔒 Locked by your global cooldown'
                          : '🔒 Currently being reviewed'
                        }
                      </p>
                    )}
                    
                    {profile.status === 'on_cooldown' && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                        ⏳ Profile is on cooldown period
                      </p>
                    )}

                    {profile.status === 'available' && (
                      <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                        ✅ Ready to review
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
