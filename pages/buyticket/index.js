import { Breadcrumb, Menu, theme, Card, Radio, Cascader } from 'antd';
import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { dayOfWeeks, months } from 'src/constants/datepicker';

import React, {useEffect, useState} from 'react'
import { useRouter } from 'next/router'

import { useQuery, gql, useLazyQuery } from '@apollo/client';

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

export default function buyticket() {
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
      // console.log(e.target.value)
      setPickedDateIdx(e.target.value)
      getShowByDate({
        variables: {input: {date_search: (week[e.target.value].dateObj.toString())}},
        onCompleted: (data) => {
          // console.log(`search on ${week[e.target.value].dateObj}`)
          // console.log(data.getShowtimeByDate.showtimes)
          // console.log(data.getShowtimeByDate.movienames)
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

    const onShowChange = (value) => {
      setPickedShowIdx(value)
    }

    const onClickConfirm = () => {
      console.log(showtimes[pickedShowIdx])
      router.push(`/buyticket/${showtimes[pickedShowIdx]._showID}`)
    }

    // if (data) console.log(data)
    // if (loading) return <div>Loading...</div>;
    // if (error) return `Error! ${error.message}`;

    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router}/>
        
        <Content
          style={contentStyle}
        > 
        <br/>
        <strong style={{fontSize:"250%"}}>THEATER SEAT SEARCHING</strong>
        <br/>     

        <div>
            <h2>Select Date</h2>
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

        <div>
          <h2>Select Movie</h2>
          <Cascader onChange={onMovieChange} placeholder='select movie' disabled={pickedDateIdx < 0} 
            value={pickedMovie}
            options={movienames.map((moviename) => {return {value: moviename, label: moviename}})}
            />
        </div>

        <div>
          <h2>Select Time and Theater</h2>
          <Cascader onChange={onShowChange} placeholder='select Time and Theater'  
            value={pickedShowIdx}
            options={showtimes.map((showtime, index) => {
              return {value: index, label: 
                `${(showtime.datetime_start.split('T')[1]).split('.')[0]} - 
                  ${(showtime.datetime_end.split('T')[1]).split('.')[0]}
                  ${showtime.theater_name}`}
              })}
            disabled={pickedMovie === ""}
          />
        
        </div>

        <CustomButton disabled={pickedShowIdx === ""} 
          type='primary'
          onClick={onClickConfirm}
          >CONFIRM</CustomButton>

        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

