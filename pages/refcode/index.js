import { Button, Input, Image, Modal, Result, Descriptions } from 'antd';
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { gql, useLazyQuery } from '@apollo/client';
import {Layout, Content, contentStyle,Container} from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';

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
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })

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
            movie_date: ((new Date(res.getInfoFromRef.datetime_start)).toDateString()),
            movie_time: `${(new Date(res.getInfoFromRef.datetime_start)).toTimeString().split(" ")[0]}
              - ${(new Date(res.getInfoFromRef.datetime_end)).toTimeString().split(" ")[0]}`,
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

          <div style={{backgroundColor: "silver", width: "40%", lineHeight: "150%"}}>
            {
              (ticketInfo) && (
                <div>
                  <div style={{margin:"20% 0 10%"}}>
                    <Image
                      width={200}
                      height={250}
                      src={ticketInfo.movie_image}
                      fallback="data:image/png;base64,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"
                    />
                  </div>
                  <Descriptions style={{margin: "0px 20px 20px 20px"}} column={1} 
                    labelStyle={{fontWeight: "800", fontSize: "16px", backgroundColor: "gray", width: "35%"}} 
                    contentStyle={{fontSize: "13px", backgroundColor: "whitesmoke"}} bordered>
                    <Descriptions.Item label="MOVIE">{ticketInfo.movie_name?.toUpperCase()}</Descriptions.Item>
                    <Descriptions.Item label="DATE">{ticketInfo.movie_date}</Descriptions.Item>
                    <Descriptions.Item label="THEATER">{ticketInfo.theater_name}</Descriptions.Item>
                    <Descriptions.Item label="STATUS">{ticketInfo.ticket_status}</Descriptions.Item>
                    <Descriptions.Item label="TYPE">{ticketInfo.seat_type}</Descriptions.Item>
                    <Descriptions.Item label="SEAT">{ticketInfo.row}{ticketInfo.column}</Descriptions.Item>
                  </Descriptions>
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

