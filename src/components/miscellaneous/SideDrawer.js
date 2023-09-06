import React, { useState } from 'react'
import { Box, Tooltip, Button, Text, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,Input, useToast, Spinner } from '@chakra-ui/react';
import { BellIcon,ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from '../../context/ChatProvider';
import ChatLoading from '../ChatLoading';
import ProfileModal from './ProfileModal';
import UserListItem from '../UserAvatar/UserListItem';
import { useNavigate } from 'react-router-dom';
// import NotificationBadge, { Effect } from "react-notification-badge";
import axios from "axios";
import { getSender } from '../../config/ChatLogics';

const SideDrawer = () => {
  const [ search,setSearch ] = useState("");
  const [searchResult,setSearchResult] = useState([]);
  const [loading,setLoading] = useState(false);
  const [loadingChat,setLoadingChat] = useState();
  const navigate = useNavigate();
  const {user,setSelectedChat,chats,setChats,notification,setNotification} = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/")
  };

  const handleSearch = async() => {
    if(!search){
      toast({
        title:"Please enter something in Search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers : {
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.get(`https://subodh-chat-app-server.vercel.app/api/user?search=${search}`,config);
      setLoading(false);
      setSearchResult(data);

    }catch(error){
      toast({
        title:"Error Occured!",
        description: "Failed to load the Search Results",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })
      return;
    }
  }

  const accessChat = async(userId) => {
    try{
      setLoading(true);
      const config = {
        headers : {
          "Content-type":"application/json",
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.post('https://subodh-chat-app-server.vercel.appapi/chat',{userId},config);
      if(!chats.find((c)=>c._id===data._id)){
        setChats([data,...chats]);
      }
      setSelectedChat(data);
      setLoading(false);
      onClose();
    }catch(error){
      toast({
        title:"Error in fetching the chat!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })
      return;
    }
  };

  return (
    <>
    <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
      <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
        <Button variant="ghost" onClick={onOpen}>
          <i className="fas fa-search"></i>
          <Text display={{base:"none",md:"flex"}} px="4">Search user</Text>
        </Button>
      </Tooltip>
      <Text fontSize="2xl" fontFamily="Work sans">Talk-A-Tive</Text>
      <div>
        <Menu>
          <MenuButton p={1}>
            {/* <NotificationBadge count={notification.length} effect={Effect.SCALE}/> */}
            <BellIcon fontSize="2xl" m={1}/>
          </MenuButton>
          <MenuList pl={2}>
            {!notification.length && "No New Message"}
            {notification.map((notif) => (
              <MenuItem key={notif._id} onClick={()=>{
                setSelectedChat(notif.chat)
                setNotification(notification.filter((n) => n!== notif));
    
              }}>
                {notif.chat.isGroupChat? `New Message in ${notif.chat.chatName}`:`New Message from ${getSender(user,notif.chat.users)}`}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
          </MenuButton>
          <MenuList>
            <ProfileModal user={user}>
            <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuDivider/>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Box>
    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay/>
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
      <DrawerBody>
        <Box display="flex" pb={2}>
          <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e)=>setSearch(e.target.value)}/>
          <Button onClick={handleSearch}>Go</Button>
        </Box>
        {loading ? (<ChatLoading/>):(
          searchResult?.map(user => (
            <UserListItem key={user._id} user={user} handleFunction={()=>accessChat(user._id)}/>
          ))
        )}
        {loadingChat && <Spinner ml="auto" display="flex"/>}
      </DrawerBody>
      </DrawerContent>
    </Drawer>
    </>
  )
}

export default SideDrawer