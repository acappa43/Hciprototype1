import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
  message: string;
  isError: boolean;
}

export function NotificationToast({ message, isError }: NotificationToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl transition-opacity duration-300 z-30 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${isError ? 'bg-red-500' : 'bg-[#4F46E5]'} text-white`}
    >
      {message}
    </div>
  );
}
