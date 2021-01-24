// this is the default top level component. Next.js opens the relevant physical page then renders from here first passing
// in the component defined in that page to the AppComponent as a parameter.

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';
import { AppContext } from 'next/dist/pages/_app';
import { AppProps } from 'next/dist/pages/_app';
import { AuthComponentProps } from '../model/authComponentProps';

interface AuthAppProps extends AppProps {
  currentUser?: string
}

const AppComponent = ({ Component, pageProps, currentUser }: AuthAppProps) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

// this can be called both within a server context and a client context i.e. within a browser

AppComponent.getInitialProps = async ({ Component, ctx: context }: AppContext) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  let pageProps = {};
  if (Component.getInitialProps) {
    let props: AuthComponentProps = {
      context,
      client,
      currentUser: data.currentUser
    }
    let extendedComponent = Component as unknown;
    // call the component's getInitialProps provided by the physical page visited e.g. index.js, auth/signup.js
    
    // @ts-ignore - we are passing additional args to those defined in the next.js method signature
    pageProps = await Component.getInitialProps(props);
    console.log(pageProps);
  }
  return { pageProps, ...data };
};
export default AppComponent;
