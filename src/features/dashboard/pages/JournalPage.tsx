import DashboardLayout from "../components/DashboardLayout";
import OriginalJournalPage from "@/features/journal/pages/JournalPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JournalPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0">
            <CardTitle className="text-2xl font-bold">Journal</CardTitle>
            <p className="text-muted-foreground">
              Document your thoughts and track your emotional journey
            </p>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <OriginalJournalPage />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 