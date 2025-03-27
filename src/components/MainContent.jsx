import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, TextField, Menu, MenuItem, Divider, ListItemIcon, Button } from '@mui/material';
import { FaArrowUp, FaAngleDown, FaUserCircle } from 'react-icons/fa'; // Icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TaskIcon from '@mui/icons-material/Task';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MessageWithFeedback from './Feedback';
import ApiService from '../services/apiService';
import logo from '../assets/Logo.jpg';

const MainContent = ({ collapsed, toggleSidebar, resetChat, selectedPrompt }) => {
    const [inputValue, setInputValue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [chatAnchorEl, setChatAnchorEl] = useState(null);
    const [searchAnchorEl, setSearchAnchorEl] = useState(null);
    const [selectedYamlModels, setSelectedYamlModels] = useState([]); // Store selected files
    const [selectedSearchModels, setSelectedSearchModels] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isSearchHovered, setIsSearchHovered] = useState(false);
    const [yamlFiles, setYamlFiles] = useState([]); // State to store API data
    const [searchFiles, setSearchFiles] = useState([]); // State to store API data
    const [aggregatedResponse, setAggregatedResponse] = useState('');
    const [displayedText, setDisplayedText] = useState('');
    const [promptQuestion, setPromptQuestion] = useState('');

    const typingSpeed = 60;

    useEffect(() => {
        const fetchYamlFiles = async () => {
            try {
                const response = await ApiService.fetchCortexAnalystDetails(); // 
                if (response && Array.isArray(response)) {
                    setYamlFiles(response); // Ensure it's an array
                } else {
                    setYamlFiles([]); // Set empty array to prevent errors
                }
            } catch (error) {
                console.error("Error fetching YAML files:", error);
                setYamlFiles([]); // Set empty array on error to avoid crashes
            }
        };

        fetchYamlFiles();
    }, []);

    useEffect(() => {
        const fetchSearchFiles = async () => {
            try {
                const response = await ApiService.fetchCortexSearchDetails();
                setSearchFiles(response || []);
            } catch (error) {
                console.error("Error fetching Search files:", error);
                setSearchFiles([]);
            }
        };
        fetchSearchFiles();
    }, []);

    // Effect to reset chat when "New Chat" is clicked
    useEffect(() => {
        if (resetChat) {
            setMessages([]);  // Clear messages
            setSubmitted(false);  // Move input back to center
            setInputValue('');  // Clear text input
        }
    }, [resetChat]);

    useEffect(() => {
        if (selectedPrompt) {
            setInputValue(selectedPrompt);  // Update input field with prompt text
            handleSubmit(selectedPrompt);   // Auto-submit the prompt
        }
    }, [selectedPrompt]);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleChatMenuClick = (event) => {
        setChatAnchorEl(event.currentTarget);
    };

    const handleSearchMenuClick = (event) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setChatAnchorEl(null);
        setSearchAnchorEl(null);
    };


    const handleYamlModelSelect = (file) => {
        setSelectedYamlModels((prev) =>
            prev.includes(file) ? prev.filter((item) => item !== file) : [...prev, file]
        );
    };

    const handleSearchModelSelect = (file) => {
        setSelectedSearchModels((prev) =>
            prev.includes(file) ? prev.filter((item) => item !== file) : [...prev, file]
        );
    };

    const handleSubmit = async () => {
        if (!inputValue.trim()) return; // Prevent empty submissions

        const userMessage = { text: inputValue, fromUser: true };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputValue('');
        setSubmitted(true);

        const payload = {
            "query": {
                "aplctn_cd": "aedldocai",
                "app_id": "docai",
                "api_key": "78a799ea-a0f6-11ef-a0ce-15a449f7a8b0",
                "model": "llama3.1-70b",
                "semantic_model": selectedYamlModels,
                "search_service": selectedSearchModels,
                "search_limit": 0,
                "prompt": {
                    "messages": [
                        {
                            "role": "user",
                            "content": inputValue
                        }
                    ]
                },
                "app_lvl_prefix": "",
                "session_id": "ec2aebd4-0a7e-415f-a26b-5b663fc9356c"
            }
        };
        try {
            const response = await ApiService.sendTextToSQL(payload);
            const modelResponse = response?.response || "No valid response received.";
            const responseType = response?.type || "text";
            const prompt = response?.prompt || inputValue;
            const assistantMessage = { text: modelResponse || "No response received.", fromUser: false, type: responseType, showExecute: responseType === 'sql',  prompt: prompt };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        } catch (error) {
            console.error("Error fetching API response:", error);
            const errorMessage = { text: "An error occurred while fetching data.", fromUser: false };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    const executeSQL = async (sqlQuery) => {
        const payload = {
            "query": {
                "aplctn_cd": "aedldocai",
                "app_id": "docai",
                "api_key": "78a799ea-a0f6-11ef-a0ce-15a449f7a8b0",
                "prompt": {
                    "messages": [
                        {
                            "role": "user",
                            "content": sqlQuery.prompt || sqlQuery.text
                        }
                    ]
                },
                "app_lvl_prefix": "",
                "session_id": "9df7d52d-da64-470c-8f4e-081be1dbbbfb",
                "exec_sql": sqlQuery.text
            }
        }
        try {
            const response = await ApiService.runExeSql(payload);
            const resultData = response?.data;
            const isTable = Array.isArray(resultData) && resultData.length > 0 && typeof resultData[0] === 'object';

            const convertToString = (input) => {
                if (typeof input === 'string') return input;
                if (Array.isArray(input)) return input.map(convertToString).join(', ');
                if (typeof input === 'object') return Object.entries(input).map(([k, v]) => `${k}: ${convertToString(v)}`).join(', ');
                return String(input);
              };
              const renderedResponse = isTable ? (
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>{Object.keys(resultData[0]).map(col => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resultData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => <td key={j}>{convertToString(val)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : convertToString(resultData);

            // const executedMessage = {
            //     text: sqlQuery.text,
            //     fromUser: false,
            //     executedResponse: isTable ? resultData : JSON.stringify(response, null, 2),
            //     type: isTable ? "table" : "result",
            //     showExecute: false,
            //     showSummarize: true,
            //     prompt: sqlQuery.prompt
            // };

            setMessages((prev) => [...prev, {
                text: sqlQuery.text,
                fromUser: false,
                executedResponse: resultData,
                content: renderedResponse,
                type: isTable ? "table" : "result",
                showExecute: false,
                showSummarize: true,
                prompt: sqlQuery.prompt
              }]);
            // setMessages((prevMessages) => [...prevMessages, executedMessage]);
            // setMessages((prevMessages) =>
            //     prevMessages.map((msg) =>
            //         msg.text === sqlQuery.text
            //             ? { ...msg, showExecute: false }
            //             : msg
            //     ).concat(executedMessage)
            // );

        } catch (error) {
            console.error("Error executing SQL:", error);
            const errorMessage = { text: "Error executing SQL query.", fromUser: false };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    const apiCortex = async (message) => {
        const sys_msg = "You are powerful AI assistant in providing accurate answers always. Be Concise in providing answers based on context.";
    
        const payload = {
            query: {
               aplctn_cd: "aedldocai",
               app_id: "docai",
               api_key: "78a799ea-a0f6-11ef-a0ce-15a449f7a8b0",
               method: "cortex",
               model: "llama3.1-70b-elevance",
               sys_msg: `${sys_msg}${JSON.stringify(message.executedResponse)}`,
               limit_convs: "0",
               prompt: {
                  messages: [
                     {
                        role: "user",
                        content: message.prompt,
                     }
                  ]
               },
               app_lvl_prefix: "",
               user_id: "",
               session_id: "ad339c7f-feeb-49a3-a5b5-009152b47006"
            }
         };
    
        try {
            const response = await fetch("http://10.126.192.122:8340/api/cortex/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.body) throw new Error("No stream in response.");
    
            // const reader = response.body.getReader();
            // const decoder = new TextDecoder();
    
            // let fullText = '';
            // let typingQueue = '';
            // let isTyping = false;
            // let isStreamEnded = false;
    
            // // Add a placeholder streaming message
            // const placeholderMessage = {
            //     text: '',
            //     fromUser: false,
            //     summarized: true,
            //     type: 'text',
            //     streaming: true
            // };
            // setMessages(prev => [...prev, placeholderMessage]);
    
            // const typeEffect = () => {
            //     if (typingQueue.length === 0) {
            //         isTyping = false;
            //         return;
            //     }
    
            //     const nextChar = typingQueue.charAt(0);
            //     typingQueue = typingQueue.slice(1);
    
            //     setMessages(prev => {
            //         const lastIndex = prev.length - 1;
            //         const last = prev[lastIndex];
            //         if (last?.streaming) {
            //             return [...prev.slice(0, lastIndex), { ...last, text: last.text + nextChar }];
            //         }
            //         return prev;
            //     });
    
            //     setTimeout(typeEffect, 30);
            // };
    
            // while (!isStreamEnded) {
            //     const { done, value } = await reader.read();
            //     if (done) break;
    
            //     const chunk = decoder.decode(value, { stream: true });
            //     const eosIndex = chunk.indexOf('end_of_stream');
            //     const validChunk = eosIndex !== -1 ? chunk.slice(0, eosIndex) : chunk;
    
            //     fullText += validChunk;
            //     typingQueue += validChunk;
            //     if (eosIndex !== -1) isStreamEnded = true;
    
            //     if (!isTyping && typingQueue.length > 0) {
            //         isTyping = true;
            //         typeEffect();
            //     }
            // }
    
            // // Remove summarize button and finalize stream
            // setMessages(prev =>
            //     prev.map(msg =>
            //         msg.text === message.text && msg.executedResponse === message.executedResponse
            //             ? { ...msg, summarized: true, showSummarize: false }
            //             : msg
            //     )
            // );
    
            // setMessages(prev => {
            //     const last = prev[prev.length - 1];
            //     if (last?.streaming) {
            //         return [
            //             ...prev.slice(0, -1),
            //             { ...last, streaming: false, summarized: true, showSummarize: false }
            //         ];
            //     }
            //     return prev;
            // });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
    
            let fullText = '';
            let typingQueue = '';
            let isTyping = false;
            let isStreamEnded = false;
    
            // Add initial assistant message so we can stream characters into it
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
            const typeEffect = () => {
                if (typingQueue.length === 0) {
                    isTyping = false;
                    return;
                }
    
                const nextChar = typingQueue.charAt(0);
                typingQueue = typingQueue.slice(1);
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.streaming) {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, content: last.content + nextChar, streaming: false, summarized: true, showSummarize: false }
                        ];
                    }
                    return prev;
                });
    
                setTimeout(typeEffect, 30); // typing speed
            };
    
            while (!isStreamEnded) {
                const { done, value } = await reader.read();
                if (done) break;
    
                let chunk = decoder.decode(value, { stream: true });
    
                const eosIndex = chunk.indexOf('end_of_stream');
                if (eosIndex !== -1) {
                    chunk = chunk.slice(0, eosIndex);
                    isStreamEnded = true;
                }
    
                fullText += chunk;
                typingQueue += chunk;
    
                if (!isTyping && typingQueue.length > 0) {
                    isTyping = true;
                    typeEffect();
                }
            }

              
    
    
        } catch (err) {
            console.error("Streaming error:", err);
            setMessages(prev => {
                if (prev.length && prev[prev.length - 1]?.streaming) {
                    return prev.slice(0, -1); // Remove failed placeholder
                }
                return prev;
            });
    
            const errorMessage = {
                text: "An error occurred while summarizing.",
                fromUser: false
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };
    
    

    
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                padding: '20px',
                transition: 'margin-left 0.3s ease',
                justifyContent: submitted ? 'flex-start' : 'center',
                alignItems: 'center', // Center horizontally
                minHeight: '100vh', // Ensure the content takes full height
                position: 'relative', // Ensure dropdowns stay inside this box
                transition: 'all 0.5s ease-in-out',
            }}
        >
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px 30px',
                position: 'absolute', top: '0px', left: '0', right: '0',
            }}>

                {collapsed && (
                    <IconButton
                        onClick={toggleSidebar}
                        sx={{
                            position: 'absolute',
                            top: '5px',
                            left: '-6px',
                            backgroundColor: 'transparent',
                            zIndex: 10,
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy">
                            <path fillRule="evenodd" clipRule="evenodd" d="M8.85719 3L13.5 3C14.0523 3 14.5 3.44772 14.5 4C14.5 4.55229 14.0523 5 13.5 5H11.5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V11.5C20.5 10.9477 20.9477 10.5 21.5 10.5C22.0523 10.5 22.5 10.9477 22.5 11.5V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM9.5 19V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor"></path>
                            <circle cx="20" cy="5" r="4" fill="#0285FF"></circle>
                        </svg>
                    </IconButton>
                )}

                <Box sx={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <Box>
                        <Typography
                            onClick={handleChatMenuClick}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            sx={{
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#5d5d5d',
                                backgroundColor: chatAnchorEl || isHovered ? "#f1f1f1" : "transparent",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "background-color 0.2s ease-in-out"
                            }}
                        >
                            Semantic Model
                            <FaAngleDown style={{ fontSize: '18px', color: "#5d5d5d" }} />
                        </Typography>

                        <Menu
                            anchorEl={chatAnchorEl}
                            open={Boolean(chatAnchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    width: 280,
                                    borderRadius: '12px',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                    fontSize: "0.875rem",
                                    width: "350px"
                                },
                            }}
                        >
                            {/* Header Section */}
                            <Box sx={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: "#5d5d5d" }}>
                                    YAML Models
                                </Typography>
                                <InfoOutlinedIcon sx={{ fontSize: '16px', color: "#5d5d5d" }} />
                            </Box>

                            {yamlFiles.length > 0 ? (
                                yamlFiles.map((file, index) => (
                                    <MenuItem
                                        key={index}
                                        onClick={() => handleYamlModelSelect(file)}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor: selectedYamlModels.includes(file) ? "#f1f1f1" : "transparent",
                                            "&:hover": { backgroundColor: "#f1f1f1" },
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: "bold", color: "#5d5d5d" }}>
                                            {file}
                                        </Typography>
                                        {selectedYamlModels.includes(file) && <CheckCircleIcon sx={{ fontSize: "16px", color: "#5d5d5d" }} />}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>
                                    <Typography sx={{ color: "#aaa" }}>No YAML files available</Typography>
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>

                    <Box>
                        <Typography
                            onClick={handleSearchMenuClick}
                            onMouseEnter={() => setIsSearchHovered(true)}
                            onMouseLeave={() => setIsSearchHovered(false)}
                            sx={{
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#5d5d5d',
                                backgroundColor: searchAnchorEl || isSearchHovered ? "#f1f1f1" : "transparent",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "background-color 0.2s ease-in-out"
                            }}
                        >
                            Search
                            <FaAngleDown style={{ fontSize: '18px', color: "#5d5d5d" }} />
                        </Typography>

                        <Menu
                            anchorEl={searchAnchorEl}
                            open={Boolean(searchAnchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    width: 280,
                                    borderRadius: '12px',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                    fontSize: "0.875rem",
                                    width: "400px"
                                },
                            }}
                        >
                            {/* Header Section */}
                            <Box sx={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: "#5d5d5d" }}>
                                    Search Models
                                </Typography>
                                <InfoOutlinedIcon sx={{ fontSize: '16px', color: "#5d5d5d" }} />
                            </Box>

                            {searchFiles.length > 0 ? (
                                searchFiles.map((file, index) => (
                                    <MenuItem
                                        key={index}
                                        onClick={() => handleSearchModelSelect(file)}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor: selectedSearchModels.includes(file) ? "#f1f1f1" : "transparent",
                                            "&:hover": { backgroundColor: "#f1f1f1" },
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: "bold", color: "#5d5d5d" }}>
                                            {file}
                                        </Typography>
                                        {selectedSearchModels.includes(file) && <CheckCircleIcon sx={{ fontSize: "16px", color: "#5d5d5d" }} />}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>
                                    <Typography sx={{ color: "#aaa" }}>No Search files available</Typography>
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>
                </Box>

                {/* Right Side - Share Button & Account */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: "ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol" }}>

                    <Typography variant="body1" sx={{ fontWeight: '500' }}>
                        Welcome, Balaji!
                    </Typography>
                    {/* Account Dropdown */}
                    <IconButton onClick={handleMenuClick}>
                        <FaUserCircle size={30} />                    </IconButton>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{
                        sx: {
                            width: 240,
                            borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                        }
                    }}>
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <TaskIcon fontSize="small" />
                            </ListItemIcon>
                            Tasks
                        </MenuItem>

                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <TuneIcon fontSize="small" />
                            </ListItemIcon>
                            Customize
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider />


                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <ExitToAppIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            <Box sx={{
                textAlign: 'center',
                marginTop: '50px',
                width: '100%',
                maxWidth: '45%', // Set max width as needed
                margin: '3% auto 0', // Center it horizontally
            }}>

                {messages.length === 0 && (
                    <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: "600", fontSize: "28px" }}>
                        Data at your Fingertips
                    </Typography>
                )}

                {messages.map((message, index) => (
                    <Box sx={{
                        width: '100%',
                        maxWidth: '100%',
                        margin: '10px auto 0',
                        overflowY: 'auto',
                    }}>
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: message.fromUser ? "flex-end" : "flex-start",
                                // flexDirection: message.fromUser ? 'row-reverse' : 'row',
                                alignItems: 'center',
                                marginBottom: '10px',
                            }}
                        >
                            {message.fromUser ? (
                                <Box
                                    sx={{
                                        padding: '10px',
                                        backgroundColor: message.fromUser ? 'hsla(0, 0%, 91%, .5)' : 'transparent', // User messages with background
                                        color: '#000',
                                        borderRadius: '10px',
                                        maxWidth: '75%',
                                    }}
                                >
                                    <Typography variant="body1">{message.text}</Typography>
                                </Box>
                            ) : (
                                <MessageWithFeedback message={message} executeSQL={executeSQL} apiCortex={apiCortex} />

                            )}
                        </Box>
                    </Box>

                ))}

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: messages.length === 0 ? '36%' : '40px',  // Add spacing above input field
                }}>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            padding: '12px 20px',
                            borderRadius: '20px',
                            border: '1px solid #e3e3e3',
                            boxSizing: 'border-box',
                            boxShadow: '0 0 0 0 #0000, 0 0 0 0 #0000, 0 9px 9px 0px rgba(0, 0, 0, 0.01), 0 2px 5px 0px rgba(0, 0, 0, 0.06)',
                            width: '100%',
                            maxWidth: '45%',
                            position: 'absolute',
                            bottom: submitted ? '20px' : '50%',
                            transform: submitted ? 'translateY(0)' : 'translateY(50%)',
                            transition: 'all 0.5s ease-in-out',

                        }}
                    >
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                            <TextField
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();  // Prevents new line in input field
                                        handleSubmit();  // Calls submit function
                                    }
                                }}
                                variant="standard"
                                placeholder="Ask anything"
                                sx={{
                                    flexGrow: 1,
                                    marginX: "10px",
                                    "& .MuiInputBase-root": {
                                        border: "none",
                                        boxShadow: "none",
                                    },
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "none !important",
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "none !important",
                                    },
                                    "& .MuiInput-underline": {
                                        visibility: "visible",
                                    },
                                }}
                            />

                            {messages.length !== 0 && (
                                <IconButton onClick={handleSubmit} sx={{ backgroundColor: "#5d5d5d", borderRadius: "50%" }}>
                                    <FaArrowUp color="#fff" />
                                </IconButton>
                            )}
                        </Box>


                        {messages.length === 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',  // Ensures buttons left, submit button right
                                    alignItems: 'center',
                                    width: '100%',
                                    marginTop: '12px'
                                }}
                            >
                                <><Box sx={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        variant="outlined"
                                        component="a"
                                        href="https://app-carelon-eda_preprod.privatelink.snowflakecomputing.com/carelon/eda_preprod/#/studio/analyst"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            borderRadius: "50px",
                                            textTransform: "none",
                                            fontSize: "14px",
                                            padding: "6px 12px",
                                            color: "#5d5d5d",
                                            borderColor: "#5d5d5d",
                                            fontSize: '13.3px'
                                        }}
                                    >
                                        Semantic Model
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        component="a"
                                        href="https://app-carelon-eda_preprod.privatelink.snowflakecomputing.com/carelon/eda_preprod/#/studio"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            borderRadius: "50px",
                                            textTransform: "none",
                                            fontSize: "14px",
                                            padding: "6px 12px",
                                            color: "#5d5d5d",
                                            borderColor: "#5d5d5d",
                                            fontSize: '13.3px'
                                        }}
                                    >
                                        Search Service
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        component="a"
                                        href="https://app-carelon-eda_preprod.privatelink.snowflakecomputing.com/carelon/eda_preprod/#/data/databases/DOC_AI_DB/schemas/DOC_AI_SCHEMA/stage/COC_STAGE"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            borderRadius: "50px",
                                            textTransform: "none",
                                            fontSize: "14px",
                                            padding: "6px 12px",
                                            color: "#5d5d5d",
                                            borderColor: "#5d5d5d",
                                            fontSize: '13.3px'
                                        }}
                                    >
                                        Upload your Data
                                    </Button>
                                </Box>
                                    <IconButton onClick={handleSubmit} sx={{ backgroundColor: "#5d5d5d", borderRadius: "50%" }}>
                                        <FaArrowUp color="#fff" />
                                    </IconButton></>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default MainContent;
