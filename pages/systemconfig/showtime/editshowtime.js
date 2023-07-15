import {  Radio, Cascader, TimePicker, Button, Modal, Result } from 'antd';
import dayjs from 'dayjs';
import React, {useEffect, useState} from 'react'
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router'
import { useQuery, gql, useMutation } from '@apollo/client';

import {Layout, Header, Content, headerStyle, 
  contentStyle, CustomButton, CustomInput, Container, Footer} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { dayOfWeeks, months } from 'src/constants/datepicker';
import { SUCCESS, FAILED } from '@/src/constants/configShowtime/editShowtime';
import withAuth from '@/src/middleware';

const GET_SHOW_BY_ID = gql`
  query GetShowtimeByID($input: GetShowtimeByIDInput) {
    getShowtimeByID(input: $input) {
      showtime {
        _showID
        _movieID
        movie_name
        datetime_start
        datetime_end
        _theaterID
        theater_name
        movie_image
      }
    }
  }
`;

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

const EDIT_SHOWTIME_BY_ID = gql`
  mutation EditShowtimeByID($input: EditShowtimeInput) {
    editShowtimeByID(input: $input) {
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

function editshowtime({token}) {
    const router = useRouter()

    const [currentMovieName, setCurrentMovieName] = useState('')
    const [currentTheaterName, setCurrentTheaterName] = useState('')
    const [currentDate, setCurrentDate] = useState('')
    const [currentTimeStart, setCurrentTimeStart] = useState('')
    const [currentTimeEnd, setCurrentTimeEnd] = useState('')

    const [pickedDate, setPickedDate] = useState('')
    const [pickedMovie, setPickedMovie] = useState('')
    const [pickedTheater, setPickedTheater] = useState('')
    const [pickedTimeStart, setPickedTimeStart] = useState()
    const [pickedTimeEnd, setPickedTimeEnd] = useState('')

    const [movieNames, setMovienames] = useState([])
    const [theaterNames, setTheaterNames] = useState([])

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({})    

    const {data: data_movies, loading: loading_movies, error: error_movies, refetch: refetch_movies} = useQuery(GET_ALL_MOVIE)
    const {data: data_theaters, loading: loading_theaters, error: error_theaters, refetch: refetch_theaters} = useQuery(GET_ALL_THEATER)
    const {data: data_show, loading: loading_show, error: error_show, refetch: refetch_show} = useQuery(GET_SHOW_BY_ID, {
      variables: {
        input: {
          _showID: router.query._showID
        }
      }
    })

    const [editShowtime, {data: data_edit, loading: loading_edit, error: error_edit}] = useMutation(EDIT_SHOWTIME_BY_ID, {
      onCompleted: (data) => {
        setStatusBox(data?.editShowtimeByID.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${data?.editShowtimeByID.message}`
        })
        setIsStatusModalOpen(true)
      }
    })

    // store fetched data
    useEffect(() => {
      if (data_movies?.getAllMovie) {
        setMovienames(data_movies.getAllMovie.data.map((movie) => {return movie.movie_name}))
      }
      if (data_theaters?.getAllTheater) {
        setTheaterNames(data_theaters.getAllTheater.data.map((theater) => {return theater.theater_name}))
      }
      if(data_show?.getShowtimeByID){
        setCurrentMovieName(data_show.getShowtimeByID.showtime.movie_name)
        setCurrentTheaterName(data_show.getShowtimeByID.showtime.theater_name)
        const dateStart = new Date(data_show.getShowtimeByID.showtime.datetime_start)
        const dateEnd = new Date(data_show.getShowtimeByID.showtime.datetime_end)
        setCurrentDate(dateStart.toDateString())
        setCurrentTimeStart(dateStart.toTimeString())
        setCurrentTimeEnd(dateEnd.toTimeString())

        setPickedDate(dateStart.toDateString())
        setPickedMovie(data_show.getShowtimeByID.showtime.movie_name)
        setPickedTheater(data_show.getShowtimeByID.showtime.theater_name)
        setPickedTimeStart(dateStart.toTimeString().split(' ')[0])
        setPickedTimeEnd(dateEnd.toTimeString().split(' ')[0])
      }
    }, [data_movies, data_theaters, data_show]);

    // refetch data everytime routing to this page
    useEffect(() => {
      const handleRouteChange = () => { 
        if (router.pathname === '/systemconfig/showtime/editshowtime'){
          refetch_movies()
          refetch_theaters()
          refetch_show()
        }
      }
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }, [router.pathname, refetch_movies, refetch_theaters, refetch_theaters])

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
    
    const onClickConfirmEdit = () => {
      setIsConfirmModalOpen(false)
      editShowtime({variables: {
        input: {
          _showID: router.query._showID,
          editedSeats: [],
          movie_name: pickedMovie,
          theater_name: pickedTheater,
          datetime_start: `${pickedDate}, ${pickedTimeStart} GMT+07:00`,
          datetime_end: `${pickedDate}, ${pickedTimeEnd} GMT+07:00`,
        }
      }})
    }

    const onOkConfirmStatus = () => {
      setIsStatusModalOpen(false)
      if(statusBox.status === 'success'){
        router.push('/systemconfig/showtime')
      }
    }

    if (loading_movies || loading_theaters || loading_show) {
      return (
        <div>
          loading ...
        </div>
      )
    }else if (error_movies || error_theaters || error_show) {
      return (
        <div>
          <p>error_movie</p>
          <p>error_theaters</p>
          <p>error_show</p>
        </div>
      )
    }else if (data_movies && data_theaters && data_show) {
      return (
        (
          <Container>
            <Layout>
              <AppHeader/>
              <MenuBar router={router} token={token}/>
              
              <Content
                style={contentStyle}
              > 
              <br/>
              <strong style={{fontSize:"250%"}}>SHOWTIME EDITING</strong>
              <br/>     
    
              {/* Time Picker */}
              <div>
                  <h2>Edit Date</h2>
                  <Radio.Group onChange={(e) => setPickedDate(e.target.value)}>
                    {
                      week.map((day, index) => {
                        return (day.dateLabel === currentDate) ? 
                        (
                          <Radio.Button key={index} value={day.dateLabel}><span style={{color: 'red'}}>{day.dateLabel} (default)</span></Radio.Button>
                        ) : 
                        (
                          <Radio.Button key={index} value={day.dateLabel}>{day.dateLabel}</Radio.Button>
                        )
                      })
                    }
                  </Radio.Group>
              </div> 
    
              {/* Edit Movie */}
              <div>
                <h2>Edit Movie</h2>
                  <Cascader onChange={(value) => setPickedMovie(value[0])}  placeholder='Select Movie' 
                    value={pickedMovie}
                    options={movieNames.map((moviename) => {
                      if(moviename === currentMovieName){
                        return {value: moviename, label: <span style={{color:'red'}}>{moviename} (default)</span>}
                      }else{
                        return {value: moviename, label: moviename}
                      }
                    })}
                  />
              </div>
    
              {/* Edit Theater  */}
              <div>
                <h2>Edit Theater</h2>
                  <Cascader onChange={(value) => setPickedTheater(value[0])}  placeholder='Select Movie' 
                    value={pickedTheater}
                    options={theaterNames.map((theatername) => {
                      if(theatername === currentTheaterName){
                        return {value: theatername, label: <span style={{color:'red'}}>{theatername} (default)</span>}
                      }else{
                        return {value: theatername, label: theatername}
                      }
                    })}
                  />
              </div>
    
              {/* Edit Time */}
              {(pickedTimeStart && pickedTimeEnd) && 
                (
                  <div style={{display: 'flex' ,justifyContent: 'center'}}>
                    <div style={{margin: '0 15px'}}>
                      <h3>Select Time Start</h3>
                      <TimePicker value={dayjs(`${pickedTimeStart}`, 'HH:mm:ss')} format={'HH:mm'} 
                        onChange={(e) => {setPickedTimeStart((String(e['$d'])).split(' ')[4])
                        }}/>
                      <Button onClick={() => setPickedTimeStart(currentTimeStart.split(' ')[0])}>
                        <span style={{color: 'red'}}>Default</span></Button>
                    </div>
    
                    <div style={{margin: '0 15px'}}>
                      <h3>Select Time End</h3>
                      <TimePicker value={dayjs(`${pickedTimeEnd}`, 'HH:mm:ss')} format={'HH:mm'} 
                        onChange={(e) => {setPickedTimeEnd((String(e['$d'])).split(' ')[4])
                        }}/>
                      <Button onClick={() => setPickedTimeEnd(currentTimeEnd.split(' ')[0])}>
                        <span style={{color: 'red'}}>Default</span></Button>
                    </div>
                </div>
                )
              }
    
              <CustomButton
                onClick={() => setIsConfirmModalOpen(true)}
                type='primary'
                >CONFIRM
              </CustomButton>
    
              {/* CONFIRM MODAL */}
              <Modal centered title="" open={isConfirmModalOpen} onCancel={() => {setIsConfirmModalOpen(false)}} 
                okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
                <Result
                  title={'Editing Confirm'}
                  subTitle={'Please confirm editing new showtime with these detail'}
                  extra={
                    <div>
                      <p>Showtime ID: {router.query._showID}</p>
                      <p>Movie: <span style={{color: 'red'}}>{currentMovieName}</span> {`->`} {pickedMovie}</p>
                      <p>Theater: <span style={{color: 'red'}}>{currentTheaterName}</span> {`->`} {pickedTheater}</p>
                      <p>Date: <span style={{color: 'red'}}>{currentDate}</span> {`->`} {pickedDate}</p>
                      <p>Time: <span style={{color: 'red'}}>{currentTimeStart?.split(' ')[0]} - {currentTimeEnd?.split(' ')[0]}</span> {`->`} {`${pickedTimeStart} - ${pickedTimeEnd}`}</p>
                      <br/>
                      <Button onClick={() => {setIsConfirmModalOpen(false)}} >CANCLE</Button>
                      <Button onClick={() => {onClickConfirmEdit()}} type='primary'>CONFIRM</Button>
                    </div>
                  }
                />
              </Modal>
    
              {/* STATUS MODAL */}
              <Modal centered title="" open={isStatusMordelOpen} onOk={onOkConfirmStatus} 
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
      )
    } else {
      return(
        <div>no data</div>
      )
    }
}

export default withAuth(editshowtime)