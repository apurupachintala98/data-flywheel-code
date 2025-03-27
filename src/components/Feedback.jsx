import { useState, useEffect, useRef } from "react";
import { Box, IconButton, Typography, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Feedback = ({ message }) => {
    const [feedback, setFeedback] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef(null);
    const voicesRef = useRef([]);

    useEffect(() => {
        const loadVoices = () => {
            voicesRef.current = synthRef.current.getVoices();
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);


    const handleSpeak = () => {
        if (!message || !message.text) {
            console.error("Message is undefined or empty");
            return;
        }

        const synth = synthRef.current;

        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        // Create a new speech instance
        const utterance = new SpeechSynthesisUtterance(message.text);
        utterance.rate = 0.85;  // Slightly slower for smoothness
        utterance.pitch = 1.0;  // Natural tone
        utterance.volume = 1.0;  // Max volume for clarity

        // Select the best voice available
        utterance.voice = voicesRef.current.find(voice =>
            voice.name.includes("Google UK English Female") ||
            voice.name.includes("Google US English Female")
        ) || voicesRef.current[0];  // Default to the first available voice

        // Prevent stuttering by restarting synthesis if needed
        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (err) => {
            console.error("Speech Synthesis Error:", err);
            setIsSpeaking(false);
        };

        // Play the text
        synth.cancel(); // Ensure a clean start
        synth.speak(utterance);
        utteranceRef.current = utterance;
    };


    const handleCopy = async () => {
        if (!message || !message.text) {
            console.error("Message is undefined or empty");
            return;
        }
        try {
            await navigator.clipboard.writeText(message.text);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <div className="flex space-x-4 p-2 border-t" style={{
            textAlign: "left", marginTop: "10px"
        }}>
            <Tooltip title="Copy">
                <IconButton onClick={handleCopy}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>
                </IconButton>
            </Tooltip>
            <Tooltip title="Good Response">
                <IconButton>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z" fill="currentColor"></path></svg>
                </IconButton></Tooltip>
            <Tooltip title="Bad Response">

                <IconButton>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z" fill="currentColor"></path></svg>
                </IconButton></Tooltip>
            <Tooltip title={isSpeaking ? "Stop Reading" : "Read Aloud"}>
                <IconButton onClick={handleSpeak}>
                    {isSpeaking ? (
                        // Stop button SVG
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9.5 8.5C8.94772 8.5 8.5 8.94772 8.5 9.5V14.5C8.5 15.0523 8.94772 15.5 9.5 15.5H14.5C15.0523 15.5 15.5 15.0523 15.5 14.5V9.5C15.5 8.94772 15.0523 8.5 14.5 8.5H9.5Z" fill="currentColor"></path>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"></path></svg>
                    )}
                </IconButton>
            </Tooltip>
        </div>
    );
};

// const MessageWithFeedback = ({ message, executeSQL, apiCortex }) => {
//     if (!message?.text) {
//         return null;
//     }

//     const isSQL = message.type === "sql";
//     const shouldShowFeedback = !isSQL || (message.summarized || message.streaming);
//     return (
//         <div className="mb-4">
//             <div
//                 className={`p-2 rounded-lg ${message.fromUser ? 'bg-blue-500 text-white' : isSQL ? 'bg-gray-900 text-white' : 'bg-gray-200 text-black'}`}
//                 style={{
//                     fontFamily: "ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol",
//                     textAlign: "left",
//                     padding: isSQL ? '12px' : '8px', // Extra padding for SQL blocks
//                     borderRadius: "8px"
//                 }}
//             >
//                 {isSQL ? (
//                     <SyntaxHighlighter language="sql" style={dracula}>
//                         {message.text}
//                     </SyntaxHighlighter>
//                 ) : (
//                     <Typography>{message.text}</Typography>
//                 )}

//                 {message.showExecute && (
//                     <Button
//                         variant="contained"
//                         color="#000"
//                         sx={{ marginTop: '10px' }}
//                         onClick={() => executeSQL(message)}
//                     >
//                         Execute SQL
//                     </Button>
//                 )}

//                 {message.showSummarize && (
//                     <Button
//                         variant="contained"
//                         color="#000"
//                         sx={{ marginTop: '10px' }}
//                         onClick={() => apiCortex(message)}
//                     >
//                         Summarize
//                     </Button>
//                 )}

//             </div>
//             {message.type === 'text' && !message.fromUser && shouldShowFeedback && (
//                 <Feedback message={message} />
//             )}

//         </div>
//     );
// };

const MessageWithFeedback = ({ message, executeSQL, apiCortex }) => {
    if (!message?.text) {
        return null;
    }

    const isSQL = message.type === "sql" || message.type === "table";
    const shouldShowFeedback = !isSQL || (message.summarized || message.streaming);

   
        console.log(message.executedResponse && Array.isArray(message.executedResponse)
        && message.executedResponse.length > 0);

       

    const convertToString = (input) => {
        if (typeof input === 'string') return input;
        if (Array.isArray(input)) return input.map(convertToString).join(', ');
        if (typeof input === 'object' && input !== null)
            return Object.entries(input).map(([k, v]) => `${k}: ${convertToString(v)}`).join(', ');
        return String(input);
    };

    return (
        <div className="mb-4">
            <div
                className={`p-2 rounded-lg ${message.fromUser ? 'bg-blue-500 text-white' : isSQL ? 'bg-gray-900 text-white' : 'bg-gray-200 text-black'}`}
                style={{
                    fontFamily: "ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol",
                    textAlign: "left",
                    padding: isSQL ? '12px' : '8px',
                    borderRadius: "8px"
                }}
            >
                {isSQL ? (
                    <SyntaxHighlighter language="sql" style={dracula}>
                        {message.text}
                    </SyntaxHighlighter>
                ) : (message.executedResponse && Array.isArray(message.executedResponse)
                && message.executedResponse.length > 0) ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'start',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            overflowX: 'auto',
                            maxWidth: '100%'
                        }}>
                            <table style={{
                                borderCollapse: 'collapse',
                                width: '100%',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                color: '#000',
                                tableLayout: 'fixed'
                            }}>
                                <thead>
                                    <tr>
                                        {Object.keys(message.executedResponse[0]).map((column) => (
                                            <th
                                                key={column}
                                                style={{
                                                    border: '1px solid #000',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#fff',
                                                    fontWeight: 'bold',
                                                    color: '#001f5b'
                                                }}
                                            >
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {message.executedResponse.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.keys(row).map((colKey) => (
                                                <td
                                                    key={`${rowIndex}-${colKey}`}
                                                    style={{
                                                        border: '1px solid #000',
                                                        padding: '8px',
                                                        textAlign: typeof row[colKey] === 'number' ? 'right' : 'left',
                                                        backgroundColor: '#fff'
                                                    }}
                                                >
                                                    {convertToString(row[colKey])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Typography>
                            {typeof message.executedResponse === 'string'
                                ? message.executedResponse
                                : message.text}
                        </Typography>
                    )}
                {message.showExecute && (
                    <Button
                        variant="contained"
                        color="#000"
                        sx={{ marginTop: '10px' }}
                        onClick={() => executeSQL(message)}
                    >
                        Execute SQL
                    </Button>
                )}

                {message.showSummarize && (
                    <Button
                        variant="contained"
                        color="#000"
                        sx={{ marginTop: '10px' }}
                        onClick={() => apiCortex(message)}
                    >
                        Summarize
                    </Button>
                )}

            </div>
            {message.type === 'text' && !message.fromUser && shouldShowFeedback && (
                <Feedback message={message} />
            )}

        </div>
    );
};

export default MessageWithFeedback;
