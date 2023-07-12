import { Button, Cascader } from 'antd';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';

import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';

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
  const token = getCookie('login',{ req, res })
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
};

export default function configMovie({token}) {
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


    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={{token}}/>
        
        <Content
          style={contentStyle}
        >     

        <br/>
        <strong style={{fontSize:"250%"}}>SELECT MOVIE TO BE EDIT</strong>
        <br/>  

        <div>
          <h2>Select Movie</h2>
          <Cascader onChange={(value) => setPickedMovieID(value[0])} placeholder='select movie' 
            value={pickedMovieID}
            options={allMovie?.map(({movie_name, _movieID}) => {return {value: _movieID, label: movie_name}})}
            />
        </div>

        <Button style={{width:"20%"}}  
          onClick={() => {router.push(`/systemconfig/movie/addmovie`)}}>
          CREATE NEW MOVIE
        </Button>

        <Button style={{width:"20%"}} disabled={true} 
          type='primary'
          >
          CONFIRM
        </Button>

          
        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

