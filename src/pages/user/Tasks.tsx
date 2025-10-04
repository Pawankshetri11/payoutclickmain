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
  Clock,
  CheckCircle,
  ArrowRight,
  Users,
  Calendar,
  Code,
  Image as ImageIcon,
  Folder
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  is_active: boolean;
}

export default function Tasks() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await (supabase as any)
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories((categoriesData as any[]) || []);

      // Fetch jobs/tasks
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Transform jobs to task format
      const transformedTasks = (jobs || []).map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category || 'general',
        type: job.type,
        reward: job.amount,
        icon: job.type === 'code' ? Code : ImageIcon,
        vacancies: job.vacancy - job.completed,
        participants: job.completed,
        created_at: job.created_at
      }));

      setAllTasks(transformedTasks);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (task: any) => {
    navigate(`/user/tasks/${task.id}`);
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = (categoryId?: string) => {
    let filtered = allTasks;

    // Filter by category
    if (categoryId && categoryId !== 'all') {
      if (categoryId === 'code' || categoryId === 'image') {
        filtered = filtered.filter(t => t.type === categoryId);
      } else {
        filtered = filtered.filter(t => t.category.toLowerCase() === categoryId.toLowerCase());
      }
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.reward - a.reward);
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.reward - b.reward);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return filtered;
  };

  // Build category tabs
  const categoryTabs = [
    { id: "all", name: "All Tasks", icon: null, count: allTasks.length },
    { id: "code", name: "Code Tasks", icon: Code, count: allTasks.filter(t => t.type === 'code').length },
    { id: "image", name: "Image Tasks", icon: ImageIcon, count: allTasks.filter(t => t.type === 'image').length },
    ...categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: Folder,
      count: allTasks.filter(t => t.category.toLowerCase() === cat.name.toLowerCase()).length
    }))
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Choose from {allTasks.length} available tasks and start earning</p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full">
            {categoryTabs.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
                {category.icon && <category.icon className="h-3 w-3 md:h-4 md:w-4" />}
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-0.5 md:ml-1 text-xs px-1.5">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categoryTabs.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-4 md:mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {getFilteredAndSortedTasks(category.id).map((task) => (
                  <Card key={task.id} className="bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-all duration-200 flex flex-col">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
                            <task.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base md:text-lg line-clamp-2">{task.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs md:text-sm line-clamp-2">{task.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="text-left mt-3">
                        <div className="text-xl md:text-2xl font-bold text-success">₹{task.reward}</div>
                        <div className="text-xs text-muted-foreground">per task</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0 flex-1 flex flex-col">
                      {/* Task Details */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {task.type === "code" ? <Code className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                          {task.type === "code" ? "Auto-verify" : "Manual approval"}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {task.vacancies} left
                        </Badge>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 md:pt-4 border-t border-border/50 mt-auto">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Users className="h-3 w-3 md:h-4 md:w-4" />
                          {task.participants} completed
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

            {!loading && getFilteredAndSortedTasks(category.id).length === 0 && (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No tasks found in this category.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}