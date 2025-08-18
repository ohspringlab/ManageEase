import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckSquare, Clock, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: CheckSquare,
      title: "Simple Task Management",
      description: "Create, organize, and track your tasks with ease."
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Never miss a deadline with intelligent reminders."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team members."
    },
    {
      icon: Zap,
      title: "Boost Productivity",
      description: "Get more done with our intuitive workflow tools."
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to ManageEase
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The simple, modern way to manage your tasks and boost productivity.
            Stay organized, meet deadlines, and achieve your goals effortlessly.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/tasks">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Get Started
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to stay productive
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Powerful features designed to make task management simple and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-b from-card to-muted/30"
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            Ready to transform your productivity?
          </h3>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Join thousands of users who have already streamlined their workflow with ManageEase.
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}