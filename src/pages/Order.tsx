import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaCalendarAlt, FaDollarSign, FaUser, FaFilter, FaSearch, FaTimes, FaBox } from "react-icons/fa";
import { getMyOrders, OrderResponse, GetOrdersParams, getOrderPayment, BillResponse } from "../services/orderService";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import "../styles/Order.css";

const Order: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(6);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<BillResponse | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
    description?: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // Status display mapping
  const getStatusDisplayName = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status || 'Không xác định';
    }
  };

  // Status color mapping
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const fetchOrders = async (params: GetOrdersParams = {}) => {
    setLoading(true);
    try {
      const response = await getMyOrders({
        ...params,
        page: currentPage,
        size: pageSize,
      });

      console.log("Fetched orders:", response);
      
      setOrders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Không thể tải danh sách đơn hàng");
      setAlert({
        show: true,
        type: "error",
        message: "Không thể tải danh sách đơn hàng",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(0); // Reset to first page when filtering
    fetchOrders({ status: statusFilter || undefined });
  };

  const clearFilters = () => {
    setStatusFilter("");
    setCurrentPage(0);
    fetchOrders();
  };

  const handleViewDetails = (order: OrderResponse) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleViewPayment = async (orderId: number) => {
    setPaymentLoading(true);
    try {
      const payment = await getOrderPayment(orderId);
      setPaymentData(payment);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Failed to fetch payment data:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Không thể tải thông tin thanh toán",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
  };

  useEffect(() => {
    fetchOrders({ status: statusFilter || undefined });
  }, [currentPage]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <LoadingSpinner
        size="medium"
        message="Đang tải danh sách đơn hàng..."
      />
    );
  }

  return (
    <div className="order-container">
      <div className="order-content animate-slide-up">
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            description={alert.description}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          />
        )}
        
        <div className="order-header">
          <div className="order-banner">
            <div className="banner-overlay"></div>
          </div>
          
          <div className="order-main-info">
            <div className="order-title-section">
              <div className="order-icon-wrapper">
                <FaShoppingCart className="order-main-icon" />
              </div>
              <div className="order-title-content">
                <h1 className="order-title">Đơn hàng của tôi</h1>
                <p className="order-subtitle">
                  Quản lý và theo dõi tất cả đơn hàng của bạn
                </p>
              </div>
            </div>
            
            <div className="order-actions">
              <button 
                className="filter-toggle-btn" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                <span>Bộ lọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="order-filters animate-fade-in">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="status-filter">Trạng thái:</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              
              <div className="filter-actions">
                <button className="filter-btn apply" onClick={handleFilterChange}>
                  <FaSearch />
                  Áp dụng
                </button>
                <button className="filter-btn clear" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Summary */}
        <div className="order-summary">
          <div className="summary-card">
            <FaShoppingCart className="summary-icon" />
            <div className="summary-content">
              <span className="summary-label">Tổng đơn hàng</span>
              <span className="summary-value">{totalElements}</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="order-list-section">
          <h2 className="section-title">
            <FaShoppingCart className="section-icon" />
            Danh sách đơn hàng
          </h2>
          
          {error && (
            <div className="order-error animate-fade-in">
              <div className="error-icon">⚠️</div>
              <h3>Có lỗi xảy ra</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={() => fetchOrders()}>
                Thử lại
              </button>
            </div>
          )}

          {!error && orders.length === 0 && !loading && (
            <div className="empty-orders animate-fade-in">
              <FaShoppingCart className="empty-icon" />
              <h3>Chưa có đơn hàng nào</h3>
              <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            </div>
          )}

          {!error && orders.length > 0 && (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order.id} className="order-card animate-fade-in">
                  <div className="order-card-header">
                    <div className="order-info">
                      <h3 className="order-id">Đơn hàng #{order.id}</h3>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {getStatusDisplayName(order.status)}
                      </span>
                    </div>
                    <div className="order-total">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                  
                  <div className="order-card-body">
                    <div className="order-detail">
                      <FaCalendarAlt className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Ngày đặt hàng</span>
                        <span className="detail-value">{formatDate(order.time)}</span>
                      </div>
                    </div>
                    
                    <div className="order-detail">
                      <FaDollarSign className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Tổng tiền</span>
                        <span className="detail-value">{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="order-items">
                        <span className="items-label">Sản phẩm:</span>
                        <span className="items-count">{order.items.length} sản phẩm</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="order-card-footer">
                    <button 
                      className="order-action-btn"
                      onClick={() => handleViewDetails(order)}
                    >
                      Xem chi tiết
                    </button>
                    {order.status.toLowerCase() === 'completed' && (
                      <button 
                        className="order-action-btn payment"
                        onClick={() => handleViewPayment(order.id)}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? "Đang tải..." : "Xem thanh toán"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="order-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <FaBox className="modal-icon" />
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="order-summary-section">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="order-summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Ngày đặt:</span>
                      <span className="summary-value">{formatDate(selectedOrder.time)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Trạng thái:</span>
                      <span className={`order-status ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusDisplayName(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Tổng tiền:</span>
                      <span className="summary-value total">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="items-section">
                  <h3>Danh sách sản phẩm</h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="items-list">
                      {selectedOrder.items.map((item) => (
                        <div key={item?.id} className="item-card">
                          <div className="item-info">
                            <h4 className="item-name">{item?.itemName}</h4>
                            <p className="item-id">ID: {item?.itemId}</p>
                          </div>
                          <div className="item-details">
                            <div className="item-quantity">
                              <span className="quantity-label">Số lượng:</span>
                              <span className="quantity-value">{item?.quantity}</span>
                            </div>
                            <div className="item-price">
                              <span className="price-label">Đơn giá:</span>
                              <span className="price-value">{formatCurrency(item?.itemPrice)}</span>
                            </div>
                            <div className="item-total">
                              <span className="total-label">Thành tiền:</span>
                              <span className="total-value">{formatCurrency(item?.itemPrice * item?.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-items">
                      <FaBox className="no-items-icon" />
                      <p>Không có thông tin sản phẩm</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="modal-btn close" onClick={handleCloseModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details Modal */}
        {showPaymentModal && paymentData && (
          <div className="modal-overlay" onClick={handleClosePaymentModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <FaDollarSign className="modal-icon" />
                  Thông tin thanh toán - Đơn hàng #{paymentData.orderId}
                </h2>
                <button className="modal-close-btn" onClick={handleClosePaymentModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="payment-info-section">
                  <h3>Chi tiết thanh toán</h3>
                  <div className="payment-info-grid">
                    <div className="payment-item">
                      <span className="payment-label">Mã giao dịch:</span>
                      <span className="payment-value">{paymentData.billId}</span>
                    </div>
                    <div className="payment-item">
                      <span className="payment-label">Số tiền:</span>
                      <span className="payment-value amount">{formatCurrency(paymentData.amount)}</span>
                    </div>
                    <div className="payment-item">
                      <span className="payment-label">Thời gian:</span>
                      <span className="payment-value">{formatDate(paymentData.time)}</span>
                    </div>
                    <div className="payment-item">
                      <span className="payment-label">Phương thức:</span>
                      <span className="payment-value method">{paymentData.method || "Không xác định"}</span>
                    </div>
                    <div className="payment-item">
                      <span className="payment-label">Trạng thái:</span>
                      <span className="payment-value status-success">{paymentData.status || "Thành công"}</span>
                    </div>
                    <div className="payment-item full-width">
                      <span className="payment-label">Mô tả:</span>
                      <span className="payment-value">{paymentData.description || "Thanh toán đơn hàng"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="modal-btn close" onClick={handleClosePaymentModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;