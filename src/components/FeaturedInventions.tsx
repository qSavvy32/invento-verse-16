
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, HeartIcon, ShareIcon } from "lucide-react";

// Sample data for featured inventions
const FEATURED_INVENTIONS = [
  {
    id: 1,
    title: "EcoPackPro",
    description: "Biodegradable packaging solution with self-sealing technology for food preservation",
    creator: "Sophia Chen",
    likes: 142,
    views: 845,
    tags: ["Sustainable", "Packaging", "Food Tech"],
    image: "https://images.unsplash.com/photo-1605600659873-d808a13e4d9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    title: "SolarFlex",
    description: "Flexible solar panel system that integrates with curved architectural surfaces",
    creator: "Marcus Johnson",
    likes: 98,
    views: 573,
    tags: ["Energy", "Solar", "Architecture"],
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    title: "MediSync",
    description: "Smart medication dispenser with reminder system and health monitoring",
    creator: "Aisha Patel",
    likes: 217,
    views: 1023,
    tags: ["Healthcare", "IoT", "Wellness"],
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
];

export const FeaturedInventions = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-leonardo font-semibold text-invention-ink">Featured Inventions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_INVENTIONS.map(invention => (
          <Card key={invention.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={invention.image} 
                alt={invention.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-invention-ink">{invention.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <HeartIcon className="h-4 w-4 mr-1 text-invention-red" />
                  <span>{invention.likes}</span>
                  <Eye className="h-4 w-4 ml-3 mr-1" />
                  <span>{invention.views}</span>
                </div>
              </div>
              <CardDescription>By {invention.creator}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="mb-4 text-invention-ink">{invention.description}</p>
              <div className="flex flex-wrap gap-2">
                {invention.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-invention-accent/20 text-invention-ink">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="text-invention-blue border-invention-blue hover:bg-invention-blue/10">
                View Details
              </Button>
              <Button variant="ghost" size="icon">
                <ShareIcon className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
