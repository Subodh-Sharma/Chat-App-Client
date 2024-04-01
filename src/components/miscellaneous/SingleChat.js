import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import { Box, Text,IconButton, Spinner, FormControl, Input,useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender,getSenderFull } from '../../config/ChatLogics';
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from './UpdateGroupChatModal';
import axios from 'axios';
import io from "socket.io-client";
// import Lottie from "react-lottie";
import ScrollableChat from './ScrollableChat';
import animationData from "../../animation/typing.json";
import "./style.css";

const ENDPOINT = "https://subodh-chat-app-server.vercel.app";
var selectedChatCompare;
const socket = io(ENDPOINT);

const SingleChat = ({fetchAgain,setFetchAgain}) => {
    const [messages,setMessages] = useState([]);
    const [loading,setLoading] = useState(false);
    const [newMessage,setNewMessage] = useState();
    const {user,selectedChat,setSelectedChat,notificaton,setNotification} = ChatState();
    const [socketConnected,setSocketConnected] = useState(false);
    const [typing,setTyping] = useState(false);
    const [isTyping,setIsTyping] = useState(false);
    const toast = useToast();

    // const defaultOptions = {
    //     loop: true,
    //     autoplay: true,
    //     animationData: animationData,
    //     rendererSettings: {
    //       preserveAspectRatio: "xMidYMid slice",
    //     },
    //   };

    const fetchMessages = async()=>{
        if(!selectedChat) return;
        try{
            const config = {
                
                headers: {
                    Authorization : `Bearer ${user.token}`
                }
            }
            setLoading(true);
            const {data} = await axios.get(`https://subodh-chat-app-server.vercel.app/api/message/${selectedChat._id}`,config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat",selectedChat._id);
        }catch(error){
            toast({
                title: "Failed to Fetch Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        }
    }
    
    const sendMessage = async(event)=> {
        if(event.key==="Enter" && newMessage){
            socket.emit("stop typing",selectedChat._id);
            try{
                const config = {
                    headers: {
                        "Content-Type":"application/json",
                        Authorization : `Bearer ${user.token}`
                    }
                }
                const {data} = await axios.post("https://subodh-chat-app-server.vercel.app/api/message",{
                    content:newMessage,
                    chatId: selectedChat._id
                },config);
                socket.emit("new message",data)
                setMessages([...messages,data]);
                setNewMessage("");
            }catch(error){
                toast({
                    title: "Failed to send Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            }
        }
    };

    useEffect(()=>{
        socket.emit("setup",user);
        socket.on("connected",()=>setSocketConnected(true))
        socket.on("typing",()=>setIsTyping(true))
        socket.on("stop typing",()=>setIsTyping(false));
        // eslint-disable-next-line
    },[])

    useEffect(()=>{
        fetchMessages();
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    },[selectedChat]);

    useEffect(()=>{
        socket.on("message recieved",(newMessageRecieved)=>{
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
                if(!notificaton.includes(newMessageRecieved)){
                    setNotification([newMessageRecieved,...notificaton]);
                    setFetchAgain(!fetchAgain);
                }
            }else{
                setMessages([...messages,newMessageRecieved]);
            }
        })
    })


    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if(!socketConnected) return;
        if(!typing){
            setTyping(true);
            socket.emit("typing",selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timer = 3000;
        setTimeout(()=>{
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if(timeDiff >= timer && typing){
                socket.emit("stop typing",selectedChat._id);
                setTyping(false);
            }
        },timer)
    };

  return (
    <>{selectedChat ? (
    <>
        <Text fontSize={{ base: "28px", md: "30px" }} pb={3} px={2} w="100%" fontFamily="Work sans" display="flex" justifyContent={{ base: "space-between" }} alignItems="center">
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
            <>
                {getSender(user,selectedChat.users)}
                <ProfileModal user={getSenderFull(user,selectedChat.users)}/>
            </>
            ):(
                <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages}/>
                </>
            )}
        </Text>
        <Box display="flex" flexDir="column" justifyContent="flex-end" p={3} bg="#E8E8E8" w="100%" h="100%" borderRadius="lg" overflowY="hidden">
            {loading ? (<Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto"/>):(
                <div className='messages'>
                    <ScrollableChat messages={messages}/>
                </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                {isTyping ? <span>typing...</span>: <></>}
                <Input variant="filled" bg="#E0E0E0" placeholder="Enter a message..." onChange={typingHandler} value={newMessage}/>
            </FormControl>
        </Box>
    </>):(
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                Click on a User to start Chatting.
            </Text>
        </Box>
    )}</>
  )
}

export default SingleChat;