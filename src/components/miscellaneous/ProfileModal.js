import { ViewIcon } from '@chakra-ui/icons';
import { IconButton,Button, useDisclosure,Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton, Image,Text } from '@chakra-ui/react'
import React from 'react'

const ProfileModal = ({user,children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
        {children ? (
            <span onClick={onOpen}>{children}</span>
        ):(
            <IconButton display={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}/>
        )}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader fontSize="40px" fontFamily="work sans" display="flex" justifyContent="center">{user.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between">
            <Image h="150px" w="150px" borderRadius="full" boxsize="150px" src={user.pic} alt={user.name}/>
            <Text fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"> Email: {user.email}</Text>
          </ModalBody>

          <ModalFooter display="flex" flexDir="column" alignItems="center" justifyContent="space-between">
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProfileModal;