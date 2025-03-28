import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, TextField, Menu, MenuItem, Divider, ListItemIcon, Button } from '@mui/material';
import { FaArrowUp, FaAngleDown, FaUserCircle } from 'react-icons/fa'; // Icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TaskIcon from '@mui/icons-material/Task';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import MessageWithFeedback from './Feedback';
import ApiService from '../services/apiService';
import HashLoader from 'react-spinners/HashLoader';
import ChartModal from './ChartModal';
import logo from '../assets/Logo.jpg';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import BarChartIcon from '@mui/icons-material/BarChart';
import 'react-toastify/dist/ReactToastify.css';

const MainContent = ({ collapsed, toggleSidebar, resetChat, selectedPrompt }) => {
    const [inputValue, setInputValue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [data, setData] = useState('');
    const [chatAnchorEl, setChatAnchorEl] = useState(null);
    const [searchAnchorEl, setSearchAnchorEl] = useState(null);
    const [selectedYamlModels, setSelectedYamlModels] = useState([]); // Store selected files
    const [selectedSearchModels, setSelectedSearchModels] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isSearchHovered, setIsSearchHovered] = useState(false);
    const [yamlFiles, setYamlFiles] = useState([]); // State to store API data
    const [searchFiles, setSearchFiles] = useState([]); // State to store API data
    const [uploadAnchorEl, uploadSetAnchorEl] = useState(null);
    const open = Boolean(uploadAnchorEl);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);


    const handleUploadMenuClick = (event) => {
        uploadSetAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        uploadSetAnchorEl(null);
    };

    const handleGraphClick = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        const fetchYamlFiles = async () => {
            try {
                const response = await ApiService.getCortexAnalystDetails(); // 
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
                const response = await ApiService.getCortexSearchDetails();
                setSearchFiles(response || []);
            } catch (error) {
                console.error("Error fetching Search files:", error);
                setSearchFiles([]);
            }
        };
        fetchSearchFiles();
    }, []);

    useEffect(() => {
        const anchor = document.getElementById('scroll-anchor');
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


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

        if (selectedFile) {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await axios.post('http://10.126.192.122:8888/upload_csv/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const successMessage = response?.data?.message || 'File uploaded successfully!';
                toast.success(successMessage, { position: 'top-right' });
                setSelectedFile(null);
            } catch (error) {
                toast.error('Upload failed. Please try again.', { position: 'top-right' });
                console.error('Upload error:', error);
            } finally {
                setIsUploading(false);
            }

            return;
        }

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
            setIsLoading(true);
            const response = await ApiService.sendTextToSQL(payload);
            const modelResponse = response?.response || "No valid response received.";
            const responseType = response?.type || "text";
            const prompt = response?.prompt || inputValue;
            const assistantMessage = { text: modelResponse || "No response received.", fromUser: false, type: responseType, showExecute: responseType === 'sql', prompt: prompt };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        } catch (error) {
            console.error("Error fetching API response:", error);
            const errorMessage = { text: "An error occurred while fetching data.", fromUser: false };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }

    };

    const executeSQL = async (sqlQuery) => {
        try {
            setIsLoading(true);
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
            };

            const response = await ApiService.runExeSql(payload);
            const data = await response;
            setData(data);
            const convertToString = (input) => {
                if (typeof input === 'string') {
                    return input;
                } else if (Array.isArray(input)) {
                    return input.map(convertToString).join(', ');
                } else if (typeof input === 'object' && input !== null) {
                    return Object.entries(input)
                        .map(([key, value]) => `${key}: ${convertToString(value)}`)
                        .join(', ');
                }
                return String(input);
            };
            let modelReply = "";
            if (data && Array.isArray(data) && data.length > 0) {
                const columns = Object.keys(data[0]);
                const rows = data;
                modelReply = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    {columns.map(column => (
                                        <th key={column} style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {columns.map(column => (
                                            <td key={`${rowIndex}-${column}`} style={{ border: '1px solid black', padding: '8px' }}>
                                                {convertToString(row[column])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(rows.length > 1 && columns.length > 1) && (
                            <Button
                                variant="contained"
                                startIcon={<BarChartIcon />}
                                sx={{ marginTop: '15px', fontSize: '0.875rem', fontWeight: 'bold', color: '#fff', backgroundColor: '#000' }}
                                onClick={handleGraphClick}
                            >
                                Graph View
                            </Button>
                        )}
                    </div>
                );
            } else if (typeof data === 'string') {
                modelReply = data;
            } else {
                modelReply = convertToString(data);
            }
            const botMessage = {
                text: modelReply,
                fromUser: false,
                executedResponse: data,
                showExecute: false,
                showSummarize: true,
                prompt: sqlQuery.prompt,
            };

            setMessages((prevChatLog) => [...prevChatLog, botMessage]);
        } catch (err) {
            const fallbackErrorMessage = 'Error communicating with backend.';
            const errorMessageContent = {
                role: 'assistant',
                text: (
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>{fallbackErrorMessage}</p>
                    </div>
                ),
                fromUser: false,
                showExecute: false,
                showSummarize: false,
            };
            setMessages((prevChatLog) => [...prevChatLog, errorMessageContent]); // Update chat log with assistant's error message
            console.error('Error:', err); // Log the error for debugging
        } finally {
            setIsLoading(false);
            setMessages((prevChatLog) =>
                prevChatLog.map((msg) =>
                    msg.text === sqlQuery.text
                        ? { ...msg, showExecute: false }
                        : msg
                )
            );
        }
    }

    const apiCortex = async (message) => {
        const sys_msg = "You are powerful AI assistant in providing accurate answers always. Be Concise in providing answers based on context.";

        const payload = {
            query: {
                aplctn_cd: "aedl",
                app_id: "aedl",
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
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let fullText = '';
            let isDone = false;

            setMessages(prev => [
                ...prev,
                {
                    text: '',
                    fromUser: false,
                    summarized: true,
                    type: 'text',
                    streaming: true
                }
            ]);

            while (!isDone) {
                const { value, done } = await reader.read();
                if (done) break;

                let chunk = decoder.decode(value, { stream: true });

                const eosIndex = chunk.indexOf("end_of_stream");
                if (eosIndex !== -1) {
                    chunk = chunk.slice(0, eosIndex);
                    isDone = true;
                }

                fullText += chunk;

                setMessages(prev => {
                    const lastIndex = prev.length - 1;
                    const last = prev[lastIndex];
                    if (last?.streaming) {
                        return [
                            ...prev.slice(0, lastIndex),
                            {
                                ...last,
                                text: fullText,
                                streaming: true
                            }
                        ];
                    }
                    return prev;
                });
            }
            setMessages(prev => {
                const updatedMessages = prev.map((msg, index) => {
                    if (msg === message) {
                        return {
                            ...msg,
                            showSummarize: false
                        };
                    }

                    if (index === prev.length - 1 && msg.streaming) {
                        return {
                            ...msg,
                            streaming: false,
                            summarized: true,
                            showSummarize: false
                        };
                    }

                    return msg;
                });

                return updatedMessages;
            });



        } catch (err) {
            console.error("Streaming error:", err);

            setMessages(prev => {
                if (prev.length && prev[prev.length - 1]?.streaming) {
                    return prev.slice(0, -1); // Remove failed message
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

    const handleUploadFromComputer = () => {
        handleClose();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };


    return (
        <><ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    padding: '20px',
                    transition: 'margin-left 0.3s ease',
                    justifyContent: submitted ? 'flex-start' : 'center',
                    alignItems: 'center', // Center horizontally
                    height: '100vh', // Ensure the content takes full height
                    position: 'relative', // Ensure dropdowns stay inside this box
                    transition: 'all 0.5s ease-in-out',
                    overflowY: 'auto',
                }}
            >
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px 30px',
                    position: 'absolute', top: '0px', left: '0', right: '0', zIndex: 100,
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

                <Box id="message-scroll-container" tabIndex={0}
                    sx={{
                        paddingTop: '80px',
                        paddingBottom: '140px',

                        flexGrow: 1,
                        textAlign: 'center',
                        marginTop: '50px',
                        width: '100%',
                        overflowY: 'scroll',
                        scrollbarWidth: 'none',
                        scrollBehavior: 'smooth', // Firefox
                        '&::-webkit-scrollbar': {
                            display: 'none', // Chrome, Safari
                        },
                        maxWidth: '45%', // Set max width as needed
                        margin: '0 auto', // Center it horizontally
                    }}>



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

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '20px' }}>
                            <HashLoader color="#000000" size={20} aria-label="Loading Spinner" data-testid="loader" />
                        </Box>
                    )}
                    <div id="scroll-anchor" style={{ height: 1 }} />


                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: messages.length === 0 ? '36%' : '40px', // Add spacing above input field
                    zIndex: 1200,
                }}>
                    {messages.length === 0 && (
                        <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: "600", fontSize: "28px", textAlign: "center", bottom: '57%', position: 'absolute', }}>
                            Data at your Fingertips
                        </Typography>
                    )}

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
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
                            {selectedFile && (
                                <Box sx={{ mr: 2, position: 'relative' }}>
                                    <Box
                                        sx={{
                                            height: 48,
                                            width: 48,
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#f9f9f9'
                                        }}
                                    >
                                        {isUploading ? (
                                            <CircularProgress size={22} />
                                        ) : (
                                            <InsertDriveFileIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
                                        )}

                                        <IconButton
                                            size="small"
                                            onClick={() => setSelectedFile(null)}
                                            sx={{
                                                position: 'absolute',
                                                top: '-6px',
                                                right: '-6px',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: '#333',
                                                },
                                                width: 18,
                                                height: 18,
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 12 }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            )}
                            <TextField
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault(); // Prevents new line in input field
                                        handleSubmit(); // Calls submit function
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
                                }} />

                            {messages.length !== 0 && (
                                <IconButton onClick={handleSubmit} sx={{ backgroundColor: "#5d5d5d", borderRadius: "50%" }}>
                                    <FaArrowUp color="#fff" />
                                </IconButton>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange} />


                        </Box>


                        {messages.length === 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between', // Ensures buttons left, submit button right
                                    alignItems: 'center',
                                    width: '100%',
                                    marginTop: '12px'
                                }}
                            >
                                <><Box sx={{ display: 'flex', gap: '8px' }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleUploadMenuClick}
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
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="" class="h-[18px] w-[18px]"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.5523 3 13 3.44772 13 4L13 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L13 13L13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20L11 13L4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11L11 11L11 4C11 3.44772 11.4477 3 12 3Z" fill="currentColor"></path></svg>
                                            Upload your Data
                                        </Button>


                                        {open && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: -50,
                                                    left: 0,
                                                    zIndex: 1300,
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    minWidth: '180px'
                                                }}
                                            >

                                                <MenuItem onClick={handleUploadFromComputer}>Upload from computer</MenuItem>
                                            </Box>
                                        )}
                                    </Box>
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



                                </Box>
                                    <IconButton onClick={handleSubmit} sx={{ backgroundColor: "#5d5d5d", borderRadius: "50%" }}>
                                        <FaArrowUp color="#fff" />
                                    </IconButton></>
                            </Box>
                        )}
                    </Box>
                </Box>

                <ChartModal
                    visible={isModalVisible}
                    onClose={handleModalClose}
                    chartData={data || []}  // Ensure you pass valid JSON data
                />
            </Box></>
    );
};

export default MainContent;
