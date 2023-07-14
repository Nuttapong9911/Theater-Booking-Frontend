import React, { useState, useEffect, useCallback } from 'react'
import { Menu, Modal, Result} from 'antd';
import { deleteCookie } from 'cookies-next';
import { useDispatch, useSelector } from 'react-redux'
import { useQuery, gql } from '@apollo/client';

import {Header, headerStyle, Footer} from '../styles/components'
import { menus, loginregister, adminMenus } from '../constants/menubar'
import { SUCCESS, FAILED } from '../constants/logout';

const DECODE_TOKEN = gql`
  query Query($token: String) {
    decodeToken(token: $token) {
      user_id
      firstname
      lastname
      role
    }
  }
`;

const MenuBar = (props) => {
    const router = props.router

    const dispatch = useDispatch()
    const storeToken = useCallback((token) => dispatch({ type: "SETTOKEN", token: token }),[dispatch])
    
    const {data, loading, error} = useQuery(DECODE_TOKEN, {
      variables: {
        token: props.token
      },
      onCompleted: (data) => {
        if(data.decodeToken){
          storeToken({
            user_id: data.decodeToken.user_id, 
            firstname: data.decodeToken.firstname, 
            lastname: data.decodeToken.lastname,
            role: data.decodeToken.role
          })
        }
      }
    })

    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const menuOnClick = (e) => {
      router.push(e.key)
    }

    const onClickLogout = (e) => {  
      if (e.key === "logout"){
        setIsModalOpen(true)
      }
    }

    const handleOk = (e) => {
      setIsModalOpen(false);
      deleteCookie('THEATER_SEAT_BOOKING_COOKIE')
      router.reload()
    };

    const thisMenu = (router.pathname.split('/')[1] === 'systemconfig') ? 
      `/${router.pathname.split('/')[1]}/${router.pathname.split('/')[2]}` : 
      `/${router.pathname.split('/')[1]}`

    return (
          <div>

          <Modal centered title="" open={isModalOpen} onOk={handleOk} cancelButtonProps={{style: { display: 'none' }}} >
            <Result
              status={SUCCESS.STATUS}
              title={SUCCESS.TITLE}
              subTitle={SUCCESS.SUBTITLE}
            />
          </Modal>    

          { (data?.decodeToken) ? 
            (
            
            <div style={{display: 'flex', justifyContent:'space-between'}}>
              
              {
                (data.decodeToken.role === 'customer') ? 
                (
                <Menu
                  theme="light"
                  mode="horizontal"
                  defaultSelectedKeys={[thisMenu]}
                  items={menus}
                  style={{width: "80vw"}}
                  onClick={menuOnClick}
                />
                ):
                (
                <Menu
                  theme="light"
                  mode="horizontal"
                  defaultSelectedKeys={[thisMenu]}
                  items={adminMenus}
                  style={{width: "80vw"}}
                  onClick={menuOnClick}
                />
                )
              }
              

              <Menu
                theme="light"
                mode="horizontal"
                defaultSelectedKeys={["user"]}
                items={[{key: "user", label: `Hello ${data.decodeToken.firstname} ${data.decodeToken.lastname}`}, {key: "logout", label: "LOGOUT"}]}
                style={{width: "20vw"}} 
                onClick={onClickLogout}
                />
            </div>
              
            ):
            (
            <div style={{display: 'flex', justifyContent:'space-between'}}>
              <Menu
                theme="light"
                mode="horizontal"
                defaultSelectedKeys={[thisMenu]}
                items={menus}
                style={{width: "85vw"}}
                onClick={menuOnClick}
                />

              <Menu
                theme="light"
                mode="horizontal"
                defaultSelectedKeys={[thisMenu]}
                items={loginregister}
                style={{width: "15vw"}}
                onClick={menuOnClick}
                />
            </div>

            )
          }
      </div>
    )
}

const AppHeader = () => {
    return (
        <Header style={headerStyle}>
          <div style={{ padding:'50px 0'}} >
            <div>
              <h1 style={{fontSize: "40px"}}>THiNKMOVIE</h1>
              <h2>เว็บจองตั๋วหนังออนไลน์</h2>
              <span>Online Theater Seat Booking</span>
            </div>
          </div>
        </Header>
    )
}

const AppFooter = () => {
    return (
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©2023 Created by Ant UED
        </Footer>
    )
}

export {
    MenuBar,
    AppHeader,
    AppFooter
}