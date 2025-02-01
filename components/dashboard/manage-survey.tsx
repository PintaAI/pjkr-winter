"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SurveyData {
  id: string;
  createdAt: string;
  howDidYouKnow: string;
  eventRating: number;
  foodRating: number;
  serviceRating: number;
  merchandiseRating: number;
  feedback?: string;
}

interface SourceStats {
  [key: string]: number;
}

interface RatingDistribution {
  [key: number]: number;
}

export function ManageSurvey() {
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgEventRating: 0,
    avgFoodRating: 0,
    avgServiceRating: 0,
    avgMerchandiseRating: 0,
    sourceStats: {} as SourceStats,
    ratingDistribution: {
      event: {} as RatingDistribution,
      food: {} as RatingDistribution,
      service: {} as RatingDistribution,
      merchandise: {} as RatingDistribution,
    },
  });

  const calculateStats = (surveys: SurveyData[]) => {
    if (surveys.length === 0) return;

    // Calculate averages
    const avgEvent = surveys.reduce((acc, curr) => acc + curr.eventRating, 0) / surveys.length;
    const avgFood = surveys.reduce((acc, curr) => acc + curr.foodRating, 0) / surveys.length;
    const avgService = surveys.reduce((acc, curr) => acc + curr.serviceRating, 0) / surveys.length;
    const avgMerchandise = surveys.reduce((acc, curr) => acc + curr.merchandiseRating, 0) / surveys.length;

    // Calculate source distribution
    const sourceStats = surveys.reduce((acc, curr) => {
      acc[curr.howDidYouKnow] = (acc[curr.howDidYouKnow] || 0) + 1;
      return acc;
    }, {} as SourceStats);

    // Calculate rating distributions
    const ratingDistribution = {
      event: {} as RatingDistribution,
      food: {} as RatingDistribution,
      service: {} as RatingDistribution,
      merchandise: {} as RatingDistribution,
    };

    surveys.forEach((survey) => {
      ratingDistribution.event[survey.eventRating] = (ratingDistribution.event[survey.eventRating] || 0) + 1;
      ratingDistribution.food[survey.foodRating] = (ratingDistribution.food[survey.foodRating] || 0) + 1;
      ratingDistribution.service[survey.serviceRating] = (ratingDistribution.service[survey.serviceRating] || 0) + 1;
      ratingDistribution.merchandise[survey.merchandiseRating] = (ratingDistribution.merchandise[survey.merchandiseRating] || 0) + 1;
    });

    setStats({
      avgEventRating: Number(avgEvent.toFixed(1)),
      avgFoodRating: Number(avgFood.toFixed(1)),
      avgServiceRating: Number(avgService.toFixed(1)),
      avgMerchandiseRating: Number(avgMerchandise.toFixed(1)),
      sourceStats,
      ratingDistribution,
    });
  };

  const fetchSurveys = async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) setLoading(true);
      
      const response = await fetch("/api/survey/list");
      if (!response.ok) throw new Error("Failed to fetch surveys");
      const data = await response.json();
      
      setSurveys(data.surveys);
      calculateStats(data.surveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setError("Failed to fetch surveys");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/survey/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete survey");
      }

      // Refetch surveys without showing loading state
      await fetchSurveys(false);
    } catch (error) {
      console.error("Error deleting survey:", error);
      setError("Failed to delete survey");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-accent fill-accent" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );

  const renderSourceDistribution = () => {
    const total = Object.values(stats.sourceStats).reduce((a, b) => a + b, 0);
    return (
      <div className="space-y-2">
        {Object.entries(stats.sourceStats).map(([source, count]) => (
          <div key={source} className="flex items-center gap-2">
            <div className="w-24 text-sm">{source}</div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
            <div className="w-12 text-sm text-right">{((count / total) * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading survey data...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (surveys.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">No survey responses yet</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Survey Results Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Average Event Rating</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{stats.avgEventRating}</p>
              {renderStars(Math.round(stats.avgEventRating))}
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Average Food Rating</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{stats.avgFoodRating}</p>
              {renderStars(Math.round(stats.avgFoodRating))}
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Average Service Rating</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{stats.avgServiceRating}</p>
              {renderStars(Math.round(stats.avgServiceRating))}
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Average Merchandise Rating</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{stats.avgMerchandiseRating}</p>
              {renderStars(Math.round(stats.avgMerchandiseRating))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Source Distribution</h3>
          {renderSourceDistribution()}
        </div>

        <div className="rounded-md border mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Food</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Merchandise</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell>
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{survey.howDidYouKnow}</TableCell>
                  <TableCell>{renderStars(survey.eventRating)}</TableCell>
                  <TableCell>{renderStars(survey.foodRating)}</TableCell>
                  <TableCell>{renderStars(survey.serviceRating)}</TableCell>
                  <TableCell>{renderStars(survey.merchandiseRating)}</TableCell>
                  <TableCell className="max-w-[300px] whitespace-pre-wrap">
                    {survey.feedback || "-"}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => setDeletingId(survey.id)}
                          className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Survey Response</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this survey response? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(survey.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
