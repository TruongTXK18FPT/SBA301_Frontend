import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventPublicDetailResponse } from './dto/event.dto';
import { ShowTimeResponse } from './dto/showtime.dto';
import './EventPublicDetail.css';
import '@/styles/MeetingSection.css';
import { getEventBySlug } from '@/services/eventService';
import { getMyOrders, OrderResponse } from '@/services/orderService';
import { JitsiMeeting } from '@jitsi/react-sdk';


const EventPublicDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventPublicDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedShowtime, setExpandedShowtime] = useState<number | null>(null);
  const [currentShowtime, setCurrentShowtime] = useState<ShowTimeResponse | null>(null);
  const [connectionCooldown, setConnectionCooldown] = useState<boolean>(false);
  const [userLeftMeeting, setUserLeftMeeting] = useState<boolean>(false);
  const [showJoinButton, setShowJoinButton] = useState<boolean>(false);
  const [hasValidTicket, setHasValidTicket] = useState<boolean>(false);
  const [ticketCheckLoading, setTicketCheckLoading] = useState<boolean>(false);
  const [shouldShowJitsi, setShouldShowJitsi] = useState<boolean>(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);
  const [meetingEnded, setMeetingEnded] = useState<boolean>(false);
  const [ticketCache, setTicketCache] = useState<Map<number, boolean>>(new Map());
  const [ordersCache, setOrdersCache] = useState<OrderResponse[]>([]);
  const [ordersCacheExpiry, setOrdersCacheExpiry] = useState<number>(0);

  const navigate = useNavigate();

  const toggleShowtime = (showtimeId: number) => {
    setExpandedShowtime(expandedShowtime === showtimeId ? null : showtimeId);
  };

  const cleanMeetingId = useCallback((meetingId: string): string => {
    const cleaned = meetingId.replace(/[^a-zA-Z0-9-]/g, '');
    return cleaned || 'default-room';
  }, []);

  const checkUserTicket = useCallback(async (showtimeId: number): Promise<boolean> => {
    // Check cache first
    const cacheKey = showtimeId;
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
    
    // If we have cached result and it's still valid, use it
    if (ticketCache.has(cacheKey) && ordersCacheExpiry > now) {
      console.log('🎫 Using cached ticket result for showtime:', showtimeId);
      const cachedResult = ticketCache.get(cacheKey) || false;
      setHasValidTicket(cachedResult);
      return cachedResult;
    }

    // If we're already checking, don't check again
    if (ticketCheckLoading) {
      console.log('🎫 Ticket check already in progress, skipping...');
      return hasValidTicket;
    }

    try {
      setTicketCheckLoading(true);
      const currentShowtime = event?.showtimes.find(st => st.id === showtimeId);
      if (!currentShowtime) {
        setHasValidTicket(false);
        setTicketCache(prev => new Map(prev.set(cacheKey, false)));
        return false;
      }

      const showtimeTicketIds = currentShowtime.tickets.map(ticket => ticket.id);
      
      // Use cached orders if still valid, otherwise fetch fresh
      let orders = ordersCache;
      if (ordersCacheExpiry <= now || ordersCache.length === 0) {
        console.log('🔄 Fetching fresh orders...');
        const ordersResponse = await getMyOrders({ 
          status: 'COMPLETED',
          size: 50 // Reduced size for faster response
        });
        orders = ordersResponse.content;
        setOrdersCache(orders);
        setOrdersCacheExpiry(now + CACHE_DURATION);
      } else {
        console.log('📦 Using cached orders');
      }

      const hasTicket = orders.some(order => 
        order.items.some(item => {
          const ticketId = typeof item.itemId === 'number' ? item.itemId : parseInt(String(item.itemId));
          return showtimeTicketIds.includes(ticketId);
        })
      );

      console.log('🎫 Ticket check completed:', { 
        showtimeId, 
        hasTicket, 
        ticketIds: showtimeTicketIds,
        cached: ordersCacheExpiry > now 
      });
      
      // Update cache
      setTicketCache(prev => new Map(prev.set(cacheKey, hasTicket)));
      setHasValidTicket(hasTicket);
      return hasTicket;
    } catch (error) {
      console.error('Error checking user ticket:', error);
      setHasValidTicket(false);
      setTicketCache(prev => new Map(prev.set(cacheKey, false)));
      return false;
    } finally {
      setTicketCheckLoading(false);
    }
  }, [event, ticketCheckLoading, hasValidTicket, ticketCache, ordersCache, ordersCacheExpiry]);

  const clearTicketCache = useCallback(() => {
    setTicketCache(new Map());
    setOrdersCache([]);
    setOrdersCacheExpiry(0);
    console.log('🗑️ Ticket cache cleared');
  }, []);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttempt;
    const minInterval = 30000; // 30 seconds minimum between attempts

    if (timeSinceLastAttempt < minInterval) {
      return false;
    }
    return true;
  }, [lastConnectionAttempt]);

  const checkCurrentShowtime = (showtimes: ShowTimeResponse[]) => {
    const now = new Date();
    return showtimes.find(showtime => {
      const startTime = new Date(showtime.startTime);
      const endTime = new Date(showtime.endTime);
      return now >= startTime && now <= endTime && showtime.meetingId;
    }) || null;
  };

  // Handle Jitsi meeting events
  const handleMeetingJoined = useCallback(() => {
    console.log('🎉 User joined the meeting');
    setShowJoinButton(false);
    setUserLeftMeeting(false);
    setShouldShowJitsi(true);
  }, []);

  const handleMeetingLeft = useCallback(() => {
    console.log('👋 User left the meeting');
    setUserLeftMeeting(true);
    setShowJoinButton(true);
    setLastConnectionAttempt(0); // Reset rate limit when user leaves
  }, []);

  const handleMeetingEnded = useCallback(() => {
    console.log('� Meeting ended');
    setMeetingEnded(true);
    setUserLeftMeeting(true);
    setShowJoinButton(false);
    setShouldShowJitsi(false);
  }, []);

  const handleJoinMeeting = useCallback(async () => {
    if (!currentShowtime?.meetingId) return;
    
    if (connectionCooldown || ticketCheckLoading) return;
    
    if (!checkRateLimit()) {
      alert('Vui lòng chờ trước khi thử lại.');
      return;
    }

    try {
      const hasTicket = await checkUserTicket(currentShowtime.id);
      if (hasTicket) {
        setLastConnectionAttempt(Date.now());
        setShouldShowJitsi(true);
        setShowJoinButton(false);
        
        // Set cooldown to prevent multiple rapid attempts
        setConnectionCooldown(true);
        setTimeout(() => setConnectionCooldown(false), 5000); // 5 second cooldown
      } else {
        alert('Bạn cần mua vé cho suất chiếu này để tham gia meeting.');
      }
    } catch (error) {
      console.error('Error in manual join:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }, [currentShowtime, connectionCooldown, ticketCheckLoading, checkRateLimit, checkUserTicket]);

  useEffect(() => {
    if (!event) return;

    const interval = setInterval(async () => {
      const activeShowtime = checkCurrentShowtime(event.showtimes);
      if (activeShowtime !== currentShowtime) {
        console.log('🔄 Showtime changed:', { 
          from: currentShowtime?.id, 
          to: activeShowtime?.id,
          hasMeetingId: !!activeShowtime?.meetingId 
        });
        
        setCurrentShowtime(activeShowtime);
        setShouldShowJitsi(false); // Reset Jitsi display
        
        if (activeShowtime && activeShowtime.meetingId && !userLeftMeeting) {
          console.log('🎯 New active showtime detected:', {
            showtimeId: activeShowtime.id,
            meetingId: activeShowtime.meetingId,
            userLeftMeeting
          });
          
          try {
            // Check ticket first, then initialize if valid
            const hasTicket = await checkUserTicket(activeShowtime.id);
            console.log('🎫 Ticket check result for showtime change:', hasTicket);
            
            if (hasTicket) {
              // Auto-show Jitsi for new showtime
              setTimeout(() => {
                console.log('⏰ Auto-showing Jitsi for new showtime...');
                setShouldShowJitsi(true);
              }, 1000);
            } else {
              setShowJoinButton(false);
            }
          } catch (error) {
            console.error('Error checking ticket for showtime change:', error);
            setShowJoinButton(false);
          }
        } else if (activeShowtime && activeShowtime.meetingId && userLeftMeeting) {
          // Only check if we don't have cached result
          if (!ticketCache.has(activeShowtime.id)) {
            try {
              const hasTicket = await checkUserTicket(activeShowtime.id);
              if (hasTicket) {
                setShowJoinButton(true);
              }
            } catch (error) {
              console.error('Error checking ticket for left meeting:', error);
            }
          } else if (ticketCache.get(activeShowtime.id)) {
            setShowJoinButton(true);
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [event, currentShowtime, userLeftMeeting, checkUserTicket, ticketCache]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!slug) {
          setEvent(null);
          setLoading(false);
          return;
        }
        const fetchedEvent = await getEventBySlug(slug);
        setEvent(fetchedEvent);
        setLoading(false);

        const activeShowtime = checkCurrentShowtime(fetchedEvent.showtimes);
        setCurrentShowtime(activeShowtime);

        // Only check ticket and potentially show Jitsi if we have an active showtime with meeting
        if (activeShowtime && activeShowtime.meetingId && !userLeftMeeting) {
          console.log('🎯 Checking ticket for active showtime:', {
            showtimeId: activeShowtime.id,
            meetingId: activeShowtime.meetingId
          });
          
          // Check if we already have cached result
          if (ticketCache.has(activeShowtime.id) && ordersCacheExpiry > Date.now()) {
            console.log('📦 Using cached ticket result for initial load');
            const cachedResult = ticketCache.get(activeShowtime.id) || false;
            setHasValidTicket(cachedResult);
            
            if (cachedResult) {
              setTimeout(() => {
                console.log('⏰ Auto-showing Jitsi from cache...');
                setShouldShowJitsi(true);
              }, 500);
            }
          } else {
            // Only fetch if no cache
            const hasTicket = await checkUserTicket(activeShowtime.id);
            console.log('🎫 Initial ticket check result:', hasTicket);
            
            if (hasTicket) {
              // Auto-show Jitsi for valid ticket holders
              setTimeout(() => {
                console.log('⏰ Auto-showing Jitsi after ticket validation...');
                setShouldShowJitsi(true);
              }, 1000);
            } else {
              // No ticket, just show the no-ticket message
              setShowJoinButton(false);
            }
          }
        } else if (activeShowtime && activeShowtime.meetingId && userLeftMeeting) {
          console.log('🔄 User previously left meeting, checking cached ticket for join button');
          if (ticketCache.has(activeShowtime.id)) {
            const cachedResult = ticketCache.get(activeShowtime.id) || false;
            if (cachedResult) {
              setShowJoinButton(true);
              setHasValidTicket(true);
            }
          } else {
            const hasTicket = await checkUserTicket(activeShowtime.id);
            if (hasTicket) {
              setShowJoinButton(true);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing event details:', error);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug, userLeftMeeting, checkUserTicket, ticketCache, ordersCacheExpiry]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      clearTicketCache();
    };
  }, [clearTicketCache]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-lg text-white">Đang tải...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-lg">Không tìm thấy sự kiện</div>
      </div>
    );
  }

  const earliestShowtime = event.showtimes?.length
    ? event.showtimes.reduce((earliest, current) =>
        new Date(current.startTime) < new Date(earliest.startTime) ? current : earliest
      )
    : null;

  const getLowestPrice = () => {
    if (!earliestShowtime?.tickets || earliestShowtime.tickets.length === 0) {
      return 800000;
    }
    return Math.min(...earliestShowtime.tickets.map(ticket => ticket.price));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="">
      <div className="bg-[#27272A]">
        <div className="relative flex !py-8 !px-4">
          <div className="flex-2/5 bg-[#38383D] rounded-l-3xl">
            <div className="flex flex-col justify-between !px-8 !py-10 h-full min-h-[100%]">
              <div className='!space-y-4'>
                <h1 className="!text-2xl font-bold text-white">{event.name}</h1>
                {earliestShowtime && (
                  <div className="flex items-center !space-x-2 mt-4">
                    <div className="bg-opacity-20 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-400 text-[16px] font-medium">
                        {formatTime(earliestShowtime.startTime)} - {formatTime(earliestShowtime.endTime)}, {formatDate(earliestShowtime.startTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="border-t border-white px-4 !pb-4">
                  <div className="flex items-baseline space-x-2 !mt-4">
                    <span className="text-white text-2xl font-bold">Giá từ</span>
                    <span className="text-green-400 text-2xl font-bold !pl-1">
                      {getLowestPrice().toLocaleString('vi-VN')}
                    </span>
                    <span className="text-green-400 font-bold text-2xl">đ</span>
                  </div>
                </div>
                <div className="px-4">
                  <button className="w-full !bg-[#2dc275] hover:bg-green-600 font-bold py-4 px-12 rounded-xl text-lg !text-white transition-colors duration-200 shadow-lg border-none">
                    <a href="#tickets" className='!text-white'>Mua vé ngay</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <svg className='absolute top-0 left-[40.08%] h-full' width="4" viewBox="0 0 4 415" fill="none" xmlns="http://www.w3.org/2000/svg" id="vertical-dashed">
            <path stroke="#27272A" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 10" d="M2 2v411"></path>
          </svg>
          <div className="absolute top-8 left-2/5 -translate-x-1/2 w-16 h-8 bg-[#27272A] rounded-b-full z-20"></div>
          <div className="absolute bottom-8 left-2/5 -translate-x-1/2 w-16 h-8 bg-[#27272A] rounded-t-full z-20"></div>
          <div className="flex-3/5">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt={event.name}
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">HỘI NGHỊ KHOA HỌC THẨM MỸ & TRIỂN LÂM</h2>
                    <div className="text-6xl font-bold mb-2">ASLS</div>
                    <div className="text-2xl">HÀ NỘI</div>
                    <div className="text-4xl font-bold">2025</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {currentShowtime && currentShowtime.meetingId && (
        <div className="bg-gray-100 !py-8 !px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-600 text-white !p-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold">Sự kiện đang diễn ra TRỰC TIẾP</h2>
                  </div>
                  {showJoinButton && hasValidTicket && (
                    <button
                      onClick={handleJoinMeeting}
                      className="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={connectionCooldown || ticketCheckLoading}
                    >
                      {ticketCheckLoading ? 'Đang kiểm tra...' : 'Tham gia lại meeting'}
                    </button>
                  )}
                </div>
                <p className="text-green-100 text-sm mt-1">
                  {formatTime(currentShowtime.startTime)} - {formatTime(currentShowtime.endTime)}, {formatDate(currentShowtime.startTime)}
                </p>
              </div>
              <div id="jitsi-container" className="w-full" style={{ minHeight: '500px' }}>
                {/* Always render container but show different content based on state */}
                {ticketCheckLoading ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang kiểm tra vé...</h3>
                      <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                  </div>
                ) : !hasValidTicket ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎫</div>
                      <h3 className="text-xl font-semibold text-red-600 mb-2">Cần mua vé để tham gia</h3>
                      <p className="text-gray-500 mb-4">
                        Bạn cần mua vé cho suất chiếu này để có thể tham gia meeting trực tuyến.
                      </p>
                      <button 
                        onClick={() => navigate(`/events/${slug}/showtimes/${currentShowtime.id}/tickets`)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Mua vé ngay
                      </button>
                    </div>
                  </div>
                ) : shouldShowJitsi && currentShowtime?.meetingId ? (
                  <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={cleanMeetingId(currentShowtime.meetingId)}
                    configOverwrite={{
                      prejoinPageEnabled: false,
                      startWithAudioMuted: true,
                      startWithVideoMuted: true,
                      disableDeepLinking: true,
                      enableWelcomePage: false,
                      enableClosePage: false,
                      resolution: 480,
                      constraints: {
                        video: {
                          aspectRatio: 16 / 9,
                          height: { ideal: 480, max: 720, min: 240 }
                        }
                      }
                    }}
                    interfaceConfigOverwrite={{
                      TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'chat', 'desktop', 'fullscreen',
                        'hangup', 'settings', 'videoquality', 'filmstrip'
                      ],
                      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                      DISABLE_PRESENCE_STATUS: true,
                      DISABLE_FOCUS_INDICATOR: true
                    }}
                    userInfo={{
                      email: '',
                      displayName: 'Event Participant'
                    }}
                    onApiReady={(externalApi) => {
                      console.log('🎉 Jitsi API ready');
                      
                      // Add event listeners
                      externalApi.addEventListeners({
                        videoConferenceJoined: handleMeetingJoined,
                        videoConferenceLeft: handleMeetingLeft,
                        readyToClose: handleMeetingEnded,
                        passwordRequired: () => {
                          if (currentShowtime?.meetingPassword) {
                            externalApi.executeCommand('password', currentShowtime.meetingPassword);
                          }
                        }
                      });
                    }}
                    getIFrameRef={(iframeRef) => {
                      if (iframeRef) {
                        iframeRef.style.height = '500px';
                        iframeRef.style.width = '100%';
                      }
                    }}
                  />
                ) : showJoinButton ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📹</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Meeting đã sẵn sàng</h3>
                      <p className="text-gray-500 mb-4">
                        Bạn đã rời khỏi meeting. Nhấn nút "Tham gia lại meeting" để tham gia lại.
                      </p>
                      <p className="text-sm text-gray-400">
                        Meeting ID: {currentShowtime.meetingId}
                        {currentShowtime.meetingPassword && (
                          <span className="block">Password: {currentShowtime.meetingPassword}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : hasValidTicket ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang chuẩn bị meeting...</h3>
                      <p className="text-gray-500 mb-4">Hệ thống đang thiết lập meeting cho bạn.</p>
                      <p className="text-sm text-gray-400">
                        Meeting ID: {currentShowtime.meetingId}
                        {currentShowtime.meetingPassword && (
                          <span className="block">Password: {currentShowtime.meetingPassword}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='flex bg-[#f5f7fc] !py-8 !px-4 !text-black'>
        <div className='flex-7/10'>
          <div className="bg-white rounded-lg !p-4">
            <div className="">
              <h2 className="text-xl font-bold">Giới thiệu</h2>
              <div className='border-t-1 border-gray-200 !my-2'></div>
              <div className="">
                <div dangerouslySetInnerHTML={{ __html: event.description || '' }} />
              </div>
            </div>
          </div>
          <div id="tickets" className='bg-[#27272A] rounded-lg !p-4 !mt-6 !space-y-1'>
            <h2 className="text-xl text-white font-bold !bg-[#27272A]">Thông tin vé</h2>
            {event.showtimes && event.showtimes.length > 0 ? (
              <div className="w-full">
                {event.showtimes.map((showtime) => (
                  <div key={showtime.id} className="border-0">
                    <button
                      onClick={() => toggleShowtime(showtime.id)}
                      className="w-full !bg-[#38383D] hover:bg-[#404048] p-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`transform transition-transform duration-200 ${expandedShowtime === showtime.id ? 'rotate-90' : ''}`}>
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className='flex grow-1 justify-between items-center'>
                          <span className="text-white font-medium">
                            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}, {formatDate(showtime.startTime)}
                          </span>
                          

                          { (showtime.endTime > new Date().toISOString() && !hasValidTicket) && (
                          <div onClick={(e) => {
                            e.stopPropagation(); // Prevent parent button click
                            navigate(`/events/${slug}/showtimes/${showtime.id}/tickets`);
                          }}>
                            <div className="w-full !bg-[#2dc275] hover:bg-green-600 font-bold !py-2 !px-8 rounded-xl text-lg text-white transition-colors duration-200 shadow-lg border-none cursor-pointer">
                              Mua vé
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedShowtime === showtime.id && (
                      <div className="bg-[#2D2D30] !p-4 divide-y odd:bg-[#2e2f32] even:bg-[#37373c]">
                        {showtime.tickets.map((ticket, index) => (
                          <div key={index} className="flex justify-between items-center py-2">
                            <span className="text-white">{ticket.name}</span>
                            <span className="text-green-400 font-medium">{ticket.price.toLocaleString('vi-VN')} đ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-6xl mx-auto px-8 py-8 text-center text-gray-500">
                Không có thông tin vé cho sự kiện này.
              </div>
            )}
          </div>
        </div>
        <div className='flex-3/10'>
        </div>
      </div>
    </div>
  );
};

export default EventPublicDetail;