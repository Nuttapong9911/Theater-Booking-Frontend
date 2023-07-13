import { Button, Cascader } from 'antd';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import React, {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';

import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';

const GET_ALL_THEATER = gql`
  query GetAllTheater {
    getAllTheater {
      data {
        _id
        theater_name
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

export default function configTheater({token}) {
    const router = useRouter()

    const [pickedTheaterID, setPickedTheaterID] = useState("")      //name
    const [allTheater, setAllTheater] = useState([])

    const {data, loading, error, refetch} = useQuery(GET_ALL_THEATER)

    // store fetched data
    useEffect(() => {
      if (data) {
        setAllTheater(data.getAllTheater.data);
      }
    }, [data]);

    // refetch data everytime routing to this page
    useEffect(() => {
      const handleRouteChange = () => {
        if (router.pathname === '/systemconfig/theater'){
          refetch()
        }
      }
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }, [router.pathname, refetch])

    const onClickConfirm = () => {
      router.push({
        pathname: '/systemconfig/theater/edittheater',
        query : { _theaterID: pickedTheaterID}
      })
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
        <strong style={{fontSize:"250%"}}>SELECT THEATER TO BE EDIT</strong>
        <br/>  

        <div>
          <h2>Select Theater</h2>
          <Cascader onChange={(value) => {setPickedTheaterID(value[0])}} placeholder='select movie' 
            value={pickedTheaterID}
            options={allTheater?.map(({_id, theater_name}) => {return {value: _id, label: theater_name}})}
            />
        </div>

        <Button style={{width:"20%"}}  
          onClick={() => {router.push(`/systemconfig/theater/addtheater`)}}>
          CREATE NEW THEATER
        </Button>

        <Button style={{width:"20%"}} disabled={ pickedTheaterID === "" } 
          onClick={onClickConfirm}
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
