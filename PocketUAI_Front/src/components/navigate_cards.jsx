import React from 'react'
import { useNavigate, } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card, CardContent, Typography, Box, CardActionArea, Icon } from '@mui/material';

// NavigateCards Component - Renders a list of cards with navigation links
export function NavigateCards({ cardsList }) {
    return (
        // Main container for the cards, displayed as a flexbox with wrapping and spacing
        <Box
            display="flex" // Flexbox layout
            justifyContent="flex-start" // Align cards to the left
            alignItems="center" // Center items vertically
            flexWrap="wrap" // Allow items to wrap onto new lines
            gap={2} // Spacing between cards
            sx={{ width: '100%' }} // Set the width to 100% of the parent container
        >
            {/* Map through the cardsList prop and render a NavigateCard for each item */}
            {cardsList.map((card, index) => (
                <NavigateCard key={index} card={card} /> // Render NavigateCard for each card in the list
            ))}
        </Box>
    );
}

// NavigateCard Component - A single card that acts as a navigation link
export function NavigateCard({ card }) {
    const nav = useNavigate(); // Use the useNavigate hook from React Router for navigation

    return (
        // Card component with border, padding, and a fixed width and height
        <Card key={card.id} sx={{ border: '1px solid #E0E0E0', padding: 0, width: "250px", height: 50 }}>
            {/* CardActionArea is used to make the entire card clickable */}
            <CardActionArea sx={{ height: '100%', padding: 1 }} onClick={() => nav(card.route)}>
                {/* Container for the card content, displayed as a flexbox */}
                <Box sx={{ display: 'flex', alignItems: 'center', padding: 0, flexDirection: 'row', width: '100%', height: '100%' }}>
                    {/* Icon inside the card, with some spacing to the right */}
                    <Icon color="primary" sx={{ marginRight: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {card.icon} {/* Render the card icon */}
                    </Icon>
                    {/* Text inside the card */}
                    <Typography variant="subtitle1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        {card.text} {/* Render the card text */}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
}