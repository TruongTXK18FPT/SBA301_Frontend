import { useEffect, useState } from "react";
import { PageEventOverviewResponse } from "./dto/event.dto";
import { useSearchParams } from "react-router-dom";
import { Pen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FaQuestionCircle } from "react-icons/fa";
import { getEvents } from "@/services/eventService";

const EventPrivateList = () => {
    const [events, setEvents] = useState<PageEventOverviewResponse>();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchName, setSearchName] = useState<string>("");

    // status, page, size
    const [searchParams, setSearchParams] = useSearchParams(
        {
            status: "PENDING",
            page: "0",
            size: "10",
            sortBy: "id",
            sortDirection: "DESC"
        }
    );

    const statusOptions = [
        { value: "PENDING", label: "Chờ duyệt", color: "bg-yellow-500" },
        { value: "UPCOMING", label: "Sắp diễn ra", color: "bg-blue-500" },
        { value: "ONGOING", label: "Đang diễn ra", color: "bg-green-500" },
        { value: "COMPLETED", label: "Đã hoàn thành", color: "bg-gray-500" },
        { value: "REJECTED", label: "Đã từ chối", color: "bg-red-500" },
    ];

    const handleSearch = () => {
        const newParams = new URLSearchParams(searchParams);
        if (searchName.trim()) {
            newParams.set('name', searchName.trim());
        } else {
            newParams.delete('name');
        }
        newParams.set('page', '0'); // Reset to first page when searching
        setSearchParams(newParams);
    };

    const handleStatusChange = (status: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('status', status);
        newParams.set('page', '0'); // Reset to first page when changing status
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    const currentPage = parseInt(searchParams.get('page') || '0');
    const currentStatus = searchParams.get('status') || 'PENDING';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await getEvents(searchParams);
                setEvents(response);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Đang tải sự kiện...</span>
            </div>
        );
    }

    return (
        <div className="!space-y-6">
            {/* Search and Filter Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm ">
                <div className="flex justify-between items-center">
                    {/* Name Search */}
                    <div className="flex-4/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sự kiện theo tên..."
                                value={searchName}
                                onChange={(e) => {setSearchName(e.target.value); handleSearch();}}
                                className="!w-[90%] h-12 !pl-10 !pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="!h-full">
                        <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full h-full bg-white border border-gray-300 rounded-lg text-gray-900 px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value} className={`text-${option.color}`}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            {/* Event List */}
            {events && events.numberOfElements > 0 ? (
                <ul className="!space-y-2">
                    {events.content.map(event => (
                        <li key={event.id} className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer" onClick={() => window.location.href = `/moderator/events/${event.id}`}>
                            <img
                                src={event.bannerUrl}
                                alt={event.name}
                                className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-700 text-lg mb-2">Không tìm thấy sự kiện</div>
                    <div className="text-gray-500 text-sm">
                        {searchParams.get('name')
                            ? `Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái.`
                            : `Không có sự kiện nào với trạng thái "${statusOptions.find(opt => opt.value === currentStatus)?.label}".`
                        }
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mt-6">
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                    <label className="text-gray-700 text-sm">Hiển thị:</label>
                    <select
                        value={searchParams.get('size') || '10'}
                        onChange={(e) => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('size', e.target.value);
                            newParams.set('page', '0');
                            setSearchParams(newParams);
                        }}
                        className="bg-white border border-gray-300 rounded text-gray-900 px-3 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div>
                    {/* Pagination */}
                    {events && events.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            {
                                currentPage > 0 && (
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                    </button>
                                )
                            }

                            <div className="flex space-x-1">
                                {Array.from({ length: Math.min(5, events.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (events.totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage < 3) {
                                        pageNum = i;
                                    } else if (currentPage >= events.totalPages - 2) {
                                        pageNum = events.totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${currentPage === pageNum
                                                ? '!bg-blue-600 text-white'
                                                : '!bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= events.totalPages - 1}
                                className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700"
                            >
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default EventPrivateList