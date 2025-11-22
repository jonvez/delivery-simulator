import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Delivery Manager</h1>
          <p className="text-muted-foreground">
            shadcn/ui and Tailwind CSS Configuration Test
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Component Test</CardTitle>
            <CardDescription>
              Testing shadcn/ui components with Tailwind CSS styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Buttons</h3>
              <div className="flex gap-2 flex-wrap">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Button Sizes</h3>
              <div className="flex gap-2 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Badges</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Input</h3>
              <Input placeholder="Enter your email" type="email" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Tailwind Utility Classes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-primary text-primary-foreground rounded-md">
                  Primary
                </div>
                <div className="p-4 bg-secondary text-secondary-foreground rounded-md">
                  Secondary
                </div>
                <div className="p-4 bg-muted text-muted-foreground rounded-md">Muted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          ✅ Story 1.2: shadcn/ui and Tailwind CSS configured successfully
        </div>
      </div>
    </div>
  );
}

export default App;
