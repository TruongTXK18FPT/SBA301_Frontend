import { useEffect, useState } from "react";
import { EventOverviewResponse } from "./dto/event.dto";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Pen } from "lucide-react";
import camelcaseKeys from "camelcase-keys";
import { FaQuestionCircle } from "react-icons/fa";

const EventPrivateList = () => {
    const [events, setEvents] = useState<EventOverviewResponse[]>([]);
    
    // status, page, size
    const [searchParams, setSearchParams] = useSearchParams(
        {
            status: "PENDING",
            page: "0",
            size: "10"
        }
    );

    useEffect(() => {
        axios.get('http://localhost:8809/event/events', {
            params: {
                status: searchParams.get("status"),
                page: searchParams.get("page"),
                size: searchParams.get("size"),
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTkiLCJlbWFpbCI6InZ1aHNlMTgyNjkyQGZwdC5lZHUudm4iLCJzY29wZSI6IkFETUlOIn0.M8zMcrUYnIebJGC0HIrVhQOxp20VOaP7SKfLGSv-A2f8DumHHBh10tqCiRBMP_ateM8ftUQ4adVi1cZbVpI9PA
`
            }
        }).then(response => {
            setEvents(camelcaseKeys(response.data.content));
        }).catch(error => {
            console.error("Error fetching events:", error);
        });
    }, [searchParams]);

  return (
    <>
        {/* Status Filter */}
        <div>
            {/* Name search */}

            {/* Status */}
        </div>

        {/* Event List */}
        {
            events.length > 0 ? (
                <ul className="space-y-4">
                    {events.map(event => (
                        <li key={event.id} className="bg-[#31353e] rounded-xl !px-6 !py-4 flex gap-2">
                            <img src={event.bannerUrl} alt={event.name} className="w-[20%] object-cover rounded-lg" />
                            <div className="flex flex-col">
                                <span>{event.name}</span>
                                <span>{event.startTime}</span>
                            </div>
                            <Pen className="ml-auto cursor-pointer text-gray-400 hover:text-gray-200" 
                                 onClick={() => window.location.href = `/organizer/events/${event.id}`} />
                            <FaQuestionCircle
                                className="ml-2 cursor-pointer text-gray-400 hover:text-gray-200"
                                onClick={() => window.location.href = `/moderator/events/${event.id}`}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No events found.</p>
            )
        }
    </>
  )
}

export default EventPrivateList