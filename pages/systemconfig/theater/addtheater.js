import { Button, Modal, Result, Input } from 'antd';
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { gql, useMutation } from '@apollo/client';
import { Layout, Content, contentStyle, Container } from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED } from '@/src/constants/configTheater/addTheater';

const CREATE_THEATER = gql`
  mutation CreateTheater($input: CreateTheaterInput) {
    createTheater(input: $input) {
      httpCode
      message
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

export default function addtheater({token}) {
    const router = useRouter()

    const [theaterName, setTheaterName] = useState('THEATER ')
    const [theaterDescription, setTheaterDescription] = useState('')

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({})

    const [createTheater, {data, loading, error}] = useMutation(CREATE_THEATER, {
      onCompleted: (res) => {
        setStatusBox(res?.createTheater.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${res?.createMovie.message}`
        })
        setIsStatusModalOpen(true)
      }
    })

    const onClickConfirmCreate = () => {
      setIsConfirmModalOpen(false)
      createTheater({variables : {
        input: {
          theater_name: theaterName,
          description: theaterDescription,
        }
      }})
    }

    const onOkStatusModal = () => {
      setIsStatusModalOpen(false)
      router.push('/systemconfig/theater', null, {shallow: false})
    }

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle} 
        >  

        <br/>
        <strong style={{fontSize:"250%"}}>CREATE NEW THEATER</strong>
        <br/>
        <br/>   

        <div style={{width: '40%', margin: 'auto', paddingBottom: "30px"}}>
          <h4><span style={{fontWeight: '700'}}>Theater Name</span></h4>            
          <Input value={theaterName} type='text' size='medium' placeholder='theater name' 
            onChange={(e) => {setTheaterName(e.target.value)}}  />
        </div>        

        <div style={{width: '40%', margin: 'auto' , paddingBottom: "30px"}}>
          <h4><span style={{fontWeight: '700'}}>Theater Description</span></h4>            
          <Input.TextArea
            showCount
            maxLength={512}
            style={{
              height: 100,
              marginBottom: 24,
            }}
            value={theaterDescription}
            onChange={(e) => {setTheaterDescription(e.target.value)}}
            placeholder="theater description" 
          />
        </div>

        <Button disabled={theaterName === ''} 
          onClick={() => setIsConfirmModalOpen(true)} type='primary'>
          CREATE NEW THEATER
        </Button>

        <br/>
        <br/>

        <Modal centered title="" open={isConfirmModalOpen} onCancel={() => {setIsConfirmModalOpen(false)}} 
          okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                title={'Creating Confirm'}
                subTitle={'Please confirm creating new theater with these detail'}
                extra={
                  <div>
                    <p><span style={{fontWeight:'700'}}>Theater Name: </span>{theaterName}</p>
                    <p><span style={{fontWeight:'700'}}>Description: </span>{theaterDescription}</p>
                    <br/>
                    <Button style={{margin: "0px 10px"}} onClick={() => {setIsConfirmModalOpen(false)}} >CANCLE</Button>
                    <Button style={{margin: "0px 10px"}} onClick={() => {onClickConfirmCreate()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        
        <Modal centered title="" open={isStatusMordelOpen} onOk={onOkStatusModal} onCancel={() => {setIsStatusModalOpen(false)}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                status={statusBox.status}
                title={statusBox.title}
                subTitle={statusBox.subTitle}
                extra={
                  <div>
                    <p>Theater Name: {theaterName}</p>
                    <p>Theater Description: {theaterDescription}</p>
                  </div>
                }
            />
        </Modal>

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

