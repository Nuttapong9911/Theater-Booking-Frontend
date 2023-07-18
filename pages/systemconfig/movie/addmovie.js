import { Cascader, Button, Modal, Result, Input, Select, Card } from 'antd';
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import {  gql, useMutation } from '@apollo/client';
import {Layout, Content, contentStyle, Container} from 'src/styles/components'
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
        <strong style={{fontSize:"250%"}}>CREATE NEW MOVIE</strong>
        <br/>
        <br/>

        <div style={{display:'flex', justifyContent:'space-evenly'}}>
          
          {/* Column Left */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto'}}>
            {/* Movie Poster */}
            <Card
              key={movieImg}
              hoverable
              style={{
                width: 250,
                height: 500,
              }}
              cover={<img alt={movieImg} src={movieImg} height={350} />}
            >
              {(movieName !== '') && (
                <p style={{fontWeight: "700", fontSize:  "15px"}}>{movieName}</p>
              )}

              {(movieGenre.length > 0) && (
                <Card.Meta description={<span style={{fontSize: "12px"}}>
                  {movieGenre.reduce((str, genre) => {return str += ` ${genre}`})}
                </span>}/>
              )}
            </Card>

            {/* Input Movie Status */}
            <div style={{padding:"30px 0px 30px 0px"}}>
              <h5><span style={{fontWeight: '700'}}>Status</span></h5>

              <Cascader value={movieStatus} type='text' placeholder='movie name' 
                onChange={(value) => {setMovieStatus(value[0])}}  
                options={['ACTIVE','INACTIVE', 'CANCLED'].map((e) => {return {label: e, value: e}})}
                />
            </div>

          </div>

          {/*  Column Right */}
          <div style={{width: '45%', maxWidth: '50%'}}>
            {/* Input Movie Name */}
            <div style={{}}>
              <h5><span style={{fontWeight: '700'}}>Name</span></h5>
              <Input value={movieName} type='text' size='medium' placeholder='movie name' onChange={(e) => {setMovieName(e.target.value)}}  />
            </div>

            {/* Input Movie Genre */}
            <div style={{padding:"0px 0px 30px 0px"}}>
              <h5><span style={{fontWeight: '700'}}>Genres</span></h5>
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
            <div style={{padding:"0px 0px 30px 0px"}}>
              <h5><span style={{fontWeight: '700'}}>Movie Image Link</span></h5>
              <Input value={movieImg} type='text' size='medium' placeholder='movie image' 
                onChange={(e) => {setMovieImg(e.target.value)}}  />
            </div>

            {/* Input Movie Duration */}
            <div style={{padding:"0px 0px 30px 0px"}}>
              <h5><span style={{fontWeight: '700'}}>Duration</span></h5>
              <Input value={movieDuration} type='number' size='medium' placeholder='movie duration' 
                onChange={(e) => {setMovieDuration(e.target.value)}}  />
            </div>

            {/* Input Movie Description */}
            <div style={{padding:"0px 0px 30px 0px"}}>
              <h5><span style={{fontWeight: '700'}}>Description</span></h5>
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
          </div>

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
                    <p><span style={{fontWeight:'700'}}>Name: </span>{movieName}</p>
                    <p><span style={{fontWeight:'700'}}>Genres: </span>{`${movieGenre.length > 0 ? movieGenre?.reduce((str, genre) => {return str += ' ' + genre}) : ''}`}</p>
                    <p><span style={{fontWeight:'700'}}>Status: </span>{movieStatus}</p>
                    <p><span style={{fontWeight:'700'}}>Image Link: </span>{movieImg}</p>
                    <p><span style={{fontWeight:'700'}}>Description: </span>{movieDescription}</p>
                    <p><span style={{fontWeight:'700'}}>Duration: </span>{movieDuration}</p>
                    <br/>
                    <Button style={{margin: "0px 10px"}} onClick={() => {setIsConfirmModalOpen(false)}} >CANCLE</Button>
                    <Button style={{margin: "0px 10px"}} onClick={() => {onClickConfirmCreate()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>

        {/* Status Modal */}
        <Modal centered title="" open={isStatusMordelOpen} onOk={onOkStatusModal} onCancel={onOkStatusModal} cancelButtonProps={{style: { display: 'none' }}} >
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

export default withAuth(addmovie)