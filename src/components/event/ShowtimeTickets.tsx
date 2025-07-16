import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { TicketResponse } from './dto/ticket.dto';
import { getShowtimeTickets } from '@/services/eventService';

const ShowtimeTickets = () => {
    const { showtimeId } = useParams<{ showtimeId: number }>();
    const [tickets, setTickets] = React.useState<TicketResponse[]>([]);
    const [money, setMoney] = React.useState<number>(0);
    const [selectedTickets, setSelectedTickets] = React.useState<TicketResponse>();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await getShowtimeTickets(Number(showtimeId));
                setTickets(response);
                setSelectedTickets(tickets[0]);
            } catch (error) {
                console.error("Failed to fetch tickets:", error);
            }
        };

        if (showtimeId) {
            fetchTickets();
        }
    }, [showtimeId]);

    return (
        <div className='flex !pl-8 !py-4 h-[90vh] overflow-hidden'>
            <div className='flex-1/12'>
                <div className='flex items-center text-white font-semibold text-2xl px-4 py-2 rounded cursor-pointer' onClick={() => window.history.back()}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-left" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.707 3.793a1 1 0 010 1.414L4.414 9.5H18a1 1 0 110 2H4.414l4.293 4.293a1 1 0 11-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z" fill="#fff"></path>
                    </svg>
                    <span>Trở về</span>
                </div>
            </div>
            <div className='flex-8/12 flex flex-col items-center !gap-8'>
                <h1 className='text-2xl font-bold'>Chọn vé</h1>
                <div className='flex flex-col items-center !gap-4'>
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => {
                                setSelectedTickets(ticket);
                                setMoney(ticket.price);
                            }}
                            className={`relative rounded-2xl border p-6 min-h-12 min-w-lg  cursor-pointer transition 
    duration-300 hover:shadow-xl 
    ${selectedTickets?.id === ticket.id
                                    ? 'ring-2 ring-slate-400 bg-gray-900 border-slate-500'
                                    : 'border-[#38383D]'
                                }`}
                        >

                            {/* Name and Price Row */}
                            <div className="relative z-10 flex items-center justify-between !px-4">
                                <h2 className="text-xl text-[#2dc275] font-semibold">{ticket.name}</h2>
                                <p className="text-lg text-gray-400">{ticket.price} đ</p>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
            <div className='flex-3/12 flex flex-col  justify-between'>
                <div>
                <h2>Thông tin vé</h2>
                {selectedTickets && (
                    <div className=''>
                        <h3>{selectedTickets.name}</h3>
                        <p>Price: {selectedTickets.price} VND</p>
                    </div>
                )}
                </div>
                <div className='h-12 bg-green-400 text-white text-center font-bold text-lg rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-200 shadow-lg border-none'>
                    Thanh toán
                </div>
            </div>
        </div>
    )
}

export default ShowtimeTickets