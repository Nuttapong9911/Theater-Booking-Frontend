import {Modal, Result} from 'antd'
import React, {useEffect, useState} from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { setCookie, getCookie } from 'cookies-next';
import { useMutation, gql } from '@apollo/client';
import {Layout, Content, contentStyle, CustomButton, CustomInput, Container} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED } from 'src/constants/login';

export const getServerSideProps = ({ req, res }) => {
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
      
};

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
  login(input: $input) {
    httpCode
    message
    token
  }
}
`;

export default function login({token}) {
    const router = useRouter()
    const storedToken = useSelector((state) => state.token.value)
    useEffect(() => {
      if(storedToken.user_id !== ''){
        router.push('/movies')
      }
    }, [storedToken])

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({
      status: "",
      title: "",
      subtitle: ""
    })

    const [login, {data, loading, error}] = useMutation(LOGIN, {
      onCompleted: (data) => {
        if (data?.login.httpCode === '200') {
          setStatusBox({
            status: SUCCESS.STATUS,
            title: SUCCESS.TITLE,
            subtitle: SUCCESS.SUBTITLE
          })
          setCookie('THEATER_SEAT_BOOKING_COOKIE' ,data?.login.token, {maxAge:120 * 60})
        }else {
          setStatusBox({
            status: FAILED.STATUS,
            title: FAILED.TITLE,
            subtitle: `${FAILED.SUBTITLE} ${data?.login.message}`
          })
        }
        setIsModalOpen(true)
        
      }
    })

    const onUsernameChange = (e) => {
      setUsername(e.target.value)
    }

    const onPasswordChange = (e) => {
      setPassword(e.target.value)
    }

    const onClickLogin = (e) => {
      login({variables: {
        input: {
          username,
          password
        }
      }})
    }

    const handleOk = () => {
      setIsModalOpen(false);
      if(statusBox.status === 'success'){
        router.push('/movies')
      }
        
    };

    if (loading) return 'Logining...';
    if (error) return `Logining error! ${error.message}`;

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle}
        >  

        <br/>
        <strong style={{fontSize:"250%"}}>LOGIN</strong>
        <br/> 
        <br/> 

        <Modal centered title="" open={isModalOpen} onOk={handleOk} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
            status={statusBox.status}
            title={statusBox.title}
            subTitle={statusBox.subtitle}
          />
        </Modal>

        <div style={{width: "30%", margin:"auto"}}>
            <h3 style={{margin: "0 0 0 0"}}>Username</h3>
            <CustomInput type='email' size="large" placeholder="email" value={username} onChange={onUsernameChange}/>
        </div> 

        <div style={{width: "30%", margin:"auto"}}>
            <h3 style={{margin: "0 0 0 0"}}>Password</h3>
            <CustomInput.Password size="large" placeholder="password" value={password} onChange={onPasswordChange}/>
        </div> 

        <CustomButton  onClick={onClickLogin}  
         type='primary' >LOGIN</CustomButton>
        
        <br/> 
        <br/> 

          
        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

