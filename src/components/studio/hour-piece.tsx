import React, { useEffect, useState } from 'react';

export const HourPiece: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        weekday: 'long',
        year: 'numeric'
      };
      setDate(now.toLocaleDateString('es-ES', options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="energy-container">
      <div className="clock-wrapper">
        <h1 className="text-clock-hour">{time}</h1>
        <p className="text-clock-date">{date}</p>
      </div>
    </div>
  );
};
