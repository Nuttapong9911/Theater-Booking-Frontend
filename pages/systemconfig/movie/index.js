import { Button, Cascader } from 'antd';
import { useQuery, gql } from '@apollo/client';
import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import {Layout, Content, contentStyle, Container} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import withAuth from '@/src/middleware';

const GET_ALL_MOVIE = gql`
  query GetAllMovie {
    getAllMovie {
      data {
        movie_name
        description
        genres
        movie_duration
        _movieID
        movie_image
      }
    }
  }
`

export const getServerSideProps = ({ req, res }) => {
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })
  console.log(token, 'serversideprops form movie/index')
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
};

function configMovie({token}) {
    const router = useRouter()

    const [pickedMovieID, setPickedMovieID] = useState("")      //name
    const [allMovie, setAllMovie] = useState([])

    const {data, loading, error, refetch} = useQuery(GET_ALL_MOVIE)

    // store fetched data
    useEffect(() => {
      if (data) {
        setAllMovie(data.getAllMovie.data)
      }
    }, [data]);

    // refetch data everytime routing to this page
    useEffect(() => {
      const handleRouteChange = () => {
        if (router.pathname === '/systemconfig/movie'){
          refetch()
        }
      }

      router.events.on('routeChangeComplete', handleRouteChange)

      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }, [router.pathname, refetch])

    const onClickConfirm = () => {
      if(pickedMovieID !== ""){
        router.push({
          pathname: `/systemconfig/movie/editmovie`, 
          query: {_movieID: pickedMovieID}
        })
      }
    }

    if (loading) return <div>loading</div>
    if (error) return <div>Error: {error}</div>
    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle}
        >     

        <br/>
        <strong style={{fontSize:"300%"}}>MOVIE CONFIG</strong>
        <br/>
        <br/> 

        {/* Select Movie */}
        <div>
          <h3>Select Movie to be edited</h3>
          <Cascader onChange={(value) => setPickedMovieID(value[0])} placeholder='select movie' 
            value={pickedMovieID} style={{width: '40%'}}
            options={allMovie?.map(({movie_name, _movieID}) => {return {value: _movieID, label: movie_name}})}
            />
        </div>
      
        <Button style={{width:"20%", margin: "0px 30px"}}  
          onClick={() => {router.push(`/systemconfig/movie/addmovie`)}}>
          CREATE NEW MOVIE
        </Button>

        <Button style={{width:"20%", margin: "0px 30px"}} disabled={pickedMovieID === ""} 
          type='primary'
          onClick={onClickConfirm}>
          CONFIRM
        </Button>

        <br/> 
        <br/> 

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

export default withAuth(configMovie)