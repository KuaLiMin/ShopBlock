import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Stack, Divider, Container } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import RateButton from './RateButton';

const CardTemplate = ({ title, name, hourlyRate, timeStart, timeEnd, amount, completed }) => {
  return (
    <Container maxWidth={false} sx={{ mx: 'auto', px: { xs: 2, sm: 3, md: '100px' } }}>
      <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx = {{mb:1}}>
                <Typography variant="h5" component="div" fontWeight="bold" fontSize="21px" gutterBottom>
                    {title}
                </Typography>
                {completed && (
                    <Box sx={{ paddingRight: 1}} >
                    <RateButton />
                    </Box>
                )}
            </Box>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Avatar src="/api/placeholder/40/40" alt={name} />
                <Typography variant="subtitle1">{name}</Typography>
                <Box sx={{ display: 'flex', color: 'gold' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: 'gold' }} />
                  ))}
                </Box>
              </Box>
              <Typography variant="h6">${hourlyRate}/hr</Typography>        
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" fontSize="20px" fontWeight="bold">
                  {timeStart.split(' ')[0]}
                </Typography>
                <Typography variant="body1">
                  {timeStart.split(' ')[1]}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" fontSize="20px" fontWeight="bold">
                  {timeEnd.split(' ')[0]}
                </Typography>
                <Typography variant="body1">
                  {timeEnd.split(' ')[1]}
                </Typography>
              </Box>
              <Box textAlign="center" sx={{ mr: 10 }}>
                <Typography variant="body2" color="text.secondary" fontSize="20px" fontWeight="bold">
                  Total Paid
                </Typography>
                <Typography variant="body1" fontWeight="semi-bold">
                  ${amount}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CardTemplate;