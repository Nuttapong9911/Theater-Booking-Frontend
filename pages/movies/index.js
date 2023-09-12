import { Card, Row, Col } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { getCookie } from 'cookies-next';
import { useQuery, gql } from '@apollo/client';
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { Layout, Content, contentStyle, Container } from 'src/styles/components'

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
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
};

const moviesPage = ({token}) => {
  const router = useRouter()

  const {data, loading, error} = useQuery(GET_ALL_MOVIES, 
    {
      fetchPolicy: 'network-only'
    }
  )

  const { Meta } = Card;

  const onClickMovie = (e) => {
    router.push(`/movies/${e.target.alt}`)
  }

  if (loading) return <div>Loading...</div>;
  if (error) return `Error! ${error}`;
  return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle}
        >      

        <br/>
        <strong style={{fontSize:"250%"}}>MOVIES</strong>
        <br/>

        <div className='movielist' style={{display: 'flex', margin: "0px auto" }}>
        {
            (data) ?
            (
              // <Space  wrap>
              <Row justify="left">
              {
                data.getAllMovie.data.map((item, index) => {
                  return <Col sx={24} sm={24} md={12} xl={6} xxl={4} style={{display: 'flex', justifyContent: 'center'}}> 
                    <Card
                      key={index}
                      hoverable
                      style={{
                        width: 200,
                        height: 420,
                        margin: "20px"
                      }}
                      cover={<img alt={item._movieID} src={item.movie_image} height="250" />}
                      onClick={onClickMovie}
                      >
                      <p style={{fontWeight: "700", fontSize:  "15px"}}>{item.movie_name}</p>
                      <Meta description={<span style={{fontSize: "12px"}}>
                        {item.genres.reduce((str, genre) => {return str += ` ${genre}`})}
                      </span>}/>
                    </Card> 
                  </Col>
                })
              }
              </Row>
              // </Space>
            ): 
            (
              <div>no data</div>
            )
          }
        </div>
          
          
        </Content>
      </Layout>

      <AppFooter/>
    </Container>
  );
  
};

export default moviesPage;