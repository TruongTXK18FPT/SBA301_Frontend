import { useEffect, useState } from "react"
import { EventOverviewResponse } from "./dto/event.dto"
import { Link, useSearchParams } from "react-router-dom"
import axios from "axios"
import camelcaseKeys from "camelcase-keys"
import './EventPublicLayout.css'
import { getEvents } from "@/services/eventService"

const EventPublicLayout = () => {
  const [events, setEvents] = useState<EventOverviewResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search form state (for future implementation)
  // const [searchName, setSearchName] = useState<string>('')
  // const [fromDate, setFromDate] = useState<string>('')
  // const [toDate, setToDate] = useState<string>('')
  // const [status, setStatus] = useState<string>('')
  
  // Pagination state (for future implementation)
  // const [totalPages, setTotalPages] = useState<number>(0)
  // const [totalElements, setTotalElements] = useState<number>(0)
  // const [currentPage, setCurrentPage] = useState<number>(1)
  // const [pageSize, setPageSize] = useState<number>(9)

  const [searchParams] = useSearchParams()

  console.log('Current events:', events, 'Length:', events.length)

  // Handle search form submission (for future implementation)
  // const handleSearch = () => {
  //   const params = new URLSearchParams()
  //   if (searchName) params.set('q', searchName)
  //   if (fromDate) params.set('from', fromDate)
  //   if (toDate) params.set('to', toDate)
  //   if (status) params.set('status', status)
  //   params.set('page', '1') // Reset to first page
  //   params.set('size', pageSize.toString())
  //   setSearchParams(params)
  // }

  // Handle page change (for future implementation)
  // const handlePageChange = (page: number) => {
  //   const params = new URLSearchParams(searchParams)
  //   params.set('page', page.toString())
  //   setSearchParams(params)
  //   setCurrentPage(page)
  // }

  // Handle page size change (for future implementation)
  // const handlePageSizeChange = (size: number) => {
  //   const params = new URLSearchParams(searchParams)
  //   params.set('size', size.toString())
  //   params.set('page', '1') // Reset to first page
  //   setSearchParams(params)
  //   setPageSize(size)
  //   setCurrentPage(1)
  // }

  // Handle date range change (for future implementation)
  // const handleDateRangeChange = (fromDate: string, toDate: string) => {
  //   const params = new URLSearchParams(searchParams)
  //   if (fromDate) params.set('from', fromDate)
  //   else params.delete('from')
  //   if (toDate) params.set('to', toDate)
  //   else params.delete('to')
  //   params.set('page', '1') // Reset to first page
  //   setSearchParams(params)
  // }

  // Initialize form from URL params (for future implementation)
  // useEffect(() => {
  //   setSearchName(searchParams.get('q') || '')
  //   setFromDate(searchParams.get('from') || '')
  //   setToDate(searchParams.get('to') || '')
  //   setStatus(searchParams.get('status') || '')
  //   setCurrentPage(parseInt(searchParams.get('page') || '1', 10))
  //   setPageSize(parseInt(searchParams.get('size') || '9', 10))
  // }, [searchParams])

  useEffect(() => {
    getEvents({
      name: searchParams.get('q') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      organizerId: searchParams.get('organizerId') || undefined,
      moderatorId: searchParams.get('moderatorId') || undefined,
      status: searchParams.get('status') || 'UPCOMING',
      personalityTypes: searchParams.get('personalityTypes') || undefined,
      page: parseInt(searchParams.get('page') || '0', 10),  
      size: parseInt(searchParams.get('size') || '10', 10),
      sortBy: searchParams.get('sortBy') || undefined,
      sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc' || undefined
    })
      .then(response => {
        setEvents(response.content)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching events:", error)
        setError("Failed to load events")
        setLoading(false)
      })
  }, [])

  if (loading) {
    console.log('Rendering loading state')
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-lg text-white">Loading events...</div>
      </div>
    )
  }

  if (error) {
    console.log('Rendering error state:', error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    )
  }

  console.log('Component rendering, loading:', loading, 'error:', error, 'events:', events.length)
  console.log('About to render, events:', events, 'length:', events.length)

  // Fallback: if something goes wrong, at least show a basic page
  if (!loading && !error && events.length === 0) {
    console.log('No events found, showing fallback')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Khám phá sự kiện</h1>
            <p className="text-slate-400 text-lg">Tìm kiếm và tham gia những sự kiện thú vị nhất</p>
          </div>
          
        </div>
      </div>

      {/* Event Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              to={`/events/${event.slug}`}
              key={event.id}
              className="group block"
            >
              <div className="event-card bg-slate-800/50 border border-slate-700 overflow-hidden h-full rounded-lg transition-transform hover:scale-105">
                {/* Banner image */}
                <div className="relative w-full h-48 overflow-hidden">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.name}
                      className="w-full h-full object-cover "
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 leading-tight line-clamp-2">
                    {event.name}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-green-400 font-medium">
                      <span>
                        Từ {event.price ? event.price.toLocaleString('vi-VN') : '0'}đ
                      </span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <span>
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#calendar-order_svg__clip0_9730_14052)"><path fillRule="evenodd" clipRule="evenodd" d="M5.333 1.958c.369 0 .667.299.667.667v.667h4v-.667a.667.667 0 111.334 0v.667H12a2.667 2.667 0 012.667 2.666v8c0 .737-.597 1.334-1.333 1.334H2.667a1.333 1.333 0 01-1.333-1.334v-8A2.667 2.667 0 014 3.292h.667v-.667c0-.368.298-.667.667-.667zM10 4.625v.667a.667.667 0 101.334 0v-.667H12c.736 0 1.334.597 1.334 1.333v1.334H2.667V5.958c0-.736.597-1.333 1.333-1.333h.667v.667a.667.667 0 001.333 0v-.667h4zm-7.333 4h10.666v5.333H2.668V8.625z" fill="#fff"></path></g><defs><clipPath id="calendar-order_svg__clip0_9730_14052"><path fill="#fff" transform="translate(1.333 1.958)" d="M0 0h13.333v13.333H0z"></path></clipPath></defs></svg>
                      </span>
                      <span>
                        {event.startTime ? new Date(event.startTime).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'long', 
                          year: 'numeric'
                        }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

export default EventPublicLayout