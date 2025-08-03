import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            <p className="text-sm text-muted-foreground">
                Manage your account settings, integrations, and subscription.
            </p>
        </div>
        <Tabs defaultValue="profile">
            <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="ai-tone">AI Tone</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
                <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                    Update your personal information here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Ada Lovelace" />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="ada@example.com" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Changes</Button>
                </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="integrations">
                <Card>
                <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>
                    Connect your social media accounts to Aether Assistant.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg">Facebook</CardTitle>
                             <Switch defaultChecked />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Connected as "My Awesome Page".</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg">Instagram</CardTitle>
                             <Switch />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Connect your Instagram for Business account.</p>
                        </CardContent>
                    </Card>
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="ai-tone">
                <Card>
                <CardHeader>
                    <CardTitle>AI Tone & Behavior</CardTitle>
                    <CardDescription>
                    Customize how your AI assistant communicates with customers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="ai-tone-select">Response Tone</Label>
                     <Select defaultValue="friendly">
                        <SelectTrigger id="ai-tone-select">
                            <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="friendly">Friendly & Casual</SelectItem>
                            <SelectItem value="professional">Professional & Formal</SelectItem>
                            <SelectItem value="neutral">Neutral & Direct</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic & Upbeat</SelectItem>
                        </SelectContent>
                        </Select>
                   </div>
                </CardContent>
                <CardFooter>
                    <Button>Save AI Settings</Button>
                </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="subscription">
                <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                    Manage your billing information and subscription plan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-medium">Current Plan: <span className="text-primary">Pro</span></p>
                        <p className="text-sm text-muted-foreground">Your plan renews on July 31, 2024.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Manage Subscription</Button>
                </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
