import { useEffect, useState } from "react";
import { PageEventOverviewResponse } from "./dto/event.dto";
import { useSearchParams } from "react-router-dom";
import { Pen } from "lucide-react";
import { FaQuestionCircle } from "react-icons/fa";
import { getEvents } from "@/services/eventService";

const EventPrivateList = () => {
    const [events, setEvents] = useState<PageEventOverviewResponse>();
    
    // status, page, size
    const [searchParams, setSearchParams] = useSearchParams(
        {
            status: "PENDING",
            page: "0",
            size: "10"
        }
    );

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await getEvents(searchParams);
                setEvents(response);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, [searchParams]);

    if (!events) {
        return <div>Loading...</div>;
    }   

  return (
    <>
        {/* Status Filter */}
        <div>
            {/* Name search */}

            {/* Status */}
        </div>

        {/* Event List */}
        {
            events?.numberOfElements > 0 ? (
                <ul className="space-y-4">
                    {events.content.map(event => (
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