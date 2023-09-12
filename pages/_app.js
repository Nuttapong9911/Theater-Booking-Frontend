import React from 'react'
import App from 'next/app'
import { Provider } from 'react-redux'
import withRedux from 'next-redux-wrapper'
import { ApolloProvider } from '@apollo/client/react';
import client from '../src/initApollo'
import store from '../src/redux/store'

// import '../styles/globals.css'
import '../src/styles/theater.css'

class MyApp extends App {
  static async getInitialProps({Component, ctx}) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}
    return {pageProps: pageProps}
}

  render() {
    const { Component, pageProps } = this.props
    return (
        <Provider store={store}>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
          </ApolloProvider>
        </Provider>
    )
  }
}

const makeStore = () => store
export default withRedux(makeStore)(MyApp)