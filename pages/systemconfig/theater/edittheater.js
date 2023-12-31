import { Button, Modal, Result, Input } from 'antd';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Layout, Content, contentStyle, Container } from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED } from '@/src/constants/configTheater/editTheater';

const GET_THEATER_BY_ID = gql`
  query GetTheater($input: GetTheaterInput) {
    getTheaterByID(input: $input) {
      data {
        _id
        seats {
          seat_type
          price
        }
        theater_name
        description
      }
    }
  }
`

const EDIT_THEATER_BY_ID = gql`
  mutation EditTheater($input: EditTheaterInput) {
    editTheaterByID(input: $input) {
      httpCode
      message
    }
  }
`

const DELETE_THEATER_BY_ID = gql`
  mutation DeleteTheaterByID($input: DeleteTheaterInput) {
    deleteTheaterByID(input: $input) {
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

export default function edittheater({token}) {
    const router = useRouter()

    const [ theaterName, setTheaterName ] = useState("")
    const [ description, setDescription ] = useState("")
    const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({})

    const {data: data_theater, loading: loading_theater, error: error_theater} = useQuery(GET_THEATER_BY_ID,{
      variables: {
        input: {
          _theaterID: router.query._theaterID
        }
      },
      fetchPolicy: 'network-only'
    })

    // store fetched data
    useEffect(() => {
      if (data_theater) {
        if(data_theater.getTheaterByID){
          setTheaterName(data_theater.getTheaterByID.data.theater_name)
          setDescription(data_theater.getTheaterByID.data.description)
        }
      }
    }, [data_theater]);

    const [editTheaterByID, {data_e, loading_e, error_e}] = useMutation(EDIT_THEATER_BY_ID, {
      onCompleted: (res) => {
        setStatusBox(res?.editTheaterByID.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${res?.editTheaterByID.message}`
        })
        setIsStatusModalOpen(true)
      }
    })

    const [deleteTheaterByID, {data_d, loading_d, error_d}] = useMutation(DELETE_THEATER_BY_ID, {
      onCompleted: (res) => {
        setStatusBox(res?.deleteTheaterByID.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${res?.deleteTheaterByID.message}`
        })
        setIsStatusModalOpen(true)
      }
    })


    const onClickConfirmEdit = () => {
      setIsConfirmEditModalOpen(false)
      editTheaterByID({
        variables: {
          input: {
            _theaterID: router.query._theaterID,
            theater_name: theaterName,
            description: description
          }
        }
      })
    }

    const onClickConfirmDelete = () => {
      setIsConfirmDeleteModalOpen(false)
      deleteTheaterByID({
        variables: {
          input: {
            _theaterID: router.query._theaterID,
          }
        }
      })
    }

    const onOkStatusModal = () => {
      setIsStatusModalOpen(false)
      router.push('/systemconfig/theater')
    }

    if (loading_theater) return <div>loading</div>
    if (error_theater) return <div>error: {error_theater}</div>
    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle} 
        >  

        <br/>
        <strong style={{fontSize:"250%"}}>EDIT THEATER</strong>
        <br/> 
        <br/> 

        <div style={{width: '35%', margin: 'auto', paddingBottom: "30px"}}>
          <h4>Edit <span style={{fontWeight: '700'}}>Name</span></h4>
          <Input type='text' size='medium' placeholder={theaterName}
            value={theaterName}
            onChange={(e) => {setTheaterName(e.target.value)}}  />
        </div>  

        <div style={{width: '60%', margin: 'auto', paddingBottom: "30px"}}>
          <h4>Edit <span style={{fontWeight: '700'}}>Description</span></h4>
          <Input.TextArea
            showCount
            maxLength={512}
            style={{
              height: 100,
              marginBottom: 24,
            }}
            value={description}
            onChange={(e) => {setDescription(e.target.value)}}
            placeholder="theater description" 
          />
        </div> 

        <Button style={{width:"20%", margin: "0px 30px"}}
          onClick={() => setIsConfirmDeleteModalOpen(true)} type='primary' danger>
          DELETE THEATER
        </Button>

        <Button style={{width:"20%", margin: "0px 30px"}}
          onClick={() => setIsConfirmEditModalOpen(true)} type='primary'>
          CONFIRM EDITING
        </Button>

        <br/> 
        <br/> 

        <Modal centered title="" open={isConfirmEditModalOpen} onCancel={() => {setIsConfirmEditModalOpen(false)}} okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                title={'Editing Confirm'}
                subTitle={'Please confirm editing theatre with these detail'}
                extra={
                  <div>
                    <p><span style={{fontWeight:'700'}}>Theater ID: </span>{router.query._theaterID}</p>
                    <p><span style={{fontWeight:'700'}}>Theater Name: </span>{theaterName}</p>
                    <p><span style={{fontWeight:'700'}}>Theater Description: </span>{description}</p>
                    <br/>
                    <Button style={{margin: "0px 10px"}} onClick={() => {setIsConfirmEditModalOpen(false)}} >CANCLE</Button>
                    <Button style={{margin: "0px 10px"}} onClick={() => {onClickConfirmEdit()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        <Modal centered title="" open={isConfirmDeleteModalOpen}
          onCancel={() => {setIsConfirmDeleteModalOpen(false)}} 
          okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                status='warning'
                title='Deleting Confirm'
                subTitle='Please confirm deleting theatre with these detail'
                extra={
                  <div>
                    <p>Theater ID: {router.query._theaterID}</p>
                    <p>Theater Name: {theaterName}</p>
                    <p>Theater Description: {description}</p>
                    <br/>
                    <Button style={{margin: "0px 10px"}} onClick={() => {setIsConfirmDeleteModalOpen(false)}} >CANCLE</Button>
                    <Button style={{margin: "0px 10px"}} onClick={() => {onClickConfirmDelete()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        
        <Modal centered title="" open={isStatusMordelOpen} onOk={onOkStatusModal} 
          onCancel={() => {setIsStatusModalOpen(false)}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                status={statusBox.status}
                title={statusBox.title}
                subTitle={statusBox.subTitle}
            />
        </Modal>

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

