import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCalendarPlus } from 'react-icons/fa';
import Button from '../Button';

interface Event {
  id: string;
  title: string;
  duration: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  slot: number;
  description: string;
  price: number;
}

interface EventManagementProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const EventManagement: React.FC<EventManagementProps> = ({ onAlert }) => {
  const [events] = useState<Event[]>([
    { id: '1', title: 'Personality Workshop', duration: 120, status: 'upcoming', slot: 50, description: 'Group workshop', price: 99 },
    { id: '2', title: 'Career Counseling', duration: 60, status: 'ongoing', slot: 1, description: '1-on-1 session', price: 149 },
    { id: '3', title: 'Team Assessment', duration: 180, status: 'completed', slot: 10, description: 'Team building', price: 299 },
  ]);

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Event Management</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<FaCalendarPlus />}
          onClick={() => onAlert('info', 'Create event feature coming soon')}
        >
          Create Event
        </Button>
      </div>

      <div className="table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Slots</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.duration} min</td>
                <td><span className={`badge status-${event.status}`}>{event.status}</span></td>
                <td>{event.slot}</td>
                <td>${event.price}</td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => onAlert('info', 'Edit event feature coming soon')}
                    >
                      {/* No children, icon-only button */}
                      {/* Provide empty children to satisfy ButtonProps */}
                      {null}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FaTrash />}
                      onClick={() => onAlert('warning', 'Delete event feature coming soon')}
                    >
                      {null}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventManagement;