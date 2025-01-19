import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  description?: string;
}

const Dashboard = () => {
  const { googleToken, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', selectedDate],
    queryFn: async () => {
      if (!googleToken) return [];
      
      const timeMin = new Date(selectedDate || new Date());
      timeMin.setHours(0, 0, 0, 0);
      
      const timeMax = new Date(timeMin);
      timeMax.setDate(timeMax.getDate() + 1);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&orderBy=startTime&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      return data.items as CalendarEvent[];
    },
    enabled: !!googleToken,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Calendar Events</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-[300px,1fr] gap-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-google-blue" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No events found for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    events?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.summary}</TableCell>
                        <TableCell>
                          {format(new Date(event.start.dateTime), 'h:mm a')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(event.end.dateTime), 'h:mm a')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {event.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;