import React from 'react'
import { Typography } from '@mui/material';
import { NavigateCards } from '../components/navigate_cards'
import { ShowChart, ChatBubbleOutline, AccountCircle, AttachMoney, History, TrackChanges } from '@mui/icons-material';
import { useAuth } from '../context/auth.context';

/**
 * Home Component
 * 
 * This component serves as the main dashboard of the application, displaying navigation cards 
 * for key features such as financial planning, chatbot access, personal data, and history tracking.
 * 
 * Features:
 * - Dynamic page title setting
 * - User greeting based on authentication state
 * - Organized navigation sections (Explore and Personal Data)
 * - Conditional route-based rendering of cards
 */

export function Home() {

  // Sets the browser tab title to 'Home' when the component mounts.
  React.useEffect(() => {
    document.title = 'Home';
  }, []);

  // Retrieves the authenticated user's information from the context.
  const { user } = useAuth();

  // List of cards for the main Explore section with route and UI details.
  const cardsList = [
    { id: '1', text: "New financial plan", icon: <ShowChart />, route: "/newplan", colorIcon: "#3E5C76", colorBack: "#D6DEE6" },
    { id: '2', text: "ChatBot", icon: <ChatBubbleOutline />, route: "/chatbot", colorIcon: "#3E5C76", colorBack: "#D6DEE6" },
    { id: '4', text: 'Personal Data', icon: <AccountCircle /> },
    { id: '5', text: 'Financial Data', icon: <AttachMoney /> },
    { id: '6', text: 'Tracking', icon: <TrackChanges /> },
    { id: '7', text: 'History', icon: <History /> }
  ];

  // List of explore items with routes for easier navigation.
  const exploreItems = [
    { id: '1', text: 'New Financial Plan', icon: <ShowChart />, route: "/newplan" },
    { id: '2', text: 'Chatbot', icon: <ChatBubbleOutline />, route: "/chatbot" },
  ];

  // List of personal data-related cards with associated routes.
  const personalDataItems = [
    { id: '4', text: 'Personal Data', icon: <AccountCircle />, route: "/infouser" },
    { id: '5', text: 'Financial Data', icon: <AttachMoney />, route: "/plan" },
    { id: '6', text: 'Tracking', icon: <TrackChanges />, route: "/tracking" },
    { id: '7', text: 'History', icon: <History />, route: "/history" }
  ];

  return (
    <div>
      {/* Greets the user by name if authenticated */}
      <Typography variant="h4" component="div" sx={{ margin: '10px', color: "black", position: 'relative', top: '-5vh' }}>
        Welcome {user ? user.name : ""}
      </Typography>

      {/* Explore Section */}
      <Typography align='left' variant="h6" gutterBottom>
        Explore
      </Typography>
      <NavigateCards cardsList={exploreItems} />

      {/* Personal Data Section */}
      <Typography align='left' variant="h6" gutterBottom style={{ marginTop: '30px' }}>
        Personal Data
      </Typography>
      <NavigateCards cardsList={personalDataItems} />
    </div>
  );
}
