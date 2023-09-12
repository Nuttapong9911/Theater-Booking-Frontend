import { Radio, Cascader, Button, TimePicker, Modal, Result, message } from 'antd';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import { useQuery, gql, useMutation } from '@apollo/client';
import {Layout, Content,  contentStyle, Container} from 'src/styles/components'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED } from '@/src/constants/configShowtime/createShowtime';
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

const CREATE_SHOWTIME = gql`
  mutation CreateShowtime($input: CreateShowtimeInput) {
    createShowtime(input: $input) {
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

function addShowtime({token}) {
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();

    const [movieNames, setMovienames] = useState([])
    const [theaterNames, setTheaterNames] = useState([])
    const [pickedDateIdx, setPickedDateIdx] = useState(-1)
    const [pickedMovie, setPickedMovie] = useState("")
    const [pickedMovieDuration, setPickedMovieDuration] = useState(0)
    const [pickedTheater, setPickedTheater] = useState("")
    const [pickedTimeStart, setPickedTimeStart] = useState("")
    const [pickedTimeEnd, setPickedTimeEnd] = useState("")
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({})

    const {data: data_movies, loading: loading_movies, error: error_movies} = useQuery(GET_ALL_MOVIE, {
      fetchPolicy: 'network-only'
    })

    const {data: data_theater, loading: loading_theater, error: error_theater} = useQuery(GET_ALL_THEATER, {
      fetchPolicy: 'network-only'
    })

    // store fetched data
    useEffect(() => {
      if (data_movies) {
        setMovienames(data_movies.getAllMovie.data.map((movie) => {return movie.movie_name}))
      }
      if (data_theater) {
        setTheaterNames(data_theater.getAllTheater.data.map((theater) => {return theater.theater_name}))
      }
    }, [data_movies, data_theater]);

    const [createShowtime, {data: data_create, loading: loading_create, error: error_create}] = useMutation(CREATE_SHOWTIME, {
      onCompleted: (data) => {
        setStatusBox(data?.createShowtime.httpCode === '200' ? 
        {
          status: SUCCESS.STATUS,
          title: SUCCESS.TITLE,
          subTitle: SUCCESS.SUBTITLE
        }:
        {
          status: FAILED.STATUS,
          title: FAILED.TITLE,
          subTitle: `${FAILED.SUBTITLE} ${data?.createShowtime.message}`
        })
        setIsStatusModalOpen(true)
      }
    })

    let week = []
    for (let index = 0; index <= 6; index++) {
      const day = new Date(new Date().getTime() + index*24*60*60*1000)
      week.push({
        dateObj: day,
        dateLabel: `${day.toDateString()}`
      })
    }

    const onChangePickedMovie = (value) => {
      if (value) {
        setPickedMovie(value[0])
        setPickedMovieDuration(data_movies.getAllMovie.data.filter((movie) => { return movie.movie_name === value[0] })[0].movie_duration)
      }
    }

    const onClickConfirmCreate = () => {
      setIsConfirmModalOpen(false)
      createShowtime({variables : {
        input: {
          movie_name: pickedMovie,
          theater_name: pickedTheater,
          datetime_start: `${week[pickedDateIdx].dateObj.toDateString()}, ${pickedTimeStart['$d']?.toString().split(' ')[4]} GMT+07:00`,
          datetime_end: `${week[pickedDateIdx].dateObj.toDateString()}, ${pickedTimeEnd['$d']?.toString().split(' ')[4]} GMT+07:00`
        }
      }})
    }

    const onOkConfirmStatus = () => {
      setIsStatusModalOpen(false)
      if(statusBox.status === 'success'){
        router.push('/systemconfig/showtime')
      }
    }

    const onChangeTimeStart = (e) => {
      if(e['$H'] < 8 || e['$H'] > 20){
        messageApi.open({
          type: 'warning',
          content: 'Showtime must start between 8:00 - 20:00. :(',
        });
        setPickedTimeStart(pickedTimeStart || "")
      }else{
        setPickedTimeStart(e)
      }
    }

    if(loading_movies || loading_theater) return <div>loading</div>
    if(error_movies || error_theater) return <div>Error: {error_movies}, {error_theater}</div>
    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token}/>
        
        <Content
          style={contentStyle} 
        >  

        <br/>
        <strong style={{fontSize:"250%"}}>CREATE NEW SHOWTIME</strong>
        <br/> 
        <br/>  

        {/* Select Date */}
        <div style={{paddingBottom: "30px"}}>
          <h4>Select <span style={{fontWeight: '700'}}>Date</span></h4>
          <Radio.Group onChange={(e) => setPickedDateIdx(e.target.value)} >
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
          <h4>Select <span style={{fontWeight: '700'}}>Movie</span></h4>
            <Cascader onChange={onChangePickedMovie}  placeholder='Select Movie' 
            value={pickedMovie}
            options={movieNames.map((moviename) => {return {value: moviename, label: moviename}})}
            />
            { (pickedMovie !== "") && (
              <div>duration: {pickedMovieDuration} mins</div> 
            )}
        </div>

        {/* Select Theater */}
        <div style={{paddingBottom: "30px"}}>
          <h4>Select <span style={{fontWeight: '700'}}>Theater</span></h4>
            <Cascader onChange={(value) => setPickedTheater(value[0])}  placeholder='Select Theater' 
            value={pickedTheater}
            options={theaterNames.map((theaterName) => {return {value: theaterName, label: theaterName}})}
          />
        </div>

        
        
        {/* Select Time */}
        <div style={{display: "flex" ,justifyContent: "center", paddingBottom: "30px"}}>
          {contextHolder}
          <div style={{margin: '0 15px'}}>
          <h5>Select <span style={{fontWeight: '700'}}>Time Start</span></h5>            
          <TimePicker format={'HH:mm'} value={pickedTimeStart} onChange={onChangeTimeStart}/>
          </div>

          <div style={{margin: '0 15px'}}>
            <h5>Select <span style={{fontWeight: '700'}}>Time End</span></h5>           
            <TimePicker format={'HH:mm'} value={pickedTimeEnd} onChange={(e) => setPickedTimeEnd(e)}/>
          </div>
        </div>

        {/* BUTTON CREATE NEW ST */}
        <Button onClick={() => {setIsConfirmModalOpen(true)}} 
          type='primary'
          disabled={pickedDateIdx < 0 || pickedMovie === "" || pickedTheater === "" || 
            pickedTimeStart === "" || pickedTimeEnd === ""} > 
          CREATE NEW SHOWTIME</Button>

        <br/>
        <br/>

        {/* CONFIRM MODAL */}
        <Modal centered title="" open={isConfirmModalOpen} onCancel={() => {setIsConfirmModalOpen(false)}} 
          okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
                title={'Creating Confirm'}
                subTitle={'Please confirm creating new showtime with these detail'}
                extra={
                  <div>
                    <p><span style={{fontWeight:'700'}}>Movie: </span>{pickedMovie}</p>
                    <p><span style={{fontWeight:'700'}}>Theater: </span>{pickedTheater}</p>
                    <p><span style={{fontWeight:'700'}}>Date: </span>{week[pickedDateIdx]?.dateLabel}</p>
                    <p><span style={{fontWeight:'700'}}>Time: </span>{`${pickedTimeStart['$d']?.toString().split(' ')[4]} - ${pickedTimeEnd['$d']?.toString().split(' ')[4]}`}</p>
                    <br/>
                    <Button style={{margin: "0px 10px"}} onClick={() => {setIsConfirmModalOpen(false)}} >CANCLE</Button>
                    <Button style={{margin: "0px 10px"}} onClick={() => {onClickConfirmCreate()}} type='primary'>CONFIRM</Button>
                  </div>
                }
            />
        </Modal>
        
        {/* STATUE MODAL */}
        <Modal centered title="" open={isStatusMordelOpen} onOk={onOkConfirmStatus} onCancel={() => {setIsStatusModalOpen(false)}} cancelButtonProps={{style: { display: 'none' }}} >
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

export default withAuth(addShowtime)