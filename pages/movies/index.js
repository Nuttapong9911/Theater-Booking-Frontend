import { Breadcrumb, Menu, theme, Card, Space } from 'antd';
import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components'
import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react'
import { getCookie } from 'cookies-next';

import { MenuBar, AppHeader, AppFooter } from 'src/components/components';


import { useQuery, gql } from '@apollo/client';

const GET_ALL_MOVIES = gql`
  query GetAllMovie {
    getAllMovie {
      data {
        _movieID
        movie_name
        description
        genres
        movie_duration
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

const moviesPage = ({token}) => {
  const router = useRouter()

  const {data, loading, error, refetch} = useQuery(GET_ALL_MOVIES)

  // refetch data everytime routing to this page
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.pathname === '/movies'){
        refetch()
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.pathname, refetch])


  if (loading) return <div>Loading...</div>;
  if (error) return `Error! ${error.message}`;

  const { Meta } = Card;

  const onClickMovie = (e) => {
    router.push(`/movies/${e.target.alt}`)
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
        <strong style={{fontSize:"250%"}}>All Movies</strong>
        <br/>
          {
            (data) ?
            (
              <Space  wrap>
              {
                data.getAllMovie.data.map((item, index) => {
                  return <Card
                          key={index}
                          hoverable
                          style={{
                            width: 200,
                            height: 380,
                            margin: "20px"
                          }}
                          cover={<img alt={item._movieID} src={item.movie_image} height="250" />}
                          onClick={onClickMovie}
                        >
                          <Meta title={item.movie_name} description={item.genres.reduce((str, genre) => {return str += ` ${genre}`})}  />
                        </Card>
                })
              }
              </Space>
            ): 
            (
              <div>movie detail</div>
            )
          }
          
        </Content>
      </Layout>

      <AppFooter/>
    </Container>
    
  );
};

export default moviesPage;