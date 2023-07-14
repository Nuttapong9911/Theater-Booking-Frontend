import { Cascader, Button, Modal, Result, Input, Select } from 'antd';
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { useQuery, gql, useMutation } from '@apollo/client';

import {Layout, Header, Content, headerStyle, contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { allGenre } from 'src/constants/movieGenres'
import { SUCCESS, FAILED } from '@/src/constants/configMovie/addMovie';
import withAuth from '@/src/middleware';


const CREATE_MOVIE = gql`
  mutation CreateMovie($input: CreateMovieInput) {
    createMovie(input: $input) {
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

function addmovie({token}) {
    const router = useRouter()

    const [movieName, setMovieName] = useState('')
    const [movieImg, setMovieImg] = useState('')
    const [movieDescription, setMovieDescription] = useState('')
    const [movieDuration, setMovieDuration] = useState(180)
    const [movieStatus, setMovieStatus] = useState('ACTIVE')
    const [movieGenre, setMovieGenre] = useState([])

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({})

    const [creatMovie, {data, loading, error}] = useMutation(CREATE_MOVIE, {
      onCompleted: (res) => {
        setStatusBox(res?.createMovie.httpCode === '200' ? 
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
      creatMovie({variables : {
        input: {
          movie_name: movieName,
          description: movieDescription,
          genre: movieGenre,
          movie_duration: movieDuration,
          movie_status:movieStatus,
          movie_image: movieImg
        }
      }})
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
        <strong style={{fontSize:"250%"}}>CREATE NEW MOVIE</strong>
        <br/>   

        {/* Input Movie Name */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Movie Name</h2>
          <Input value={movieName} type='text' size='medium' placeholder='movie name' onChange={(e) => {setMovieName(e.target.value)}}  />
        </div>

        
        {/* Input Movie Genre */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Movie Genre</h2>
            <Select
            mode="multiple"
            allowClear
            style={{
              width: '100%',
            }}
            placeholder="movie genre"
            value={movieGenre}
            onChange={(value) => {setMovieGenre(value)}}
            options={allGenre?.map((genre) => {return {label: genre, value: genre}})}
          />
        </div>

        {/* Input Movie Image */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Movie Image</h2>
          <Input value={movieImg} type='text' size='medium' placeholder='movie image' 
            onChange={(e) => {setMovieImg(e.target.value)}}  />
        </div>

        {/* Input Movie Duration */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Movie Duration</h2>
          <Input value={movieDuration} type='number' size='medium' placeholder='movie duration' 
             onChange={(e) => {setMovieDuration(e.target.value)}}  />
        </div>

        {/* Input Movie Status */}
        <div>
          <h2>Movie Status</h2>
          <Cascader value={movieStatus} type='text' placeholder='movie name' 
            onChange={(value) => {setMovieStatus(value[0])}}  
            options={['ACTIVE','INACTIVE', 'CANCLED'].map((e) => {return {label: e, value: e}})}
            />
        </div>

        {/* Input Movie Description */}
        <div style={{width: '40%', margin: 'auto'}}>
          <h2>Movie Description</h2>
          <Input.TextArea
            showCount
            maxLength={512}
            style={{
              height: 100,
              marginBottom: 24,
            }}
            value={movieDescription}
            onChange={(e) => {setMovieDescription(e.target.value)}}
            placeholder="movie description" 
          />
        </div>

        {/* Button Create New Movie */}
        <Button disabled={movieName === '' || movieGenre.length <= 0} 
          onClick={() => setIsConfirmModalOpen(true)} type='primary'>
          CREATE NEW MOVIE
        </Button>

        {/* Confirm Modal */}
        <Modal centered title="" open={isConfirmModalOpen} onCancel={() => {setIsConfirmModalOpen(false)}} okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                title={'Creating Confirm'}
                subTitle={'Please confirm creating new movie with these detail'}
                extra={
                  <div>
                    <p>Movie Name: {movieName}</p>
                    <p>Movie Genres: {`${movieGenre.length > 0 ? movieGenre?.reduce((str, genre) => {return str += ' ' + genre}) : ''}`}</p>
                    <p>Movie Status: {movieStatus}</p>
                    <p>Movie Image: {movieImg}</p>
                    <p>Movie Description: {movieDescription}</p>
                    <p>Movie Duration: {movieDuration}</p>
                    <br/>
                    <Button onClick={() => {setIsConfirmModalOpen(false)}} >CANCLE</Button>
                    <Button onClick={() => {onClickConfirmCreate()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        {/* Status Modal */}
        <Modal centered title="" open={isStatusMordelOpen} onOk={() => {setIsStatusModalOpen(false)}} onCancel={() => {setIsStatusModalOpen(false)}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                status={statusBox.status}
                title={statusBox.title}
                subTitle={statusBox.subTitle}
                extra={
                  <div>
                    <p>Movie Name: {movieName}</p>
                    <p>Movie Genres: {`${movieGenre.length > 0 ? movieGenre?.reduce((str, genre) => {return str += ' ' + genre}) : ''}`}</p>
                    <p>Movie Status: {movieStatus}</p>
                    <p>Movie Image: {movieImg}</p>
                    <p>Movie Description: {movieDescription}</p>
                    <p>Movie Duration: {movieDuration}</p>
                    <br/>
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

export default withAuth(addmovie)