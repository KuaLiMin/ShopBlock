import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Tooltip } from '@mui/material';
import './Calendar.css';

const Calendar = ({ offers }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);

    const generateCalendarData = () => {
        const dateMap = {};
    
        offers.forEach(offer => {
            // Create dates and strip the time component
            const startDate = new Date(offer.scheduled_start);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(offer.scheduled_end);
            endDate.setHours(0, 0, 0, 0);  // This is key - set to start of day
            
            // Debug logs
            console.log('Processing dates:', {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            });
    
            let currentDate = new Date(startDate);
    
            while (currentDate < endDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                
                if (!dateMap[dateString]) {
                    dateMap[dateString] = [];
                }
    
                if (["C", "A", "P", "D"].includes(offer.status)) {
                    dateMap[dateString].push(offer);
                }
    
                currentDate = new Date(currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
                currentDate.setHours(0, 0, 0, 0);
            }
        });
    
        setCalendarData(Object.entries(dateMap).map(([date, offers]) => ({ date, offers })));
    };
    
    // Rest of the component remains the same
    useEffect(() => {
        generateCalendarData();
    }, [offers, currentMonth]);

    const getDaysInMonth = (month, year) => {
        const days = [];
        const lastDate = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDate; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const daysInMonth = getDaysInMonth(currentMonth.getMonth(), currentMonth.getFullYear());

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    const getHighlightClass = (offersForDate, day) => {
        const today = new Date();
        if (day <= today.setHours(0, 0, 0, 0)) return 'highlight-grey';
        if (!offersForDate) return 'highlight-green';
        if (offersForDate.some(offer => offer.status === 'P')) return 'highlight-orange';
        if (offersForDate.some(offer => offer.status === 'D' || offer.status === 'A')) return 'highlight-black';
        return 'highlight-green';
    };

    const getTooltipText = (offersForDate, day) => {
        const today = new Date();
        if (day < today.setHours(0, 0, 0, 0)) return '';
        if (!offersForDate) return "Dates are available";
        if (offersForDate.some(offer => offer.status === 'P')) return "Date may be available as user has not accepted offer";
        if (offersForDate.some(offer => offer.status === 'D' || offer.status === 'A')) return "Dates are unavailable";
        return "Dates are available";
    };

    return (
        <div>
            <Typography variant="h5" align="center" gutterBottom sx={{ mt: '10px' }}>
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button variant="contained" onClick={handlePrevMonth}>Previous</Button>
                <Button variant="contained" onClick={handleNextMonth}>Next</Button>
            </Box>

            <div className="calendar">
                {daysInMonth.map(day => {
                    const dateString = day.toISOString().split('T')[0];
                    const offersForDate = calendarData.find(item => item.date === dateString)?.offers;

                    const highlightClass = getHighlightClass(offersForDate, day);
                    const tooltipText = getTooltipText(offersForDate, day);

                    const isPastDate = day < new Date().setHours(0, 0, 0, 0);

                    return (
                        <Tooltip key={dateString} title={!isPastDate ? tooltipText : ''}>
                            <div
                                className={`calendar-day ${highlightClass}`}
                                style={{ display: 'inline-block', width: '100%', boxSizing: 'border-box', padding: '5px' }}
                            >
                                {day.getDate()}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;