import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Link, Typography, Divider, Tooltip } from '@mui/material';
import { FaComments, FaSearch, FaPen, FaSun, FaUser, FaInfoCircle, FaSignOutAlt, FaTrashAlt, FaAngleLeft, FaAngleRight, FaBell, } from 'react-icons/fa'; // Icons
import logo from '../assets/Logo.jpg';

const Sidebar = ({ collapsed, toggleSidebar, onNewChat, onPromptSelect }) => {


    const prompts = [
        'what is the worst measure for h0544?',
        'Which measure for contract H0544 has shown the greatest increase from prior year to current year?',
        'What is Hedis?',
    ];

    if (collapsed) return null;


    return (
        <Box
            sx={{
                width: '230px',
                backgroundColor: '#f9f9f9',
                padding: '13px',
                boxShadow: '2px 0px 5px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px',
                    position: 'relative',
                }}
            >
                <IconButton
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                    sx={{ position: 'absolute', left: '-9px', backgroundColor: 'transparent' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.85719 3L13.5 3C14.0523 3 14.5 3.44772 14.5 4C14.5 4.55229 14.0523 5 13.5 5H11.5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V11.5C20.5 10.9477 20.9477 10.5 21.5 10.5C22.0523 10.5 22.5 10.9477 22.5 11.5V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM9.5 19V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor"></path>
                        <circle cx="20" cy="5" r="4" fill="#0285FF"></circle>
                    </svg>
                </IconButton>
                <Box sx={{ display: 'flex', position: 'absolute', right: '-7px', }}>
                    <IconButton
                        aria-label="search"
                    // sx={{ position: 'absolute', right: '10px', backgroundColor: 'transparent' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-xl-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 4.25C7.16015 4.25 4.25 7.16015 4.25 10.75C4.25 14.3399 7.16015 17.25 10.75 17.25C14.3399 17.25 17.25 14.3399 17.25 10.75C17.25 7.16015 14.3399 4.25 10.75 4.25ZM2.25 10.75C2.25 6.05558 6.05558 2.25 10.75 2.25C15.4444 2.25 19.25 6.05558 19.25 10.75C19.25 12.7369 18.5683 14.5645 17.426 16.0118L21.4571 20.0429C21.8476 20.4334 21.8476 21.0666 21.4571 21.4571C21.0666 21.8476 20.4334 21.8476 20.0429 21.4571L16.0118 17.426C14.5645 18.5683 12.7369 19.25 10.75 19.25C6.05558 19.25 2.25 15.4444 2.25 10.75Z" fill="currentColor"></path></svg>
                    </IconButton>

                    <IconButton
                        aria-label="New chat"
                        onClick={onNewChat}
                    // sx={{ position: 'absolute', right: '10px', backgroundColor: 'transparent' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy">
                            <path d="M15.6729 3.91287C16.8918 2.69392 18.8682 2.69392 20.0871 3.91287C21.3061 5.13182 21.3061 7.10813 20.0871 8.32708L14.1499 14.2643C13.3849 15.0293 12.3925 15.5255 11.3215 15.6785L9.14142 15.9899C8.82983 16.0344 8.51546 15.9297 8.29289 15.7071C8.07033 15.4845 7.96554 15.1701 8.01005 14.8586L8.32149 12.6785C8.47449 11.6075 8.97072 10.615 9.7357 9.85006L15.6729 3.91287ZM18.6729 5.32708C18.235 4.88918 17.525 4.88918 17.0871 5.32708L11.1499 11.2643C10.6909 11.7233 10.3932 12.3187 10.3014 12.9613L10.1785 13.8215L11.0386 13.6986C11.6812 13.6068 12.2767 13.3091 12.7357 12.8501L18.6729 6.91287C19.1108 6.47497 19.1108 5.76499 18.6729 5.32708ZM11 3.99929C11.0004 4.55157 10.5531 4.99963 10.0008 5.00007C9.00227 5.00084 8.29769 5.00827 7.74651 5.06064C7.20685 5.11191 6.88488 5.20117 6.63803 5.32695C6.07354 5.61457 5.6146 6.07351 5.32698 6.63799C5.19279 6.90135 5.10062 7.24904 5.05118 7.8542C5.00078 8.47105 5 9.26336 5 10.4V13.6C5 14.7366 5.00078 15.5289 5.05118 16.1457C5.10062 16.7509 5.19279 17.0986 5.32698 17.3619C5.6146 17.9264 6.07354 18.3854 6.63803 18.673C6.90138 18.8072 7.24907 18.8993 7.85424 18.9488C8.47108 18.9992 9.26339 19 10.4 19H13.6C14.7366 19 15.5289 18.9992 16.1458 18.9488C16.7509 18.8993 17.0986 18.8072 17.362 18.673C17.9265 18.3854 18.3854 17.9264 18.673 17.3619C18.7988 17.1151 18.8881 16.7931 18.9393 16.2535C18.9917 15.7023 18.9991 14.9977 18.9999 13.9992C19.0003 13.4469 19.4484 12.9995 20.0007 13C20.553 13.0004 21.0003 13.4485 20.9999 14.0007C20.9991 14.9789 20.9932 15.7808 20.9304 16.4426C20.8664 17.116 20.7385 17.7136 20.455 18.2699C19.9757 19.2107 19.2108 19.9756 18.27 20.455C17.6777 20.7568 17.0375 20.8826 16.3086 20.9421C15.6008 21 14.7266 21 13.6428 21H10.3572C9.27339 21 8.39925 21 7.69138 20.9421C6.96253 20.8826 6.32234 20.7568 5.73005 20.455C4.78924 19.9756 4.02433 19.2107 3.54497 18.2699C3.24318 17.6776 3.11737 17.0374 3.05782 16.3086C2.99998 15.6007 2.99999 14.7266 3 13.6428V10.3572C2.99999 9.27337 2.99998 8.39922 3.05782 7.69134C3.11737 6.96249 3.24318 6.3223 3.54497 5.73001C4.02433 4.7892 4.78924 4.0243 5.73005 3.54493C6.28633 3.26149 6.88399 3.13358 7.55735 3.06961C8.21919 3.00673 9.02103 3.00083 9.99922 3.00007C10.5515 2.99964 10.9996 3.447 11 3.99929Z" fill="currentColor"></path>
                        </svg>
                    </IconButton>
                </Box>
            </Box>
            <Link
                href="/"
                sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: "7px",
                    padding: '23px 0',
                    backgroundColor: 'var(--sidebar-surface-primary)',
                    borderRadius: '8px',
                }}
                onClick={onNewChat}
            >

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 24,
                        height: 24,
                        backgroundColor: 'var(--token-main-surface-primary)',
                        borderRadius: '50%',
                        '&:hover': {
                            backgroundColor: '#0285FF', // Highlight color on hover
                            transform: 'scale(1.1)', // Optional: slight scale effect on hover
                        },
                    }}
                >
                    {/* <FaComments size={16} color="#000000" /> */}
                    <img
                        src={logo} // Update this with the correct image path
                        style={{ width: '24px', height: '24px' }}
                    />
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#333', // Default text color
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        fontSize: '1.1rem'
                    }}
                >
                    Data Flywheel
                </Typography>
            </Link>
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                }}
            >
                {/* Projects Heading */}
                <Typography
                    id="snorlax-heading"
                    variant="caption"
                    sx={{
                        margin: '10px 0',
                        fontWeight: 'bold',
                    }}
                >
                    Prompts
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: "10px" }}>
                    {prompts.map((prompt, index) => (
                        <Box
                            key={index}
                            sx={{
                                borderRadius: '4px',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0', // or any hover color you prefer
                                },
                            }}
                            onClick={() => onPromptSelect(prompt)}
                        >
                            <Tooltip title={prompt} placement="right" arrow>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        width: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        fontSize: '.885rem',
                                        lineHeight: 1.25,
                                        padding: ".3rem",
                                        gap: ".5rem",
                                        paddingLeft: 0,
                                        color: "#0d0d0d"
                                    }}
                                >
                                    {prompt}
                                </Typography>
                            </Tooltip>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Divider sx={{ marginY: '20px' }} />
            <Box sx={{ marginTop: 'auto' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        marginBottom: '5px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        },
                    }}
                >
                    <FaTrashAlt style={{ marginRight: '10px' }} />
                    <Typography variant="body2" sx={{ fontSize: "0.775rem" }}>Clear conversations</Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        marginBottom: '5px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        },
                    }}
                >
                    <FaInfoCircle style={{ marginRight: '10px' }} />
                    <Typography variant="body2" sx={{ fontSize: "0.775rem" }}>Updates & FAQ</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;

