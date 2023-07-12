import { Breadcrumb, Menu, theme, Card } from 'antd';
import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from '../src/styles/components'
import { MenuBar, AppHeader, AppFooter } from '../src/components/components';

import React from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';

export const getServerSideProps = ({ req, res }) => {
  const token = getCookie('login',{ req, res })
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
};

export default function home({token}) {
    const router = useRouter()

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle}
        >     

        <br/>
        <strong style={{fontSize:"250%"}}>HOME</strong>
        <br/>
        {(token)  &&
          (
            <CustomButton onClick={() => {console.log(token)}}>get token</CustomButton>
          )
        }
          
        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

