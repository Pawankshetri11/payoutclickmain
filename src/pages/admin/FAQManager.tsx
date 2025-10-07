import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, HelpCircle, FolderPlus } from "lucide-react";
import { useFAQs } from "@/hooks/useFAQs";
import { useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "sonner";

export default function FAQManager() {
  const { categories, faqs, loading, createCategory, updateCategory, deleteCategory, createFAQ, updateFAQ, deleteFAQ } = useFAQs(true);
  const { content: supportLinks, updateContent: updateSupportLinks, loading: linksLoading } = useSiteContent('support_links');

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    display_order: 0,
  });

  const [faqForm, setFaqForm] = useState({
    category_id: "",
    question: "",
    answer: "",
    display_order: 0,
    is_published: true,
  });

  const [linksForm, setLinksForm] = useState({
    telegram: "",
    whatsapp_community: "",
    privacy_policy: "",
    terms_of_service: "",
  });

  // Update linksForm when supportLinks data is loaded
  useEffect(() => {
    if (supportLinks && !linksLoading) {
      setLinksForm({
        telegram: supportLinks.telegram || "",
        whatsapp_community: supportLinks.whatsapp_community || "",
        privacy_policy: supportLinks.privacy_policy || "",
        terms_of_service: supportLinks.terms_of_service || "",
      });
    }
  }, [supportLinks, linksLoading]);

  const handleCreateCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createCategory(categoryForm);
    setCategoryDialogOpen(false);
    setCategoryForm({ name: "", slug: "", display_order: 0 });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    await updateCategory(editingCategory.id, categoryForm);
    setCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", display_order: 0 });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete all FAQs in this category.")) return;
    await deleteCategory(id);
  };

  const handleCreateFAQ = async () => {
    if (!faqForm.category_id || !faqForm.question || !faqForm.answer) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createFAQ(faqForm);
    setFaqDialogOpen(false);
    setFaqForm({
      category_id: "",
      question: "",
      answer: "",
      display_order: 0,
      is_published: true,
    });
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ) return;

    await updateFAQ(editingFAQ.id, faqForm);
    setFaqDialogOpen(false);
    setEditingFAQ(null);
    setFaqForm({
      category_id: "",
      question: "",
      answer: "",
      display_order: 0,
      is_published: true,
    });
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    await deleteFAQ(id);
  };

  const handleUpdateLinks = async () => {
    await updateSupportLinks(linksForm);
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      display_order: category.display_order,
    });
    setCategoryDialogOpen(true);
  };

  const openEditFAQ = (faq: any) => {
    setEditingFAQ(faq);
    setFaqForm({
      category_id: faq.category_id,
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_published: faq.is_published,
    });
    setFaqDialogOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          FAQ & Support Manager
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage FAQ categories, questions, and support page links
        </p>
      </div>

      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="links">Support Links</TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage FAQs</CardTitle>
                  <CardDescription>Add, edit, or remove frequently asked questions</CardDescription>
                </div>
                <Dialog open={faqDialogOpen} onOpenChange={(open) => {
                  setFaqDialogOpen(open);
                  if (!open) {
                    setEditingFAQ(null);
                    setFaqForm({
                      category_id: "",
                      question: "",
                      answer: "",
                      display_order: 0,
                      is_published: true,
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingFAQ ? "Edit FAQ" : "Create New FAQ"}</DialogTitle>
                      <DialogDescription>
                        {editingFAQ ? "Update the FAQ details" : "Add a new frequently asked question"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={faqForm.category_id} onValueChange={(value) => setFaqForm({...faqForm, category_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Question *</Label>
                        <Input
                          value={faqForm.question}
                          onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                          placeholder="Enter the question"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer *</Label>
                        <Textarea
                          value={faqForm.answer}
                          onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                          placeholder="Enter the answer"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={faqForm.display_order}
                            onChange={(e) => setFaqForm({...faqForm, display_order: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={faqForm.is_published}
                            onCheckedChange={(checked) => setFaqForm({...faqForm, is_published: checked})}
                          />
                          <Label>Published</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>Cancel</Button>
                      <Button onClick={editingFAQ ? handleUpdateFAQ : handleCreateFAQ}>
                        {editingFAQ ? "Update FAQ" : "Create FAQ"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium">{faq.question}</TableCell>
                        <TableCell>{categories.find(c => c.id === faq.category_id)?.name}</TableCell>
                        <TableCell>{faq.display_order}</TableCell>
                        <TableCell>
                          {faq.is_published ? (
                            <Badge className="bg-success/10 text-success">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditFAQ(faq)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFAQ(faq.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Categories</CardTitle>
                  <CardDescription>Organize FAQs into categories</CardDescription>
                </div>
                <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                  setCategoryDialogOpen(open);
                  if (!open) {
                    setEditingCategory(null);
                    setCategoryForm({ name: "", slug: "", display_order: 0 });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? "Update the category details" : "Add a new FAQ category"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          placeholder="e.g., Getting Started"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug *</Label>
                        <Input
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          placeholder="e.g., getting-started"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={categoryForm.display_order}
                          onChange={(e) => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
                      <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                        {editingCategory ? "Update Category" : "Create Category"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>FAQ Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{category.display_order}</TableCell>
                        <TableCell>{faqs.filter(f => f.category_id === category.id).length}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditCategory(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Links Tab */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Support Page Links</CardTitle>
              <CardDescription>Manage links displayed on the support page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Telegram Link</Label>
                  <Input
                    value={linksForm.telegram}
                    onChange={(e) => setLinksForm({...linksForm, telegram: e.target.value})}
                    placeholder="https://t.me/YourChannel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Community Link</Label>
                  <Input
                    value={linksForm.whatsapp_community}
                    onChange={(e) => setLinksForm({...linksForm, whatsapp_community: e.target.value})}
                    placeholder="https://chat.whatsapp.com/YourCommunity"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Privacy Policy Link</Label>
                  <Input
                    value={linksForm.privacy_policy}
                    onChange={(e) => setLinksForm({...linksForm, privacy_policy: e.target.value})}
                    placeholder="/privacy-policy or full URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terms of Service Link</Label>
                  <Input
                    value={linksForm.terms_of_service}
                    onChange={(e) => setLinksForm({...linksForm, terms_of_service: e.target.value})}
                    placeholder="/terms-of-service or full URL"
                  />
                </div>
                <Button onClick={handleUpdateLinks} disabled={linksLoading}>
                  Save Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
