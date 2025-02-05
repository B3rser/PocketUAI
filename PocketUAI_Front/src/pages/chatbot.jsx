import React from 'react'
import { Button, TextField } from '@mui/material';
import { faPaperPlane, faStop } from '@fortawesome/free-solid-svg-icons';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UnderDevelopmentNotice } from '../components/under_development_notice';
import LoadingCircle from '../components/loading_circle';

// Main Chatbot component
export function Chatbot() {
  // Effect to change the document title when the component is mounted
  React.useEffect(() => {
    document.title = 'Chat'; // Set the document title to "Chat"
    load_data();
  }, []); // Empty dependency array to run the effect only on component mount

  const [error, setError] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // State to store the chatbot messages
  const [messages, setMessages] = React.useState(
    // Initial example messages
    [
      { from: 'user', text: 'Hello' }, // Initial user message
      { from: 'ai', text: 'Hi, how can I help you?' }, // Initial AI response
      { from: 'user', text: 'I want to know more about your services.' }, // User message asking for more info
      { from: 'ai', text: 'Sure! We offer a wide variety of services, including...' } // AI response with services
    ]
  );

  // State to manage the user's input text
  const [input, setInput] = React.useState(''); // Input text initialized as an empty string

  // State to track if a message is being sent or stopped
  const [isSending, setIsSending] = React.useState(true); // Initially, set to true to show the send button

  // Function to handle the form submission when the user sends a message
  function handleSubmit(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    if (input.trim()) { // Check if the input is not just empty or whitespace
      setMessages([...messages, { from: 'user', text: input }]); // Add the user's message to the messages state
      setInput(''); // Clear the input field after submission
      setIsSending(false); // Change the state to show the stop button
    }
  }

  // Function to handle the stop button click (used to simulate the action of stopping a message)
  function handleStop() {
    console.log("Stop button pressed"); // Log the stop action to the console (for now, just a placeholder)
    setIsSending(true); // Reset to show the send button again
  }

  const load_data = async () => {
    try {

    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (<ErrorMessage type={error} message={message} />);
  }

  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <div>
      <UnderDevelopmentNotice /> {/* Display a notice indicating that the chatbot is under development */}
      <div className='chat-container'>
        <div className="messages">
          {/* Render each message in the messages array */}
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.from}`}>
              {msg.text} {/* Display the message text */}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="input-container">
          {/* Input field for the user to type a message */}
          <TextField
            id='standard-basic'
            fullWidth
            placeholder='Message'
            value={input}
            onChange={(e) => setInput(e.target.value)} // Update input state when the user types
            required
          />
          {/* Button to submit the message or stop the process */}
          {isSending ? (
            <Button type="submit" disabled={!input.trim()}>
              <FontAwesomeIcon icon={faPaperPlane} size="2x" /> {/* Send icon */}
            </Button>
          ) : (
            <Button type="button" onClick={handleStop}>
              <FontAwesomeIcon icon={faStop} size="2x" /> {/* Stop icon */}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}