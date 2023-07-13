import { Cascader, Button, Modal, Result, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { useQuery, gql, useMutation } from '@apollo/client';

import {Layout, Header, Content, headerStyle, contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED } from '@/src/constants/configTheater/editTheater';

const GET_MOVIE_BY_ID = gql`
  query GetMovieByID($input: String) {
    getMovieByID(input: $input) {
      movie_name
      description
      genres
      movie_duration
      movie_image
    }
  }
`

const EDIT_MOVIE_BY_ID = gql`
  mutation EditMovieByID($input: EditMovieInput) {
    editMovieByID(input: $input) {
      httpCode
      message
    }
  }
`

const DELETE_MOVIE_BY_ID = gql`
  mutation DeleteMovieByID($input: DeleteMovieInput) {
    deleteMovieByID(input: $input) {
      httpCode
      message
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

export default function editmovie({token}) {
    const router = useRouter()

    const [ movieName, setMovieName ] = useState('')
    const [ description, setDescription ] = useState('')
    const [ genres, setGenres ] = useState([])
    const [ movieDuration, setMovieDuration ] = useState('')
    const [ movieImage, setMovieImage ] = useState('')

    const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false)
    const [statusBox, setStatusBox] = useState({})

    const {data: data_movie, data: loading_movie, error: error_movie, refetch: refetch_movie} = useQuery(GET_MOVIE_BY_ID,{
      variables: {
        input: {
          _movieID: router.query._movieID
        }
      }
    })

    // store fetched data
    useEffect(() => {
      if (data_movie) {
        if(data_movie.getMovieByID){
          setMovieName(data_movie.getMovieByID.data.theater_name)
          setDescription(data_movie.getMovieByID.data.description)
          setGenres(data_movie.getMovieByID.data.genres)
          setMovieDuration(data_movie.getMovieByID.data.movie_duration)
          setMovieImage(data_movie.getMovieByID.data.movie_image)
        }
      }
    }, [data_movie]);

    // refetch data everytime routing to this page
    useEffect(() => {
      const handleRouteChange = () => {
        if (router.pathname === '/systemconfig/theater/editmovie'){
          refetch_movie()
        }
      }
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }, [router.pathname, refetch_movie])

    const [editMovieByID, {data_e, loading_e, error_e}] = useMutation(EDIT_MOVIE_BY_ID, {
      onCompleted: (res) => {
        setStatusBox(res?.editMovieByID.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${res?.editMovieByID.message}`
        })
        setIsStatusModalOpen(true)
      }
    })

    const [deleteMovieByID, {data_d, loading_d, error_d}] = useMutation(DELETE_MOVIE_BY_ID, {
      onCompleted: (res) => {
        setStatusBox(res?.deleteMovieByID.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${res?.deleteMovieByID.message}`
        })
        setIsStatusModalOpen(true)
      }
    })


    // const onClickConfirmEdit = () => {
    //   setIsConfirmEditModalOpen(false)
    //   editTheaterByID({
    //     variables: {
    //       input: {
    //         _theaterID: router.query._theaterID,
    //         theater_name: theaterName,
    //         description: description
    //       }
    //     }
    //   })
    // }

    // const onClickConfirmDelete = () => {
    //   setIsConfirmDeleteModalOpen(false)
    //   deleteTheaterByID({
    //     variables: {
    //       input: {
    //         _theaterID: router.query._theaterID,
    //       }
    //     }
    //   })
    // }

    // const onOkStatusModal = () => {
    //   setIsStatusModalOpen(false)
    //   router.push('/systemconfig/movie')
    // }

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle} 
        >  

        <br/>
        <strong style={{fontSize:"250%"}}>EDIT MOVIE</strong>
        <br/>   
        <h4>movie ID: {router.query._movieID}</h4>
        <br/> 
        <br/> 

        {/* Edit Movie Name */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Edit Movie Name</h2>
          <Input type='text' size='medium' placeholder={movieName}
            value={movieName}
            onChange={(e) => {setTheaterName(e.target.value)}}  />
        </div>  

        {/*  */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Edit Movie Description</h2>
          <Input.TextArea
            showCount
            maxLength={512}
            style={{
              height: 100,
              marginBottom: 24,
            }}
            value={description}
            onChange={(e) => {setDescription(e.target.value)}}
            placeholder="movie description" 
          />
        </div> 

        {/* <Button 
          onClick={() => setIsConfirmDeleteModalOpen(true)} type='primary' danger>
          DELETE  Movie
        </Button> */}

        {/* <Button 
          onClick={() => setIsConfirmEditModalOpen(true)} type='primary'>
          EDIT Movie
        </Button> */}

        {/* Confirm Modal */}
        {/* <Modal centered title="" open={isConfirmEditModalOpen} onCancel={() => {setIsConfirmEditModalOpen(false)}} okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                title={'Editing Confirm'}
                subTitle={'Please confirm editing theatre with these detail'}
                extra={
                  <div>
                    <p>Theater ID: {router.query._theaterID}</p>
                    <p>Theater Name: {theaterName}</p>
                    <p>Theater Description: {description}</p>
                    <br/>
                    <Button onClick={() => {setIsConfirmEditModalOpen(false)}} >CANCLE</Button>
                    <Button onClick={() => {onClickConfirmEdit()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal> */}

        {/* Delete Modal */}
        {/* <Modal centered title="" open={isConfirmDeleteModalOpen}
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
                    <Button onClick={() => {setIsConfirmDeleteModalOpen(false)}} >CANCLE</Button>
                    <Button onClick={() => {onClickConfirmDelete()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal> */}

        {/* Editing Status Modal */}
        {/* <Modal centered title="" open={isStatusMordelOpen} onOk={onOkStatusModal} 
          onCancel={() => {setIsStatusModalOpen(false)}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                status={statusBox.status}
                title={statusBox.title}
                subTitle={statusBox.subTitle}
            />
        </Modal> */}

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

