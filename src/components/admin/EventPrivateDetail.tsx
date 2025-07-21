import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, approveEvent, rejectEvent } from '../../services/eventService';
import { EventPrivateDetailResponse } from '../event/dto/event.dto';
import Alert from '../Alert';
import LoadingSpinner from '../LoadingSpinner';
import '../../styles/EventCreationForm.css';
import '../../styles/EventPrivateDetail.css';

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const EventPrivateDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventPrivateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadEventData = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const response = await getEventById(parseInt(eventId));
      setEvent(response);
    } catch (error) {
      console.error('Error loading event:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const handleEditClick = () => {
    navigate(`/event-manager/edit-event/${eventId}`);
  };

  const handleApprove = async () => {
    if (!event) return;
    
    try {
      setLoading(true);
      await approveEvent(event.id, { notes: 'Approved by admin' });
      console.log('Event approved');
      await loadEventData();
      setAlert({
        type: 'success',
        message: 'Event approved successfully!'
      });
    } catch (error) {
      console.error('Error approving event:', error);
      setAlert({
        type: 'error',
        message: 'Failed to approve event. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!event || !rejectionReason.trim()) return;
    
    try {
      setLoading(true);
      await rejectEvent(event.id, { notes: rejectionReason });
      console.log('Event rejected with reason:', rejectionReason);
      await loadEventData();
      setAlert({
        type: 'success',
        message: 'Event rejected successfully!'
      });
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting event:', error);
      setAlert({
        type: 'error',
        message: 'Failed to reject event. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="event-creation-form">
        <div className="event-creation-form__container">
          <div className="event-creation-form__header">
            <h1 className="event-creation-form__title">Event Details</h1>
            <button
              className="event-creation-form__btn event-creation-form__btn--secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
          <div className="event-creation-form__error">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-creation-form">
        <div className="event-creation-form__container">
          <div className="event-creation-form__header">
            <h1 className="event-creation-form__title">Event Details</h1>
            <button
              className="event-creation-form__btn event-creation-form__btn--secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
          <div className="event-creation-form__error">
            <p>Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-creation-form">
      <div className="event-creation-form__container">
        {/* Header */}
        <div className="event-creation-form__header">
          <h1 className="event-creation-form__title">Event Details</h1>
          <div className="event-creation-form__admin-actions">
            <span className={`badge ${event.status === 'PENDING' ? 'badge-pending' : 
              event.status === 'UPCOMING' ? 'badge-approved' : 'badge-rejected'}`}>
              {event.status}
            </span>
            <button
              className="event-creation-form__btn event-creation-form__btn--secondary"
              onClick={handleEditClick}
            >
              Edit Event
            </button>
            <button
              className="event-creation-form__btn event-creation-form__btn--success"
              onClick={handleApprove}
              disabled={loading}
            >
              Approve
            </button>
            <button
              className="event-creation-form__btn event-creation-form__btn--danger"
              onClick={() => setShowRejectDialog(true)}
              disabled={loading}
            >
              Reject
            </button>
            <button
              className="event-creation-form__btn event-creation-form__btn--secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Tab Navigation */}
        <div className="event-creation-form__tabs">
          <button
            className={`event-creation-form__tab ${activeTab === 'details' ? 'event-creation-form__tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Event Details
          </button>
          <button
            className={`event-creation-form__tab ${activeTab === 'tickets' ? 'event-creation-form__tab--active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            Tickets
          </button>
          <button
            className={`event-creation-form__tab ${activeTab === 'payment' ? 'event-creation-form__tab--active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            Payment
          </button>
        </div>

        {/* Tab Content */}
        <div className="event-creation-form__content">
          {activeTab === 'details' && (
            <div className="event-creation-form__section">
              <h2 className="event-creation-form__section-title">Event Information</h2>
              
              <div className="event-creation-form__grid">
                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Event Name</label>
                  <div className="event-creation-form__display">
                    {event.name}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Event Slug</label>
                  <div className="event-creation-form__display">
                    {event.slug}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Status</label>
                  <div className="event-creation-form__display">
                    {event.status}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Organizer ID</label>
                  <div className="event-creation-form__display">
                    {event.organizerId || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Moderator ID</label>
                  <div className="event-creation-form__display">
                    {event.moderatorId || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Personality Types</label>
                  <div className="event-creation-form__display">
                    {event.personalityTypes || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Created At</label>
                  <div className="event-creation-form__display">
                    {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Updated At</label>
                  <div className="event-creation-form__display">
                    {event.updatedAt ? new Date(event.updatedAt).toLocaleDateString() : 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field event-creation-form__field--full">
                  <label className="event-creation-form__label">Description</label>
                  <div className="event-creation-form__display">
                    {event.description || 'No description provided'}
                  </div>
                </div>

                {event.notes && (
                  <div className="event-creation-form__field event-creation-form__field--full">
                    <label className="event-creation-form__label">Notes</label>
                    <div className="event-creation-form__display">
                      {event.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="event-creation-form__field">
                <label className="event-creation-form__label">Event Banner</label>
                <div className="event-creation-form__image-container">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.name}
                      className="event-creation-form__image-preview"
                    />
                  ) : (
                    <div className="event-creation-form__no-image">
                      No banner uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="event-creation-form__section">
              <h2 className="event-creation-form__section-title">Showtimes & Tickets</h2>
              
              {event.showtimes && event.showtimes.length > 0 ? (
                event.showtimes.map((showtime, index) => (
                  <div key={showtime.id} className="event-creation-form__showtime">
                    <h3 className="event-creation-form__section-title">
                      Showtime {index + 1}
                    </h3>
                    
                    <div className="event-creation-form__grid">
                      <div className="event-creation-form__field">
                        <label className="event-creation-form__label">Start Time</label>
                        <div className="event-creation-form__display">
                          {new Date(showtime.startTime).toLocaleString()}
                        </div>
                      </div>

                      <div className="event-creation-form__field">
                        <label className="event-creation-form__label">End Time</label>
                        <div className="event-creation-form__display">
                          {new Date(showtime.endTime).toLocaleString()}
                        </div>
                      </div>

                      {showtime.meetingId && (
                        <div className="event-creation-form__field">
                          <label className="event-creation-form__label">Meeting ID</label>
                          <div className="event-creation-form__display">
                            {showtime.meetingId}
                          </div>
                        </div>
                      )}

                      {showtime.meetingPassword && (
                        <div className="event-creation-form__field">
                          <label className="event-creation-form__label">Meeting Password</label>
                          <div className="event-creation-form__display">
                            {showtime.meetingPassword}
                          </div>
                        </div>
                      )}
                    </div>

                    {showtime.tickets && showtime.tickets.length > 0 && (
                      <div className="event-creation-form__tickets">
                        <h4 className="event-creation-form__label">Tickets</h4>
                        {showtime.tickets.map((ticket) => (
                          <div key={ticket.id} className="event-creation-form__ticket">
                            <div className="event-creation-form__grid">
                              <div className="event-creation-form__field">
                                <label className="event-creation-form__label">Ticket Name</label>
                                <div className="event-creation-form__display">
                                  {ticket.name}
                                </div>
                              </div>

                              <div className="event-creation-form__field">
                                <label className="event-creation-form__label">Price</label>
                                <div className="event-creation-form__display">
                                  ${ticket.price}
                                </div>
                              </div>

                              <div className="event-creation-form__field">
                                <label className="event-creation-form__label">Quantity</label>
                                <div className="event-creation-form__display">
                                  {ticket.quantity}
                                </div>
                              </div>

                              {ticket.description && (
                                <div className="event-creation-form__field event-creation-form__field--full">
                                  <label className="event-creation-form__label">Description</label>
                                  <div className="event-creation-form__display">
                                    {ticket.description}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="event-creation-form__no-data">
                  No showtimes configured for this event
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="event-creation-form__section">
              <h2 className="event-creation-form__section-title">Payment & Banking Information</h2>
              
              <div className="event-creation-form__grid">
                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Bank Account Name</label>
                  <div className="event-creation-form__display">
                    {event.bankAccountName || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Bank Account Number</label>
                  <div className="event-creation-form__display">
                    {event.bankAccountNumber || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Bank Name</label>
                  <div className="event-creation-form__display">
                    {event.bankName || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Bank Branch</label>
                  <div className="event-creation-form__display">
                    {event.bankBranch || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">VAT Business Type</label>
                  <div className="event-creation-form__display">
                    {event.vatBusinessType || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">VAT Holder Name</label>
                  <div className="event-creation-form__display">
                    {event.vatHolderName || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field">
                  <label className="event-creation-form__label">Tax Code</label>
                  <div className="event-creation-form__display">
                    {event.taxCode || 'Not specified'}
                  </div>
                </div>

                <div className="event-creation-form__field event-creation-form__field--full">
                  <label className="event-creation-form__label">VAT Holder Address</label>
                  <div className="event-creation-form__display">
                    {event.vatHolderAddress || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="event-creation-form__dialog-overlay">
          <div className="event-creation-form__dialog">
            <h3>Reject Event</h3>
            <p>Please provide a reason for rejecting this event:</p>
            <textarea
              className="event-creation-form__textarea"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div className="event-creation-form__dialog-actions">
              <button
                className="event-creation-form__btn event-creation-form__btn--secondary"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="event-creation-form__btn event-creation-form__btn--danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || loading}
              >
                Reject Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPrivateDetail;