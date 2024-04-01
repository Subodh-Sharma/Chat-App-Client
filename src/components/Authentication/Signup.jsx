import React, { useState } from 'react';
import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Signup = () => {
  const [show1,setShow1] = useState(false);
  const [show2,setShow2] = useState(false);
  const handleClick1 = () => setShow1(!show1);
  const handleClick2 = () => setShow2(!show2);
  const [name,setName] = useState();
  const [email,setEmail] = useState();
  const [password,setPassword] = useState();
  const [confirmPassword,setConfirmPassword] = useState();
  const [pic,setPic] = useState();
  const [loading,setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const postDetails = (pic) => {
    setLoading(true);
    if(pic===undefined){
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top"
      })
      return;
    }
    if(pic.type === "image/jpeg" || pic.type === "image/png" || pic.type === "image/jpg"){
      const data = new FormData();
      data.append("file",pic);
      data.append("upload_preset","chat-app");
      data.append("cloud_name","dxrujb2zf");
      fetch("https://api.cloudinary.com/v1_1/dxrujb2zf/image/upload",{
        method:'post',body: data
      }).then((res)=>res.json()).then(data=>{
        setPic(data.url.toString());
        setLoading(false);
      }).catch((error)=>{
        console.log(error);
        setLoading(false);
      })
    }else{
      toast({
        title: "Choosen file is not an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top"
      })
      setLoading(false);
      return;
    }
  };

  const submitHandler = async()=>{
    setLoading(true);
    if(!name || !email || !password || !confirmPassword){
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top"
      })
      setLoading(false);
      return;
    }
    if(password!==confirmPassword){
      toast({
        title: "Password do not Matchs",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top"
      })
      return;
    }
    try{
      const config = {
        headers : {
          "Content-type":"application/json",
        }
      }
      const { data } = await axios.post("https://subodh-chat-app-server.vercel.app/api/user/signup",{name,email,password,pic},config);
      // const { data } = await axios.post("http://localhost:8000/api/user/signup",{name,email,password,pic},config);

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      localStorage.setItem("userInfo",JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    }catch(error){
      toast({
        title: "Registration Failed",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
    }
  };
  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show1 ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick1}>
              {show1 ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show2 ? "text" : "password"}
            placeholder="Confirm password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick2}>
              {show2 ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  )
}

export default Signup;