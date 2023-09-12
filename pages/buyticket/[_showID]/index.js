import { Button, Image, Modal, Result } from 'antd';
import React, {useEffect, useState} from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next';
import {Layout, Content, contentStyle, Container} from 'src/styles/components.js'
import { MenuBar, AppHeader, AppFooter } from 'src/components/components';
import { SUCCESS, FAILED } from 'src/constants/ticket.js'

import { useQuery, useMutation, gql } from '@apollo/client';

const GET_SHOW_BY_ID = gql`
  query Query($input: GetShowtimeByIDInput) {
    getShowtimeByID(input: $input) {
      showtime {
        _showID
        _movieID
        movie_name
        movie_image
        datetime_start
        datetime_end
        _theaterID
        theater_name
        theater_seats {
        seat_type
        price
        rows
        column
        }
      }
    }
  }
`

const GET_BOOKED_SEATS = gql`
  query GetBookedSeats($input: GetBookedSeatsInput) {
    getBookedSeats(input: $input) {
      data {
        column
        row
        seat_type
      }
    }
  }
`

const CREATE_TICKET = gql`
    mutation CreateTicket($input: CreateTicketInput) {
    createTicket(input: $input) {
      httpCode
      message
      userAccount
      refCode
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

export default function selectticket({token}) {
    const router = useRouter()

    const [ movieImage, setMovieImage ] = useState("")
    const [ movieName, setMovieName ] = useState("")
    const [ movieDate, setMovieDate ] = useState("")
    const [ movieTime, setMovieTime ] = useState("")
    const [ theater, setTheater ] = useState("")
    const [ seats, setSeats ] = useState([])
    const [ selectedSeats, setSelectedSeats] = useState([])
    const [ totalPrice, setTotalPrice ] = useState(0)

    const [ bookedSeats, setBookedSeats ] = useState([])
    const [ normalSeatNum, setNormalSeatNum ] = useState(0)
    const [ premiumSeatNum, setPremiumSeatNum ] = useState(0)

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isStatusMordelOpen, setIsStatusModalOpen] = useState(false);
    const [statusBox, setStatusBox] = useState({
      status: "",
      title: "",
      subtitle: "",
      account: 0,
      refCode: []
    })
    const [ isUpdateBookedSeats, setIsUpdateBookedSeats ] = useState(false)

    const storedToken = useSelector((state) => state.token.value)

    const [createTicket, {data: data_create, loading: loading_create, error: error_create}] = useMutation(CREATE_TICKET, {
      onCompleted: (data) => {
        setStatusBox((data.createTicket && data?.createTicket.httpCode) === '200' ? 
          {
            status: SUCCESS.STATUS,
            title: SUCCESS.TITLE,
            subtitle: "",
            account: data?.createTicket.userAccount,
            refCode: (data?.createTicket.refCode.length === 0) ? '' : data?.createTicket.refCode
              .map((ref, index) => {return `${ref} (${selectedSeats[index].split(":")[2]} ${selectedSeats[index].split(":")[0]}${selectedSeats[index].split(":")[1]})`})
              .reduce((str, ref) => {return str += '\n'+ ref})
          }:
          {
            status: FAILED.STATUS,
            title: FAILED.TITLE,
            subtitle: `Error Text: ${data?.createTicket.message}`,
            account: 0,
            refCode: ""
          }
        )
        setIsStatusModalOpen(true)
      }
    })

    const { data: data_show, loading: loading_show, error: error_show } = useQuery(GET_SHOW_BY_ID, {
      variables: {input: {_showID: router.query._showID}},
      fetchPolicy: 'network-only'
    })

    const { data: data_seats, loading: loading_seats, error: error_seats } = useQuery(GET_BOOKED_SEATS, {
      variables: {input: {_showID: router.query._showID}},
      fetchPolicy: 'network-only'
    })

    // store fetched data
    useEffect(() => {
      if (data_show) {
        setMovieImage(data_show.getShowtimeByID.showtime.movie_image)
        setMovieName(data_show.getShowtimeByID.showtime.movie_name)
        setMovieDate((new Date(data_show.getShowtimeByID.showtime.datetime_start)).toDateString())
        setMovieTime(
          `${(new Date(data_show.getShowtimeByID.showtime.datetime_start)).toTimeString().split(" ")[0]}
            - ${(new Date(data_show.getShowtimeByID.showtime.datetime_end)).toTimeString().split(" ")[0]}`)
        setTheater(data_show.getShowtimeByID.showtime.theater_name)
        setSeats(data_show.getShowtimeByID.showtime.theater_seats)
      }
    }, [data_show]);
    useEffect(() => {
      if (data_seats){
        setBookedSeats(data_seats.getBookedSeats.data)
      }
    }, [data_seats])

    // setBookedSeat
    useEffect(() => {
      upDateBookedSeats()
    })

    const upDateBookedSeats = () => {
      if(bookedSeats.length > 0 && !isUpdateBookedSeats){
        bookedSeats.map((seat) => {
          const seatPrice = seat.seat_type === "PREMIUM" ? "500" : "300"
          if(document.querySelector(`[seatid="${seat.row}:${seat.column}:${seatPrice}"]`)){
            document.querySelector(`[seatid="${seat.row}:${seat.column}:${seatPrice}"]`).classList.add("occupied")
            setIsUpdateBookedSeats(true)
          }
        })
      }
    }

    const onClickSeat = (e) => {
      const index = selectedSeats.indexOf(e.target.getAttribute("seatid"))
      e.target.classList.toggle('selected')
      if(index > -1){
        const afterRemoveSeat = [...selectedSeats]
        afterRemoveSeat.splice(index, 1)
        setSelectedSeats(afterRemoveSeat)
        setTotalPrice(totalPrice -  parseInt(e.target.getAttribute("seatid").split(":")[2]))
        if(e.target.getAttribute("seatid").split(":")[2] === "500" ){
          setPremiumSeatNum(premiumSeatNum - 1)
        }else {
          setNormalSeatNum(normalSeatNum - 1)
        }
      }else{
        setSelectedSeats(selectedSeats.length === 0 ? [e.target.getAttribute("seatid")] : [...selectedSeats, e.target.getAttribute("seatid")])
        setTotalPrice(totalPrice +  parseInt(e.target.getAttribute("seatid").split(":")[2]))
        if(e.target.getAttribute("seatid").split(":")[2] === "500" ){
          setPremiumSeatNum(premiumSeatNum + 1)
        }else {
          setNormalSeatNum(normalSeatNum + 1)
        }
      }
    }

    const onOkConfirm = () => {
      setIsOrderModalOpen(false)
      createTicket({variables: {
        input: {
          _userID: storedToken.user_id,
          _showID: router.query._showID,
          orderedSeats: selectedSeats.map((seat) => {
            return {
              seat_type: seat.split(':')[2] === '300' ? 'NORMAL' : 'PREMIUM',
              row: seat.split(':')[0],
              column: seat.split(':')[1],
              price: parseInt(seat.split(':')[2])
            }
          })
        }
      }})
    }

    const onClickStatusMordalGoback = () => {
      setIsStatusModalOpen(false)
      router.push('/movies')
    }

    const onClickStatusMordalContinue = () => {
      setIsStatusModalOpen(false)
      router.reload()
    }

    if (loading_show || loading_seats) return <div>Loading...</div>;
    if (error_show || error_seats) return `Error! ${error_show}, ${error_seats}`;
    return (
    <Container>
      <Layout>
        <AppHeader/>
        <MenuBar router={router} token={token} />
        
        <Content
          style={contentStyle}
        >     
        
        <div style={{display: "flex"}}>
          {/* Movie Detail */}
          <div style={{backgroundColor: "gray", width: "30%", lineHeight: "150%"}}>
            <div style={{margin:"20% 0 10%"}}>
              <Image width={"70%"}  src={movieImage}
                fallback="data:image/png;base64,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"
              ></Image>
            </div>
            
            <p className='movie-name'>{movieName}</p>
            <p className='head'>DATE</p>
            <p>{movieDate}</p>
            <p className='head'>TIME</p>
            <p>{movieTime}</p>
            <p className='head'>THEATER</p>
            <p>{theater}</p>
            <br/>
          </div>

          {/* Theater */}
          <div className='theater-body' style={{ width: "70%"}}>
            <div className='container' style={{ width: "80%"}}>

              {/* Movie Screen */}
              <div className="screen"></div>
              
              {/* Movie Seats */}
              {
                seats.map((seat) => {
                  return(
                    
                    seat.rows.map((row) => {
                      return (
                        <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                          <div style={{lineHeight: 3}}>{row}</div>

                          {/* Seats */}
                          <div className="row" key={row} >
                            {
                              seat.column.map((col) => {
                                return(
                                  (seat.seat_type === 'PREMIUM') ? 
                                  (
                                    <div className="seat premium" onClick={onClickSeat} key={`${row}:${col}`} seatid={`${row}:${col}:${seat.price}`}></div>

                                  ):
                                  (
                                    <div className="seat normal" onClick={onClickSeat} key={`${row}:${col}`} seatid={`${row}:${col}:${seat.price}`}></div>
                                  )
                                )
                              })
                            }
                          </div>
                          <div style={{lineHeight: 3}}>{row}</div>
                        </div>
                      )
                    })
                  )

                })
              }
              
              {/* Selected Seats Detail */}
              <p className='text' >
                You have selected <span >{selectedSeats.length}</span> seats for the total price <span >{totalPrice} ฿</span>
                <br/>
                NORMAL SEATS <span >X {normalSeatNum}</span> , PREMIUM SEAT <span >X {premiumSeatNum}</span>
              </p>
            </div>
            
            {/* Seats Price Detail */}
            <ul className="showcase">
              <li>
                <div className="seat normal"></div>
                <small>NORMAL SEAT 300 ฿</small>
              </li>
              <li>
                <div className="seat premium"></div>
                <small>PREMIUM SEAT 500 ฿</small>
              </li>
              <li>
                <div className="seat selected"></div>
                <small>SELECTED</small>
              </li>
              <li>
                <div className="seat occupied"></div>
                <small>OCCUPIED</small>
              </li>    
            </ul>

            {/* Confirm Button */}
            <Button size='large' style={{width:"30%", margin: '20px 0', backgroundColor:'white'}} 
              disabled={!(token && selectedSeats.length > 0)} 
              onClick={() => {setIsOrderModalOpen(true)}}
              > {((token) ? 'CONFIRM' : 'PLEASE LOGIN')}</Button> 
          </div>
        </div>

        {/* Confirm Modal */}
        <Modal centered title="" open={isOrderModalOpen} onCancel={() => setIsOrderModalOpen(false)} okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          <Result
            title="Please confirm your booking"
            extra={
              <div>
                <p className='order-booking'>
                  <span>SEATS</span> <span>PRICE</span>
                </p>
                  {
                    (normalSeatNum > 0) && (
                      <p className='order-detail-booking'>
                        <span>NORMAL SEATS X{normalSeatNum} seats</span><span>{normalSeatNum*300} ฿</span>
                      </p>
                    )
                  }
                  {
                    (premiumSeatNum > 0) && (
                      <p className='order-detail-booking'>
                        <span>PREMIUM SEATS X{premiumSeatNum}</span><span>{premiumSeatNum*500} ฿</span>
                      </p>
                    )
                  }
                  <br/>
                  <p className='order-booking'>
                    <span>TOTAL</span> <span>{totalPrice} ฿</span>
                  </p>
                  
                <div className='confirm-btn-booking'>
                <Button onClick={() => setIsOrderModalOpen(false)} style={{margin: "0 10px"}} >
                  CANCLE
                </Button>
                <Button onClick={onOkConfirm} style={{margin: "0 10px"}} type="primary">
                  CONFIRM
                </Button>
              </div>
              </div>
      
            }
          />
        </Modal>

        {/* Booking Status Modal */}
        <Modal centered title="" open={isStatusMordelOpen} onCancel={onClickStatusMordalContinue} 
          okButtonProps={{style: {display: "none"}}} cancelButtonProps={{style: { display: 'none' }}} >
          {
            (statusBox.status === 'success') ? 
            (
              <Result
                status={statusBox.status}
                title={statusBox.title}
                extra={
                  <div>
                    <p><span style={{fontWeight:'700'}}>User Account: </span>{statusBox.account} ฿</p>
                    <p><span style={{fontWeight:'700'}}>Reference Code: </span>{statusBox.refCode}</p>
                    <br/>
                    <Button onClick={onClickStatusMordalContinue}>
                      CONTINUE BOOKING
                    </Button>
                    <Button onClick={onClickStatusMordalGoback} 
                      type="primary">
                      GO BACK HOMEPAGE
                    </Button>
                  </div>
                }
              />
            ):
            (
              <Result
                status={statusBox.status}
                title={statusBox.title}
                subTitle={statusBox.subtitle}
                extra={
                  <Button onClick={() => setIsStatusModalOpen(false)}>
                      OK
                  </Button>
                }
              />
            )
          }
        </Modal>
  
        </Content>
      </Layout>
      <AppFooter/>
    </Container>
    )
}

