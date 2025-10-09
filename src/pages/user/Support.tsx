import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Send, FileText, HelpCircle } from "lucide-react";
import { useFAQs } from "@/hooks/useFAQs";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Support() {
  const { categories, faqs, loading } = useFAQs(false);
  const { content: supportLinks, loading: linksLoading } = useSiteContent('support_links');

  const getFAQsByCategory = (categoryId: string) => {
    return faqs.filter(faq => faq.category_id === categoryId);
  };

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          Support Center
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
          Find answers to common questions and get help
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Telegram</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connect with us
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                window.open(supportLinks?.telegram || 'https://t.me/YourChannel', '_blank');
              }}
              disabled={linksLoading}
            >
              Open Telegram
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">WhatsApp Community</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Join our community
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                window.open(supportLinks?.whatsapp_community || 'https://chat.whatsapp.com/YourCommunity', '_blank');
              }}
              disabled={linksLoading}
            >
              Join WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Policies</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Read our policies
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open(supportLinks?.privacy_policy || '/privacy-policy', '_blank');
                }}
                disabled={linksLoading}
              >
                Privacy Policy
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open(supportLinks?.terms_of_service || '/terms-of-service', '_blank');
                }}
                disabled={linksLoading}
              >
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading FAQs...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryFAQs = getFAQsByCategory(category.id);
                if (categoryFAQs.length === 0) return null;

                return (
                  <div key={category.id}>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{category.name}</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFAQs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No FAQs available</h3>
              <p className="text-muted-foreground">
                Check back later for helpful information
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
