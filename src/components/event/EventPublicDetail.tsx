import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { EventPublicDetailResponse } from './dto/event.dto'
import { ShowTimeResponse } from './dto/showtime.dto'
import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'
import './EventPublicDetail.css'

// Declare Jitsi API
declare global {
  interface Window {
    JitsiMeetExternalAPI: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (domain: string, options: any): any;
    };
  }
}

const EventPublicDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [event, setEvent] = useState<EventPublicDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedShowtime, setExpandedShowtime] = useState<number | null>(null);
  const [currentShowtime, setCurrentShowtime] = useState<ShowTimeResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);
  const [connectionCooldown, setConnectionCooldown] = useState<boolean>(false);

  const toggleShowtime = (showtimeId: number) => {
    setExpandedShowtime(expandedShowtime === showtimeId ? null : showtimeId);
  };

  // Clean meeting ID to ensure it's valid for Jitsi
  const cleanMeetingId = (meetingId: string): string => {
    // Remove special characters and ensure it's alphanumeric with hyphens
    const cleaned = meetingId.replace(/[^a-zA-Z0-9-]/g, '');
    console.log('Original meeting ID:', meetingId);
    console.log('Cleaned meeting ID:', cleaned);
    return cleaned || 'default-room';
  };

  // Check rate limiting
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttempt;
    const minInterval = 30000; // 30 seconds minimum between attempts
    
    if (timeSinceLastAttempt < minInterval) {
      console.log(`Rate limit: ${Math.ceil((minInterval - timeSinceLastAttempt) / 1000)}s remaining`);
      return false;
    }
    
    return true;
  }, [lastConnectionAttempt]);

  // Check if any showtime is currently happening
  const checkCurrentShowtime = (showtimes: ShowTimeResponse[]) => {
    const now = new Date();
    console.log('Checking current showtime at:', now);
    
    for (const showtime of showtimes) {
      const startTime = new Date(showtime.startTime);
      const endTime = new Date(showtime.endTime);
      
      console.log(`Showtime ${showtime.id}: ${startTime} - ${endTime}, meetingId: ${showtime.meetingId}`);
      console.log(`Is active: ${now >= startTime && now <= endTime && showtime.meetingId}`);
      
      if (now >= startTime && now <= endTime && showtime.meetingId) {
        console.log('Found active showtime:', showtime);
        return showtime;
      }
    }
    console.log('No active showtime found');
    return null;
  };

  // Wait for Jitsi API to be available
  const waitForJitsiAPI = useCallback((callback: () => void, maxRetries = 20, retryCount = 0) => {
    console.log('Checking for JitsiMeetExternalAPI...', {
      windowJitsi: window.JitsiMeetExternalAPI,
      retryCount,
      maxRetries
    });
    
    if (window.JitsiMeetExternalAPI && typeof window.JitsiMeetExternalAPI === 'function') {
      console.log('JitsiMeetExternalAPI is available and ready');
      callback();
    } else if (retryCount < maxRetries) {
      console.log(`JitsiMeetExternalAPI not ready, retrying... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => waitForJitsiAPI(callback, maxRetries, retryCount + 1), 1000);
    } else {
      console.error('JitsiMeetExternalAPI failed to load after maximum retries');
      console.log('Available on window:', Object.keys(window).filter(key => key.toLowerCase().includes('jitsi')));
    }
  }, []);

  // Create Jitsi Meeting
  const createJitsiMeeting = useCallback((meetingId: string, meetingPassword?: string) => {
    console.log('=== Creating Jitsi Meeting ===');
    
    // Check rate limiting
    if (!checkRateLimit()) {
      console.log('❌ Rate limited - too many connection attempts');
      setConnectionCooldown(true);
      setTimeout(() => setConnectionCooldown(false), 30000);
      return;
    }
    
    // Update last attempt time
    setLastConnectionAttempt(Date.now());
    
    // Clean the meeting ID
    const cleanedMeetingId = cleanMeetingId(meetingId);
    console.log('Meeting ID:', meetingId);
    console.log('Cleaned Meeting ID:', cleanedMeetingId);
    console.log('Password:', meetingPassword);
    console.log('JitsiMeetExternalAPI available:', !!window.JitsiMeetExternalAPI);
    console.log('JitsiMeetExternalAPI type:', typeof window.JitsiMeetExternalAPI);
    
    // Dispose existing API first
    if (jitsiApi) {
      console.log('Disposing existing Jitsi API');
      try {
        jitsiApi.dispose();
      } catch (error) {
        console.error('Error disposing existing API:', error);
      }
      setJitsiApi(null);
    }

    // Check if JitsiMeetExternalAPI is available
    if (!window.JitsiMeetExternalAPI) {
      console.error('JitsiMeetExternalAPI is not available on window object');
      console.log('Available window properties with "jitsi":', Object.keys(window).filter(key => key.toLowerCase().includes('jitsi')));
      return;
    }

    if (typeof window.JitsiMeetExternalAPI !== 'function') {
      console.error('JitsiMeetExternalAPI is not a function, type:', typeof window.JitsiMeetExternalAPI);
      return;
    }

    // Get container element
    const container = document.querySelector('#jitsi-container');
    if (!container) {
      console.error('Jitsi container (#jitsi-container) not found in DOM');
      return;
    }

    // Clear container
    container.innerHTML = '';
    console.log('Container cleared, creating Jitsi meeting...');

    try {
      // Follow exact documentation format
      const domain = 'meet.jit.si';
            
      const options = {
        roomName: cleanedMeetingId, // Use cleaned meeting ID
        width: '100%',
        height: 500,
        parentNode: container,
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          resolution: 480, // Lower resolution to reduce load
          constraints: {
            video: {
              aspectRatio: 16 / 9,
              height: {
                ideal: 480,
                max: 720,
                min: 240
              }
            }
          }
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'chat', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'settings', 'videoquality'
          ],
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          DISABLE_PRESENCE_STATUS: true,
          DISABLE_FOCUS_INDICATOR: true
        },
        userInfo: {
          email: '',
          displayName: 'Event Participant'
        }
      };

      console.log('Creating JitsiMeetExternalAPI with options:', options);
      console.log('Original meeting ID:', meetingId);
      
      // Create the API exactly as in documentation
      const api = new window.JitsiMeetExternalAPI(domain, options);
      
      console.log('✅ Jitsi API created successfully:', api);

      // Add comprehensive event listeners for debugging
      api.addEventListener('readyToClose', () => {
        console.log('Jitsi: Ready to close event');
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('videoConferenceJoined', (data: any) => {
        console.log('✅ User joined the video conference:', data);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('videoConferenceLeft', (data: any) => {
        console.log('User left the video conference:', data);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('participantJoined', (data: any) => {
        console.log('Participant joined:', data);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('participantLeft', (data: any) => {
        console.log('Participant left:', data);
      });

      // Add error event listeners
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('connectionFailed', (data: any) => {
        console.error('❌ Jitsi connection failed:', data);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('conferenceError', (data: any) => {
        console.error('❌ Jitsi conference error:', data);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('setupFailed', (data: any) => {
        console.error('❌ Jitsi setup failed:', data);
      });

      // Add loading and ready events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('frameReady', (data: any) => {
        console.log('✅ Jitsi frame ready:', data);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.addEventListener('conferenceJoined', (data: any) => {
        console.log('✅ Conference joined:', data);
      });

      // Handle password if provided
      if (meetingPassword) {
        console.log('Setting up password for meeting');
        api.addEventListener('passwordRequired', () => {
          console.log('Password required, setting password:', meetingPassword);
          api.executeCommand('password', meetingPassword);
        });
      }

      // Store API reference
      setJitsiApi(api);

    } catch (error) {
      console.error('❌ Error creating Jitsi meeting:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  }, [jitsiApi, checkRateLimit]);

  // Initialize Jitsi Meet
  const initializeJitsi = useCallback(async (meetingId: string, meetingPassword?: string) => {
    console.log('=== Initializing Jitsi ===');
    console.log('Meeting ID:', meetingId);
    console.log('Password:', meetingPassword);
    
    // Since script is already in HTML, check if API is available
    if (window.JitsiMeetExternalAPI) {
      console.log('✅ JitsiMeetExternalAPI is available, creating meeting immediately');
      createJitsiMeeting(meetingId, meetingPassword);
    } else {
      console.log('❌ JitsiMeetExternalAPI not available, waiting...');
      
      // Wait for API to be available (script might still be loading)
      let retries = 0;
      const maxRetries = 10;
      
      const checkApi = () => {
        retries++;
        console.log(`Checking API availability... attempt ${retries}/${maxRetries}`);
        
        if (window.JitsiMeetExternalAPI) {
          console.log('✅ JitsiMeetExternalAPI is now available!');
          createJitsiMeeting(meetingId, meetingPassword);
        } else if (retries < maxRetries) {
          console.log('Still waiting for JitsiMeetExternalAPI...');
          setTimeout(checkApi, 1000);
        } else {
          console.error('❌ JitsiMeetExternalAPI failed to load after maximum retries');
          console.log('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('jitsi')));
        }
      };
      
      checkApi();
    }
  }, [createJitsiMeeting]);

  // Cleanup Jitsi on unmount
  useEffect(() => {
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [jitsiApi]);

  // Check for active showtimes periodically
  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const activeShowtime = checkCurrentShowtime(event.showtimes);
      
      // If showtime status changed
      if ((!currentShowtime && activeShowtime) || (currentShowtime && !activeShowtime) || 
          (currentShowtime && activeShowtime && currentShowtime.id !== activeShowtime.id)) {
        
        setCurrentShowtime(activeShowtime);
        
        // Dispose current meeting and start new one if needed
        if (jitsiApi) {
          jitsiApi.dispose();
          setJitsiApi(null);
        }
        
        if (activeShowtime && activeShowtime.meetingId) {
          setTimeout(() => {
            initializeJitsi(activeShowtime.meetingId!, activeShowtime.meetingPassword);
          }, 500);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [event, currentShowtime, jitsiApi, initializeJitsi]);

  useEffect(() => {
    axios.get(`http://localhost:8809/event/events/slug/${slug}`)
      .then(response => {
        const fetchedEvent = camelcaseKeys(response.data, { deep: true }) as EventPublicDetailResponse;
        setEvent(fetchedEvent);
        
        // Check if any showtime is currently happening
        const activeShowtime = checkCurrentShowtime(fetchedEvent.showtimes);
        console.log('Active showtime found on load:', activeShowtime);
        setCurrentShowtime(activeShowtime);
        
        // Initialize Jitsi if there's an active showtime
        if (activeShowtime && activeShowtime.meetingId) {
          console.log('Initializing Jitsi on load with meeting ID:', activeShowtime.meetingId);
          setTimeout(() => {
            initializeJitsi(activeShowtime.meetingId!, activeShowtime.meetingPassword);
          }, 1000); // Give a bit more time for the DOM to be ready
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch event details:", error);
        setEvent(null);
        setLoading(false);
      });
  }, [slug, initializeJitsi]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-lg text-white">Đang tải...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-lg">Không tìm thấy sự kiện</div>
      </div>
    )
  }

  // Get the earliest showtime for display
  const earliestShowtime = event.showtimes && event.showtimes.length > 0
    ? event.showtimes.reduce((earliest, current) =>
      new Date(current.startTime) < new Date(earliest.startTime) ? current : earliest
    )
    : null;

  // Get the cheapest ticket price from the earliest showtime
  const getLowestPrice = () => {
    if (!earliestShowtime?.tickets || earliestShowtime.tickets.length === 0) {
      return 800000; // Default price
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
      {/* Hero Section */}
      <div className="bg-[#27272A]">
        <div className="relative flex !py-8 !px-4">
          {/* Left Side - Event Info */}
          <div className="flex-2/5 bg-[#38383D] rounded-l-3xl">
            <div className="flex flex-col justify-between !px-8 !py-10 h-full min-h-[100%]">
              {/* Top - Event Info */}
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

              {/* Bottom - Price and Button */}
              <div >
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
                  <button className="w-full !bg-[#2dc275] hover:bg-green-600 font-bold py-4 px-12 rounded-xl text-lg text-white transition-colors duration-200 shadow-lg border-none">
                    Mua vé ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

          <svg className='absolute top-0 left-[40.08%] h-full' width="4" viewBox="0 0 4 415" fill="none" xmlns="http://www.w3.org/2000/svg" id="vertical-dashed"><path stroke="#27272A" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 10" d="M2 2v411"></path></svg>

          {/* Top Moon Cutout */}
          <div className="absolute top-8 left-2/5 -translate-x-1/2 w-16 h-8 bg-[#27272A] rounded-b-full z-20"></div>

          {/* Bottom Moon Cutout */}
          <div className="absolute bottom-8 left-2/5 -translate-x-1/2 w-16 h-8 bg-[#27272A] rounded-t-full z-20"></div>


          {/* Right Side - Event Banner */}
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

      {/* Live Meeting Section */}
      {currentShowtime && currentShowtime.meetingId && (
        <div className="bg-gray-100 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-600 text-white p-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold">Sự kiện đang diễn ra TRỰC TIẾP</h2>
                  </div>
                  <button 
                    onClick={async () => {
                      console.log('Manual Jitsi init button clicked');
                      console.log('Current showtime:', currentShowtime);
                      
                      if (connectionCooldown) {
                        alert('Đang trong thời gian chờ. Vui lòng thử lại sau 30 giây.');
                        return;
                      }
                      
                      if (!checkRateLimit()) {
                        alert('Vui lòng chờ trước khi thử lại.');
                        return;
                      }
                      
                      if (currentShowtime?.meetingId) {
                        await initializeJitsi(currentShowtime.meetingId, currentShowtime.meetingPassword);
                      }
                    }}
                    className="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={connectionCooldown}
                  >
                    {connectionCooldown ? 'Đang chờ...' : 'Tham gia meeting'}
                  </button>
                </div>
                <p className="text-green-100 text-sm mt-1">
                  {formatTime(currentShowtime.startTime)} - {formatTime(currentShowtime.endTime)}, {formatDate(currentShowtime.startTime)}
                </p>
                <p className="text-green-100 text-xs mt-1">
                  Meeting ID: {currentShowtime.meetingId}
                  {currentShowtime.meetingPassword && ` | Password: ${currentShowtime.meetingPassword}`}
                </p>
              </div>
              <div id="jitsi-container" className="w-full" style={{ minHeight: '500px' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Section - Remove in production */}
      <div className="bg-yellow-100 p-4 border-l-4 border-yellow-500">
        <h3 className="font-bold text-yellow-800">Debug Info (Remove in production)</h3>
        <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Current Showtime:</strong> {currentShowtime ? `ID: ${currentShowtime.id}, Meeting: ${currentShowtime.meetingId}` : 'None'}</p>
        <p><strong>Jitsi API Available:</strong> {window.JitsiMeetExternalAPI ? 'Yes' : 'No'}</p>
        <p><strong>Jitsi API Type:</strong> {typeof window.JitsiMeetExternalAPI}</p>
        <p><strong>Jitsi API Instance:</strong> {jitsiApi ? 'Created' : 'None'}</p>
        <p><strong>Jitsi Script in DOM:</strong> {document.querySelector('script[src*="jitsi"]') ? 'Yes' : 'No'}</p>
        <p><strong>Connection Cooldown:</strong> {connectionCooldown ? 'Active (30s)' : 'Ready'}</p>
        <p><strong>Last Attempt:</strong> {lastConnectionAttempt ? new Date(lastConnectionAttempt).toLocaleTimeString() : 'Never'}</p>
        
        {/* Test button */}
        <button
          onClick={() => {
            console.log('=== Manual Debug Test ===');
            
            if (connectionCooldown) {
              console.log('❌ Connection is in cooldown period');
              alert('Connection is in cooldown. Please wait 30 seconds between attempts.');
              return;
            }
            
            if (!checkRateLimit()) {
              console.log('❌ Rate limited');
              alert('Rate limited. Please wait before trying again.');
              return;
            }
            
            console.log('Window object keys with "jitsi":', Object.keys(window).filter(key => key.toLowerCase().includes('jitsi')));
            console.log('JitsiMeetExternalAPI:', window.JitsiMeetExternalAPI);
            console.log('Type of JitsiMeetExternalAPI:', typeof window.JitsiMeetExternalAPI);
            console.log('Script tag exists:', !!document.querySelector('script[src*="jitsi"]'));
            console.log('Container exists:', !!document.querySelector('#jitsi-container'));
            
            // Test with current showtime or hardcoded ID
            const testMeetingId = currentShowtime?.meetingId || 'test-meeting-room-123';
            const testPassword = currentShowtime?.meetingPassword;
            
            console.log('Testing with Meeting ID:', testMeetingId);
            console.log('Testing with Password:', testPassword);
            
            // Direct API call without async wrapper
            if (window.JitsiMeetExternalAPI) {
              console.log('Direct API call - JitsiMeetExternalAPI is available');
              createJitsiMeeting(testMeetingId, testPassword);
            } else {
              console.log('Direct API call - JitsiMeetExternalAPI NOT available');
              // Try initializing
              initializeJitsi(testMeetingId, testPassword);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 mr-2"
          disabled={connectionCooldown}
        >
          {connectionCooldown ? 'Cooldown...' : 'Debug & Test Jitsi'}
        </button>
        
        <button
          onClick={() => {
            if (jitsiApi) {
              jitsiApi.dispose();
              setJitsiApi(null);
              console.log('Jitsi API disposed');
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded mt-2"
        >
          Dispose Jitsi
        </button>
        
        {event?.showtimes && (
          <div>
            <strong>All Showtimes:</strong>
            {event.showtimes.map(st => (
              <div key={st.id} className="ml-4 text-sm">
                ID: {st.id}, Start: {new Date(st.startTime).toLocaleString()}, End: {new Date(st.endTime).toLocaleString()}, Meeting: {st.meetingId || 'None'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Description */}
      <div className='flex bg-[#f5f7fc] !py-8 !px-4'>
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

          {/* Ticket Information */}
          <div className='bg-[#27272A] rounded-lg !p-4 !mt-6 !space-y-1' id='ticket-info'>
            <h2 className="text-xl text-white font-bold bg-[#27272A]">Thông tin vé</h2>
            {
              event.showtimes && event.showtimes.length > 0 ? (
                <div className="w-full">
                  {event.showtimes.map((showtime) => (
                    <div key={showtime.id} className="border-0">
                      <button
                        onClick={() => toggleShowtime(showtime.id)}
                        className="w-full bg-[#38383D] hover:bg-[#404048] p-4 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 w-full justify-start">
                          <div className={`transform transition-transform duration-200 ${
                            expandedShowtime === showtime.id ? 'rotate-90' : ''
                          }`}>
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <span className="text-white font-medium">
                            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}, {formatDate(showtime.startTime)}
                          </span>
                        </div>
                      </button>

                      {expandedShowtime === showtime.id && (
                        <div className="mt-2 bg-[#2D2D30] p-4 rounded-lg">
                          {showtime.tickets.map((ticket, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
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

        {/* Ad */}
        <div className='flex-3/10'>

        </div>
      </div>
    </div>
  )
}

export default EventPublicDetail