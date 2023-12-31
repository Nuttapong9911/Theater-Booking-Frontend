import { Radio, Cascader, Button } from 'antd';
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { gql, useLazyQuery } from '@apollo/client';
import {Layout, Content, contentStyle, Container} from '@/src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';

const GET_SHOW_BY_DATE = gql`
  query GetShowtimeByDate($input: SearchInput) {
    getShowtimeByDate(input: $input) {
      showtimes {
        _showID
        _movieID
        _theaterID
        datetime_end
        datetime_start
        movie_name
        theater_name
      }
      movienames
    }
}
`;

export const getServerSideProps = ({ req, res }) => {
  const token = getCookie('THEATER_SEAT_BOOKING_COOKIE',{ req, res })
  return (token) ? 
      {
        props: {token : JSON.parse(JSON.stringify(token))} 
      }:
      { props: {}}
      
};

export default function buyticket({token}) {
    const router = useRouter()
    const [getShowByDate ,{data, loading, error}] = useLazyQuery(GET_SHOW_BY_DATE)

    // - useState showtimes [array] -> availble showtimes for picked movie
    // - get picked showtime by -> showtimes[pickedShowIdx]
    const [showtimes, setShowtimes] = useState([])
    const [allShowtimes, setAllShowtimes] = useState([])
    const [pickedShowIdx, setPickedShowIdx] = useState("")
    const [pickedMovie, setPickedMovie] = useState("")      //name
    const [movienames, setMovienames] = useState([])

    // - get picked date object by -> week[pickedDateIdx].dateObj
    const [pickedDateIdx, setPickedDateIdx] = useState(-1)
    
    // date pickers part
    // - create 7 days onward for Radio.group
    let week = []
    for (let index = 0; index <= 6; index++) {
      const day = new Date(new Date().getTime() + index*24*60*60*1000)
      week.push({
        dateObj: day,
        dateLabel: `${day.toDateString()}`
      })
    }
    
    const onDateChange = (e) => {
      setPickedDateIdx(e.target.value)
      getShowByDate({
        variables: {input: {date_search: (week[e.target.value].dateObj.toString())}},
        onCompleted: (data) => {
          setAllShowtimes(data.getShowtimeByDate.showtimes)
          setMovienames(data.getShowtimeByDate.movienames)
          setPickedMovie("")
          setPickedShowIdx("")
        }
      })
      
    }

    // - filter showtimes when picked movie changes
    const onMovieChange = (value) => {
      setPickedMovie(value[0])
      setShowtimes([...allShowtimes].filter((showtime) => {
        return showtime.movie_name === value[0]
      }))
      setPickedShowIdx("")
    }

    const onClickConfirm = () => {
      router.push(`/buyticket/${showtimes[pickedShowIdx]._showID}`)
    }

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token} />
        
        <Content
          style={contentStyle}
        > 
        <br/>
        <strong style={{fontSize:"250%"}}>THEATER SEAT SEARCHING</strong>
        <br/> 
        <br/>     

        {/* Select Date */}
        <div style={{paddingBottom: "30px"}}>
          <h3>Select Date</h3>
          <Radio.Group onChange={onDateChange} defaultValue={pickedDateIdx}>
            {
              week.map((day, index) => {
                return (
                  <Radio.Button key={index} value={index}>{day.dateLabel}</Radio.Button>
                )
              })
            }
          </Radio.Group>
        </div> 

        {/* Select Movie */}
        <div style={{paddingBottom: "30px"}}>
          <h3>Select Movie</h3>
          <Cascader onChange={onMovieChange} placeholder='select movie' disabled={pickedDateIdx < 0} 
            value={pickedMovie}
            options={movienames.map((moviename) => {return {value: moviename, label: moviename}})}
          />
        </div>

        {/* Select Time and Theater */}
        <div style={{paddingBottom: "30px"}}>
          <h3>Select Time and Theater</h3>
          <Cascader onChange={(value) => setPickedShowIdx(value)} placeholder='select Time and Theater'  
            value={pickedShowIdx}
            style={{ width:"25%" }}
            options={showtimes.map((showtime, index) => {
              return {value: index, label:
                `${(new Date(showtime.datetime_start)).toLocaleTimeString('en-US', {hour12: false ,timeZone: 'Asia/Bangkok'})} - 
                ${(new Date(showtime.datetime_end)).toLocaleTimeString('en-US', {hour12: false, timeZone: 'Asia/Bangkok'})}
                  ${showtime.theater_name}`}
              })}
            disabled={pickedMovie === ""}
          />
        </div>

        <Button disabled={pickedShowIdx === ""} 
          type='primary'
          style={{width: "20%"}}
          onClick={onClickConfirm}
          >CONFIRM</Button>

        <br/> 
        <br/> 

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

