import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter,
  Star,
  Smartphone,
  Globe,
  Gamepad2,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
  Users,
  Calendar,
  Code,
  Image as ImageIcon
} from "lucide-react";

export default function Tasks() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform jobs to match the existing task format
      const transformedTasks = (jobs || []).map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category || 'general',
        type: job.type,
        reward: job.amount,
        duration: "15 min", // Default duration
        difficulty: "Easy", // Default difficulty  
        location: "Online", // Default location
        requirements: job.type === 'image' ? ["Clear photo required", "Good lighting"] : ["Follow instructions carefully"],
        participants: 0, // TODO: Get from submissions
        icon: job.type === 'code' ? Code : ImageIcon,
        timeLeft: "Active",
        vacancies: job.vacancy - job.completed
      }));

      setAllTasks(transformedTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Mock tasks for demo purposes if no real tasks are available
  const mockTasks = [
    {
      id: 1,
      title: "Write Google Review for Restaurant",
      description: "Visit the restaurant and write an honest review on Google Maps",
      category: "review",
      type: "code",
      reward: 25,
      duration: "10 min",
      difficulty: "Easy",
      location: "Mumbai",
      requirements: ["Must visit location", "Minimum 50 words"],
      participants: 143,
      icon: Star,
      timeLeft: "2 days",
      vacancies: 50
    },
    {
      id: 2,
      title: "Product Photo Verification",
      description: "Take clear photos of products in stores and submit for verification",
      category: "photography",
      type: "image",
      reward: 40,
      duration: "20 min",
      difficulty: "Easy",
      location: "Mumbai",
      requirements: ["Clear product image", "Price tag visible", "Store location"],
      participants: 67,
      icon: ImageIcon,
      timeLeft: "5 days",
      vacancies: 25
    },
    {
      id: 3,
      title: "Install & Try Shopping App",
      description: "Download app, create account, and browse for 5 minutes",
      category: "app",
      type: "code",
      reward: 35,
      duration: "15 min",
      difficulty: "Easy",
      location: "Online",
      requirements: ["Android/iOS device", "Valid email"],
      participants: 89,
      icon: Smartphone,
      timeLeft: "5 days",
      vacancies: 100
    },
    {
      id: 4,
      title: "Store Visit Documentation",
      description: "Visit specific stores and document their displays with photos",
      category: "survey",
      type: "image",
      reward: 60,
      duration: "30 min",
      difficulty: "Medium",
      location: "Delhi",
      requirements: ["Store exterior photo", "Interior display photo", "Receipt/proof of visit"],
      participants: 23,
      icon: Globe,
      timeLeft: "7 days",
      vacancies: 30
    },
    {
      id: 5,
      title: "Play Mobile Game to Level 5",
      description: "Download game and reach level 5 within 7 days",
      category: "game",
      type: "code",
      reward: 50,
      duration: "2 hours",
      difficulty: "Medium",
      location: "Online",
      requirements: ["Android device", "Play daily"],
      participants: 45,
      icon: Gamepad2,
      timeLeft: "7 days",
      vacancies: 80
    },
    {
      id: 6,
      title: "Product Testing with Feedback",
      description: "Use the product and submit detailed photos and feedback",
      category: "testing",
      type: "image",
      reward: 75,
      duration: "45 min",
      difficulty: "Medium",
      location: "Bangalore",
      requirements: ["Product usage photos", "Before/after images", "Written feedback"],
      participants: 12,
      icon: MessageSquare,
      timeLeft: "10 days",
      vacancies: 15
    },
  ];

  // Use real tasks if available, otherwise use mock tasks
  const displayTasks = allTasks.length > 0 ? allTasks : mockTasks;

  const categories = [
    { id: "all", name: "All Tasks", icon: null, count: displayTasks.length },
    { id: "code", name: "Code Tasks", icon: Code, count: displayTasks.filter(t => t.type === 'code').length },
    { id: "image", name: "Image Tasks", icon: ImageIcon, count: displayTasks.filter(t => t.type === 'image').length },
    { id: "review", name: "Reviews", icon: Star, count: displayTasks.filter(t => t.category === 'review').length },
    { id: "photography", name: "Photography", icon: ImageIcon, count: displayTasks.filter(t => t.category === 'photography').length },
    { id: "app", name: "App Install", icon: Smartphone, count: displayTasks.filter(t => t.category === 'app').length },
  ];

  const handleStartTask = (task: any) => {
    navigate(`/user/tasks/${task.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Choose from {displayTasks.length} available tasks and start earning</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Select>
              <SelectTrigger className="w-[140px] text-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[140px] text-sm">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Categories Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                {category.icon && <category.icon className="h-3 w-3 md:h-4 md:w-4" />}
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.id === 'all' ? 'All' : category.name.split(' ')[0]}</span>
                <Badge variant="secondary" className="ml-0.5 md:ml-1 text-xs px-1.5">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-4 md:mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {displayTasks
                  .filter(task => {
                    if (category.id === 'all') return true;
                    if (category.id === 'code' || category.id === 'image') return task.type === category.id;
                    return task.category === category.id;
                  })
                  .map((task) => (
                  <Card key={task.id} className="bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex items-start gap-2 md:gap-3 flex-1">
                          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
                            <task.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base md:text-lg">{task.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs md:text-sm line-clamp-2">{task.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xl md:text-2xl font-bold text-success">₹{task.reward}</div>
                          <div className="text-xs text-muted-foreground">per task</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                      {/* Task Details */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {task.type === "code" ? <Code className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                          {task.type === "code" ? "Auto-verify" : "Manual approval"}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.duration}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.timeLeft} left
                        </Badge>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Requirements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {task.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 md:pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Users className="h-3 w-3 md:h-4 md:w-4" />
                          {task.participants} participants
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/user/jobs/${task.id}`)} className="flex-1 sm:flex-none text-xs md:text-sm">
                            Details
                          </Button>
                          <Button size="sm" onClick={() => handleStartTask(task)} className="gap-1 md:gap-2 flex-1 sm:flex-none text-xs md:text-sm">
                            Start Task
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
}