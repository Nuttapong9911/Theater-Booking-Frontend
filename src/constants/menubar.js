const menus = [
    { key: "/", label: "HOME"},
    { key: "/movies", label: "MOVIE"},
    { key: "/buyticket", label: "BUY TICKET"},
    { key: "/refcode", label: "REF CODE"},
    {  label: "SYSTEM", children: [
        {
            key: "/systemconfig/movie",
            label: "MOVIE"
        },
        {
            key: "/systemconfig/showtime",
            label: "SHOWTIME"
        },
        {
            key: "/systemconfig/theater",
            label: "THEATER"
        },
    ]},
]

const loginregister = [
  { key: "/register", label: "REGISTER"},
  { key: "/login", label: "LOGIN"}
]

export {
    menus,
    loginregister
}