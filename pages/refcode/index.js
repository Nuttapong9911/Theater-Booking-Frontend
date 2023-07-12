import { Button, Input, Image, Modal, Result } from 'antd';
import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';

import { useQuery, gql, useLazyQuery } from '@apollo/client';

const READ_REF_CODE = gql`
  query ReadRefCode($input: GetInfoFromRefInput) {
    getInfoFromRef(input: $input) {
      movie_name
      ticket_status
      datetime_start
      datetime_end
      theater_name
      row
      column
      movie_image
      seat_type
    }
  }
`

export const getServerSideProps = ({ req, res }) => {
  const token = getCookie('login',{ req, res })

  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
      
};

export default function refCode({token}) {
    const router = useRouter()

    const [readRefCode, {data, loading, error}] = useLazyQuery(READ_REF_CODE)

    const [refcode, setRefCode] = useState("")

    const [ticketInfo, setTicketInfo] = useState()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const onRefCodeInputChange = (e) => {
      setRefCode(e.target.value)
    }

    const onClickModalFailed = () => {
      setRefCode("")
      setIsModalOpen(false)
    }

    const onClickCheckBtn = () => {
      readRefCode({variables: {
        input: {
          reference_code: refcode
        }
      },
      onCompleted: (res) => {
        if(res.getInfoFromRef){
          setTicketInfo({
            movie_name: res.getInfoFromRef.movie_name,
            movie_image: res.getInfoFromRef.movie_image,
            datetime_start: res.getInfoFromRef.datetime_start,
            datetime_end: res.getInfoFromRef.datetime_end,
            theater_name: res.getInfoFromRef.theater_name,
            ticket_status: res.getInfoFromRef.ticket_status,
            seat_type: res.getInfoFromRef.seat_type,
            row: res.getInfoFromRef.row,
            column: res.getInfoFromRef.column
          })
        }else{
          //popup ticket not found and clear input
          setIsModalOpen(true)
        }
        
      }
      })
    }

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle}
        >     

        <div style={{display: 'flex', position: 'relative'}}>
          <div style={{backgroundColor: "white", width: "60%", lineHeight: "150%", minHeight: '70vh'}}>

            <div style={{ margin: 'auto', marginTop: "250px" }}>
              <strong style={{fontSize:"250%"}}>REFERENCE CODE CHECKING</strong>
              <Input style={{width: "70%", margin: "20px 0"}} type='text' size="large"
                placeholder="reference code" onChange={onRefCodeInputChange}
                 />
            </div>

            <Button style={{width: "30%"}} type='primary' size='large' onClick={onClickCheckBtn}>CHECK</Button>

          </div>

          <div style={{backgroundColor: "gray", width: "40%", lineHeight: "150%"}}>
            {
              (ticketInfo) && (
                <div>
                  <Image
                    width={200}
                    height={250}
                    src={ticketInfo.movie_image}
                  />
                  <p>{ticketInfo.movie_name}</p>
                  <p>{ticketInfo.datetime_start}</p>
                  <p>{ticketInfo.datetime_end}</p>
                  <p>{ticketInfo.theater_name}</p>
                  <p>{ticketInfo.ticket_status}</p>
                  <p>{ticketInfo.seat_type}</p>
                  <p>{ticketInfo.row}</p>
                  <p>{ticketInfo.column}</p>
                </div>
              )
            }
          </div>

        </div> 

        <Modal centered title="" open={isModalOpen} onOk={onClickModalFailed} onCancel={onClickModalFailed} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
            status="error"
            title= "TICKET NOT FOUND"
            subTitle= "No any ticket match the given reference code. Reference code may be invalid or error may oocurs."
          />
        </Modal>
          
        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

