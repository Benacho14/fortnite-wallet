import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

interface NotificationData {
  amount?: number;
  from?: string;
  to?: string;
  description?: string;
  product?: string;
  quantity?: number;
  totalPrice?: number;
  buyer?: string;
  newBalance?: string;
  reason?: string;
}

export function Notification() {
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (event: string) => (data: NotificationData) => {
      let message = '';

      switch (event) {
        case 'transfer_received':
          message = `💰 Received $${data.amount} from ${data.from}`;
          break;
        case 'transfer_sent':
          message = `📤 Sent $${data.amount} to ${data.to}`;
          break;
        case 'purchase_completed':
          message = `🛍️ Purchased ${data.quantity}x ${data.product} for $${data.totalPrice}`;
          break;
        case 'sale_completed':
          message = `💵 Sold ${data.quantity}x ${data.product} to ${data.buyer} for $${data.totalPrice}`;
          break;
        case 'reversal_completed':
          message = `⚠️ Transaction reversed: $${data.amount} - ${data.reason}`;
          break;
        default:
          message = `📬 Notification received`;
      }

      setNotifications((prev) => [...prev, message]);
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000);
    };

    socket.on('transfer_received', handleNotification('transfer_received'));
    socket.on('transfer_sent', handleNotification('transfer_sent'));
    socket.on('purchase_completed', handleNotification('purchase_completed'));
    socket.on('sale_completed', handleNotification('sale_completed'));
    socket.on('reversal_completed', handleNotification('reversal_completed'));

    return () => {
      socket.off('transfer_received');
      socket.off('transfer_sent');
      socket.off('purchase_completed');
      socket.off('sale_completed');
      socket.off('reversal_completed');
    };
  }, [socket]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((msg, index) => (
        <div
          key={index}
          className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in"
        >
          {msg}
        </div>
      ))}
    </div>
  );
}
