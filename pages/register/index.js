import {Modal, Result} from 'antd'
import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED} from 'src/constants/register'

import React, {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';

import { useMutation, gql } from '@apollo/client';

const REGISTER = gql`
  mutation Mutation($input: RegisterInput!) {
  register(input: $input) {
    httpCode
    message
    }
  }
`;

export const getServerSideProps = ({ req, res }) => {
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })

  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
};

export default function register({token}) {
    const router = useRouter()
    useEffect(() => {
      if(token){
        router.push('/movies')
      }
    }, [])

    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [statusBox, setStatusBox] = useState({
      status: "",
      title: "",
      subtitle: ""
    })

    const [register, {data, loading, error}] = useMutation(REGISTER, {
      onCompleted: (data) => {
        setStatusBox(data?.register.httpCode === '200' ? 
          {
            status: SUCCESS.STATUS,
            title: SUCCESS.TITLE,
            subtitle: SUCCESS.SUBTITLE
          }:
          {
            status: FAILED.STATUS,
            title: FAILED.TITLE,
            subtitle: `${FAILED.SUBTITLE} ${data?.register.message}`
          }
        )
        setIsModalOpen(true)
      }
    })

    const onFirstnameChange = (e) => {
      setFirstname(e.target.value)
    }

    const onLastnameChange = (e) => {
      setLastname(e.target.value)
    }

    const onUsernameChange = (e) => {
      setUsername(e.target.value)
    }

    const onPasswordChange = (e) => {
      setPassword(e.target.value)
    }

    const onClickRegister = (e) => {
      register({variables: {
        input: {
          firstname,
          lastname,
          username,
          password
        }
      }})
    }

    const handleOk = () => {
      setIsModalOpen(false);
      if(statusBox.status === 'success') router.push('/login')
    };

    if (loading) return 'Registering...';
    if (error) return `Registering error! ${error.message}`;

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router}/>
        
        <Content
          style={contentStyle}
        >     
        <Modal centered title="" open={isModalOpen} onOk={handleOk} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
            status={statusBox.status}
            title={statusBox.title}
            subTitle={statusBox.subtitle}
          />
        </Modal>

        <br/>
        <strong style={{fontSize:"250%"}}>REGISTER</strong>
        <br/>   

        <div style={{width: "30%", margin:"auto"}}>
            <h3 style={{margin: "0 0 0 0"}}>Firstname</h3>
            <CustomInput type='text' size="large" placeholder="firstname" value={firstname} onChange={onFirstnameChange}/>
        </div> 

        <div style={{width: "30%", margin:"auto"}}>
            <h3 style={{margin: "0 0 0 0"}}>Lastname</h3>
            <CustomInput type='text' size="large" placeholder="lastname" value={lastname} onChange={onLastnameChange}/>
        </div> 

        <div style={{width: "30%", margin:"auto"}}>
            <h3 style={{margin: "0 0 0 0"}}>Username</h3>
            <CustomInput type='email' size="large" placeholder="username | email" value={username} onChange={onUsernameChange}/>
        </div> 

        <div style={{width: "30%", margin:"auto"}}>
            <h3 style={{margin: "0 0 0 0"}}>Password</h3>
            <CustomInput.Password size="large" placeholder="password" value={password} onChange={onPasswordChange}/>
        </div> 

        <CustomButton onClick={onClickRegister} 
          type='primary'>REGISTER</CustomButton>

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

