import { ViewIcon } from '@chakra-ui/icons';
import { useDisclosure,Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, IconButton, useToast, Box, Input, FormControl, Spinner} from '@chakra-ui/react';
import React,{useState} from 'react'
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({fetchAgain,setFetchAgain,fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search,setSearch] = useState("");
    const [searchResult,setSearchResult] = useState([]);
    const [loading,setLoading] = useState(false);
    const [renameLoading,setRenameLoading] = useState(false);
    const toast = useToast();

    const {selectedChat,setSelectedChat,user} = ChatState();

    const handleAddUser = async(user1)=>{
        if(selectedChat.users.find((u)=>u._id === user1._id)){
            toast({
                title: "User Already in Group",
                status : "warning",
                duration: 5000,
                isClosable :true,
                position:"top"
            })
            return;
        }
        if(selectedChat.groupAdmin._id !== user._id){
            toast({
                title: "Only admin Can add Someone",
                status : "warning",
                duration: 5000,
                isClosable :true,
                position:"top"
            })
            return;
        }
        try{
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.put("/api/chat/groupadd",{
                chatId: selectedChat._id,
                userId: user1._id
            },config);
            setSelectedChat(data);
            setLoading(false);
            setFetchAgain(!fetchAgain);
        }catch(error){
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status : "warning",
                duration: 5000,
                isClosable :true,
                position:"top"
            })
            return;
        }
        
    }

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
          toast({
            title: "Only admins can remove someone!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }
    
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.put(
            `/api/chat/groupremove`,
            {
              chatId: selectedChat._id,
              userId: user1._id,
            },
            config
          );
    
          user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
          setLoading(false);
          setFetchAgain(!fetchAgain);
          fetchMessages();
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
        }
      };

    const handleRename = async()=>{
        if(!groupChatName) return;
        try{
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const {data} = await axios.put('/api/chat/rename',{
                chatId: selectedChat._id,
                chatName: groupChatName
            },config);
            setSelectedChat(data);
            setRenameLoading(false);
            setFetchAgain(!fetchAgain);
            setGroupChatName("");
        }catch(error){
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    };

    const handleSearch = async(query)=>{
        setSearch(query);
        if(!query){
          return;
        }
        try{
          setLoading(true);
          const config = {
            headers : {
              Authorization: `Bearer ${user.token}`
            }
          }
          const {data} = await axios.get(`/api/user?search=${search}`,config)
          setLoading(false);
          setSearchResult(data);
        }catch(error){
          toast({
            title: "Error Occured!",
            description: error.message,
            status:"error",
            duration:5000,
            isClosable: true,
            position: "bottom"
          })
        }
      };

  return (
    <>
        <IconButton display={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}/>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
          <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
            {selectedChat.users.map((u)=>(
              <UserBadgeItem key={user._id} user={u} admin={selectedChat.groupAdmin} handleFunction={()=>handleRemove(u)}/>
            ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (<Spinner size="lg"/>):(
                searchResult?.map((user)=>(
                    <UserListItem key={user._id} user={user} handleFunction={()=>handleAddUser(user)}/>
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' onClick={()=>handleRemove(user)} >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModal;