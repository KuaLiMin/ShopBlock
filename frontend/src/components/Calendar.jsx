import React, { useEffect, useState } from 'react';
import { Grid, Button, Typography, Box, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Import the UTC plugin
import './Calendar.css';

dayjs.extend(utc); // Use the UTC plugin


const Calendar = ({ offers }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);

    const generateCalendarData = () => {
        const dateMap = {};
    
        offers.forEach(offer => {
            const startDate = new Date(offer.scheduled_start);
            const endDate = new Date(offer.scheduled_end);
            startDate.setHours(0, 0, 0, 0); // Set start of the day
            endDate.setHours(0, 0, 0, 0); // Set start of the day
            let currentDate = new Date(startDate); // Initialize currentDate
    
            // Iterate from startDate to endDate (inclusive)
            while (currentDate <= endDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                if (!dateMap[dateString]) {
                    dateMap[dateString] = [];
                }
    
                // Only add offers with statuses C, A, or P
                if (["C", "A", "P"].includes(offer.status)) {
                    dateMap[dateString].push(offer);
                }
                currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
            }
        });
    
        // Update state with the generated calendar data
        setCalendarData(Object.entries(dateMap).map(([date, offers]) => ({ date, offers })));
    };
    

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
        if (day <= today.setHours(0, 0, 0, 0)) return 'highlight-grey'; // Grey for past dates
        if (!offersForDate) return 'highlight-green'; // No offers, green for available
        if (offersForDate.some(offer => offer.status === 'P')) return 'highlight-orange'; // Pending
        if (offersForDate.some(offer => offer.status === 'C' || offer.status === 'A')) return 'highlight-black'; // Confirmed or Accepted
        return 'highlight-green'; // Default for available dates
    };

    const getTooltipText = (offersForDate, day) => {
        const today = new Date();
        if (day < today.setHours(0, 0, 0, 0)) return ''; // No tooltip for past dates
        if (!offersForDate) return "Dates are available";
        if (offersForDate.some(offer => offer.status === 'P')) return "Date may be available as user has not accepted offer";
        if (offersForDate.some(offer => offer.status === 'C' || offer.status === 'A')) return "Dates are unavailable";
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

            <Grid container className="calendar" spacing={0}>
                {daysInMonth.map(day => {
                    const dateString = day.toISOString().split('T')[0];
                    const offersForDate = calendarData.find(item => item.date === dateString)?.offers;

                    const highlightClass = getHighlightClass(offersForDate, day);
                    const tooltipText = getTooltipText(offersForDate, day);

                    const isPastDate = day < new Date().setHours(0, 0, 0, 0); // Check if the date is in the past

                    return (
                        <Grid item xs={1} key={dateString} style={{ padding: 0 }}>
                            {isPastDate ? (
                                <div className={`calendar-day ${highlightClass}`}>
                                    {day.getDate()}
                                </div>
                            ) : (
                                <Tooltip title={tooltipText}>
                                    <div className={`calendar-day ${highlightClass}`}>
                                        {day.getDate()}
                                    </div>
                                </Tooltip>
                            )}
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    );
};

export default Calendar;
