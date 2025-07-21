import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { TicketResponse } from './dto/ticket.dto';
import { getShowtimeTickets } from '@/services/eventService';
import { createOrder, createPaymentLink, ItemType } from '@/services/orderService';
import LoadingSpinner from '../LoadingSpinner';
import Alert from '../Alert';

const ShowtimeTickets = () => {
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const [tickets, setTickets] = React.useState<TicketResponse[]>([]);
    const [selectedTickets, setSelectedTickets] = React.useState<TicketResponse>();
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
        description?: string;
    }>({
        show: false,
        type: "success",
        message: "",
        description: ""
    });

    const handlePayment = async () => {
        const ticketId = selectedTickets?.id;
        
        if (!ticketId) {
            setAlert({
                show: true,
                type: "error",
                message: "Vui lòng chọn vé",
                description: "Bạn cần chọn một loại vé trước khi thanh toán."
            });
            return;
        }

        // Additional validation
        if (!selectedTickets?.quantity || selectedTickets.quantity <= 0) {
            setAlert({
                show: true,
                type: "error",
                message: "Vé đã hết",
                description: "Loại vé này đã hết. Vui lòng chọn loại vé khác."
            });
            return;
        }

        if (!showtimeId) {
            setAlert({
                show: true,
                type: "error",
                message: "Thông tin không hợp lệ",
                description: "Không tìm thấy thông tin suất chiếu."
            });
            return;
        }

        setLoading(true);
        
        try {
            // Create order first
            const orderData = {
                items: [
                    {
                        itemId: ticketId,
                        itemType: ItemType.TICKET,
                        quantity: 1
                    }
                ]
            };

            const orderResponse = await createOrder(orderData);
            console.log('Order created:', orderResponse);


            // Create payment link
            const paymentResponse = await createPaymentLink({
                orderId: orderResponse.id
            });

            // Show success message before redirect
            setAlert({
                show: true,
                type: "success",
                message: "Đang chuyển hướng thanh toán",
                description: "Vui lòng chờ trong giây lát..."
            });

            // Redirect to payment URL
            if (paymentResponse.data.checkoutUrl) {
                setTimeout(() => {
                    window.location.href = paymentResponse.data.checkoutUrl;
                }, 1500); // Small delay to show success message
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Payment processing error:', error);
            
            let errorMessage = "Không thể tạo thanh toán";
            let errorDescription = "Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
            
            // Handle different types of errors
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: {
                        status?: number;
                        data?: {
                            message?: string;
                            error?: string;
                        };
                    };
                };
                const status = axiosError.response?.status;
                const responseData = axiosError.response?.data;
                
                switch (status) {
                    case 400:
                        errorMessage = "Yêu cầu không hợp lệ";
                        if (responseData?.message) {
                            errorDescription = responseData.message;
                        } else if (responseData?.error) {
                            errorDescription = responseData.error;
                        } else {
                            errorDescription = "Thông tin vé không hợp lệ hoặc vé đã hết. Vui lòng thử lại.";
                        }
                        break;
                    default:
                        if (responseData?.message) {
                            errorDescription = responseData.message;
                        }
                }
            } else if (error && typeof error === 'object' && 'message' in error) {
                // Handle other error types
                const errorObj = error as { message: string };
                if (errorObj.message.includes('Network Error')) {
                    errorMessage = "Lỗi kết nối";
                    errorDescription = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.";
                } else if (errorObj.message.includes('timeout')) {
                    errorMessage = "Hết thời gian chờ";
                    errorDescription = "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.";
                }
            }

            setAlert({
                show: true,
                type: "error",
                message: errorMessage,
                description: errorDescription,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await getShowtimeTickets(Number(showtimeId));
                setTickets(response);
                // Select the first available ticket (not sold out)
                const availableTicket = response.find(ticket => ticket.quantity > 0);
                if (availableTicket) {
                    setSelectedTickets(availableTicket);
                }
            } catch (error) {
                console.error("Failed to fetch tickets:", error);
                setAlert({
                    show: true,
                    type: "error",
                    message: "Không thể tải danh sách vé",
                    description: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
                });
            }
        };

        if (showtimeId) {
            fetchTickets();
        }
    }, [showtimeId]);

    return (
        <div className='flex !pl-8 !py-4 h-[90vh] overflow-hidden'>
            {/* Alert Component */}
            {alert.show && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    description={alert.description}
                    duration={5000}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}
            
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-4">
                        <LoadingSpinner size="medium" />
                        <p className="text-gray-700">Đang xử lý thanh toán...</p>
                    </div>
                </div>
            )}
            
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
                                if (ticket.quantity > 0) {
                                    setSelectedTickets(ticket);
                                }
                            }}
                            className={`relative rounded-2xl border p-6 min-h-12 min-w-lg transition 
    duration-300 hover:shadow-xl 
    ${ticket.quantity <= 0 
        ? 'opacity-50 cursor-not-allowed border-gray-600' 
        : 'cursor-pointer ' + (selectedTickets?.id === ticket.id
            ? 'ring-2 ring-slate-400 bg-gray-900 border-slate-500'
            : 'border-[#38383D] hover:border-slate-500')
    }`}
                        >
                            {/* Sold Out Badge */}
                            {ticket.quantity <= 0 && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    Hết vé
                                </div>
                            )}

                            {/* Name and Price Row */}
                            <div className="relative z-10 flex items-center justify-between !px-4">
                                <div className="flex flex-col">
                                    <h2 className={`text-xl font-semibold ${ticket.quantity <= 0 ? 'text-gray-500' : 'text-[#2dc275]'}`}>
                                        {ticket.name}
                                    </h2>
                                </div>
                                <p className={`text-lg ${ticket.quantity <= 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {ticket.price.toLocaleString()} đ
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='flex-3/12 flex flex-col  justify-between'>
                <div>
                    <h2 className="text-xl font-bold mb-4">Thông tin vé</h2>
                    {selectedTickets ? (
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-[#2dc275]">{selectedTickets.name}</h3>
                                <p className="text-sm text-gray-400">{selectedTickets.description}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Giá:</span>
                                <span className="text-xl font-bold">{selectedTickets.price.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Số lượng:</span>
                                <span className="font-semibold">1 vé</span>
                            </div>
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Tổng:</span>
                                    <span className="text-[#2dc275]">{selectedTickets.price.toLocaleString()} VND</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400">Chưa chọn vé</p>
                    )}
                </div>
                <div 
                    onClick={handlePayment} 
                    className={`h-12 text-white text-center font-bold text-lg rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-200 shadow-lg border-none ${
                        loading || !selectedTickets || selectedTickets.quantity <= 0
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-400 hover:bg-green-500'
                    }`}
                    style={{ 
                        pointerEvents: loading || !selectedTickets || selectedTickets.quantity <= 0 ? 'none' : 'auto' 
                    }}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <LoadingSpinner size="small" />
                            <span>Đang xử lý...</span>
                        </div>
                    ) : !selectedTickets ? (
                        'Chọn vé'
                    ) : selectedTickets.quantity <= 0 ? (
                        'Hết vé'
                    ) : (
                        'Thanh toán'
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShowtimeTickets