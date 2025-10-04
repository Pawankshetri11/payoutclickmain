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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Search, 
  Clock,
  CheckCircle,
  ArrowRight,
  Users,
  Calendar,
  Code,
  Image as ImageIcon,
  Folder,
  Sparkles
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Available Tasks
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Choose from <span className="text-primary font-semibold">{allTasks.length} tasks</span> and start earning today
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
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
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto bg-muted/50 p-1 rounded-lg">
            {categoryTabs.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all hover:bg-background/50"
              >
                {category.icon && <category.icon className="h-4 w-4" />}
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>

        {categoryTabs.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6 animate-fade-in">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading amazing tasks for you...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {getFilteredAndSortedTasks(category.id).map((task, index) => (
                  <Card 
                    key={task.id} 
                    className="group bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 flex flex-col overflow-hidden hover-scale"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="p-4 lg:p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                          <task.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base lg:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {task.title}
                          </CardTitle>
                          <CardDescription className="mt-1.5 text-xs lg:text-sm line-clamp-2">
                            {task.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-baseline gap-2 pt-2 border-t border-border/50">
                        <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-success to-success/60 bg-clip-text text-transparent">
                          ₹{task.reward}
                        </div>
                        <div className="text-xs text-muted-foreground">per task</div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-4 lg:p-6 pt-0 flex-1 flex flex-col">
                      {/* Task Details */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1.5 text-xs">
                          {task.type === "code" ? <Code className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                          {task.type === "code" ? "Auto-verify" : "Manual"}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1.5 text-xs bg-primary/5 border-primary/20 text-primary">
                          <Users className="h-3 w-3" />
                          {task.vacancies} spots
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1.5 text-xs bg-success/5 border-success/20 text-success">
                          <CheckCircle className="h-3 w-3" />
                          {task.participants} done
                        </Badge>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-2 pt-4 border-t border-border/50 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/user/jobs/${task.id}`)} 
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartTask(task)} 
                          className="flex-1 gap-2 bg-gradient-primary hover:opacity-90 shadow-glow"
                        >
                          Start Now
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && getFilteredAndSortedTasks(category.id).length === 0 && (
              <Card className="bg-gradient-card border-border/50 animate-fade-in">
                <CardContent className="p-12 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-muted">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No tasks found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}