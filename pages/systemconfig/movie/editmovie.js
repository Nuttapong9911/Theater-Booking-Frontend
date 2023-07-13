import { Card, Button, Modal, Result, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { useQuery, gql, useMutation } from '@apollo/client';

import {Layout, Header, Content, headerStyle, contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from '@/src/components/components';
import { SUCCESS, FAILED } from '@/src/constants/configTheater/editTheater';
import { allGenre } from '@/src/constants/movieGenres';
import withAuth from '@/src/middleware';

const GET_MOVIE_BY_ID = gql`
  query GetMovieByID($input: GetMovieByIDInput) {
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
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
};

function editmovie({token}) {
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

    const {data: data_movie, loading: loading_movie, error: error_movie, refetch: refetch_movie} = useQuery(GET_MOVIE_BY_ID,{
      variables: { input: { _movieID: router.query._movieID } },
      onCompleted: () => {
        console.log('query completed')
      }
    })

    // store fetched data
    useEffect(() => {
      if (data_movie) {
        if(data_movie.getMovieByID){
          console.log(data_movie.getMovieByID)
          setMovieName(data_movie.getMovieByID.movie_name)
          setDescription(data_movie.getMovieByID.description)
          setGenres(data_movie.getMovieByID.genres)
          setMovieDuration(data_movie.getMovieByID.movie_duration)
          setMovieImage(data_movie.getMovieByID.movie_image)
        }
      }
    }, [data_movie]);

    // refetch data everytime routing to this page
    useEffect(() => {
      const handleRouteChange = () => {
        if (router.pathname === '/systemconfig/movie/editmovie'){
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

    const onClickConfirmEdit = () => {
      setIsConfirmEditModalOpen(false)
      editMovieByID({
        variables: {
          input: {
            _movieID: router.query._movieID,
            movie_name: movieName,
            description: description,
            genre: genres,
            movie_duration: movieDuration,
            movie_image: movieImage,
          }
        }
      })
    }

    const onClickConfirmDelete = () => {
      setIsConfirmDeleteModalOpen(false)
      deleteMovieByID({
        variables: {
          input: {
            _movieID: router.query._movieID,
          }
        }
      })
    }

    const onOkStatusModal = () => {
      setIsStatusModalOpen(false)
      router.push('/systemconfig/movie')
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
        <strong style={{fontSize:"250%"}}>EDIT MOVIE</strong>
        <br/>   
        <h4>movie ID: {router.query._movieID}</h4>


        {/* Movie Poster */}
        <Card
          key={movieImage}
          hoverable
          style={{
            width: 200,
            height: 380,
            margin: "auto"
          }}
          cover={<img alt={movieImage} src={movieImage} height="250" />}
        >
          {(movieName !== '' && genres.length > 0) && (
            <Card.Meta title={movieName} description={genres.reduce((str, genre) => {return str += ` ${genre}`})} />
          )}
        </Card>
        <br/> 

        {/* Edit Movie Name */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Edit Movie Name</h2>
          <Input type='text' size='medium' placeholder={movieName}
            value={movieName}
            onChange={(e) => {setMovieName(e.target.value)}}  />
        </div>  

        {/* Edit Movie Description */}
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

        {/* Edit Movie Genres */}
        <div style={{width: '40%', margin: 'auto'}}>
            <h2>Edit Movie Genres</h2>
            <Select
              mode="multiple"
              allowClear
              style={{
                width: '100%',
              }}
              placeholder='Select Movie Genres'
              
              value={genres}
              onChange={(value) => {setGenres(value)}}
              options={allGenre.map((genre) => {return {label: genre, value: genre}})}
            />
        </div>
        
        {/* Edit Movie Duration */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Edit Movie Duration</h2>
          <Input type='number' size='medium' placeholder={movieDuration}
            value={movieDuration}
            onChange={(e) => {setMovieDuration(e.target.value)}}  />
        </div>  

        {/* Edit Movie Image */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Edit Movie Image Link</h2>
          <Input type='text' size='medium' placeholder={movieImage}
            value={movieImage}
            onChange={(e) => {setMovieImage(e.target.value)}}  />
        </div>  
        

        <Button 
          onClick={() => setIsConfirmDeleteModalOpen(true)} type='primary' danger>
          DELETE  Movie
        </Button>

        <Button 
          onClick={() => setIsConfirmEditModalOpen(true)} type='primary'>
          EDIT Movie
        </Button>

        {/* Confirm Modal */}
        <Modal centered title="" open={isConfirmEditModalOpen} onCancel={() => {setIsConfirmEditModalOpen(false)}} 
          okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                title={'Editing Confirm'}
                subTitle={'Please confirm editing movie with these detail'}
                extra={
                  <div>
                    <p>Movie ID: {router.query._movieID}</p>
                    <p>Name: {movieName}</p>
                    <p>Description: {description}</p>
                    {(genres.length > 0) && (
                      <p>Genres: {genres.reduce((str, genre) => {return str += ', '+ genre})}</p>
                    )}
                    <p>Duration: {movieDuration}</p>
                    <p>Image Link: {movieImage}</p>
                    <br/>
                    <Button onClick={() => {setIsConfirmEditModalOpen(false)}} >CANCLE</Button>
                    <Button onClick={() => {onClickConfirmEdit()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        {/* Delete Modal */}
        <Modal centered title="" open={isConfirmDeleteModalOpen}
          onCancel={() => {setIsConfirmDeleteModalOpen(false)}} 
          okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                status='warning'
                title='Deleting Confirm'
                subTitle='Please confirm deleting movie with these detail'
                extra={
                  <div>
                    <p>Movie ID: {router.query._movieID}</p>
                    <p>Movie Name: {movieName}</p>
                    <br/>
                    <Button onClick={() => {setIsConfirmDeleteModalOpen(false)}} >CANCLE</Button>
                    <Button onClick={() => {onClickConfirmDelete()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        {/* Editing Status Modal */}
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

export default withAuth(editmovie)