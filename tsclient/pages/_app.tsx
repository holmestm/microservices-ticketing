// this is the default top level component. Next.js opens the relevant physical page then renders from here first passing
// in the component defined in that page to the AppComponent as a parameter.

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';
import { AppContext } from 'next/dist/pages/_app';
import { AppProps } from 'next/dist/pages/_app';
import { AuthComponentProps, AuthComponentType } from '../model/authComponent';
import { User } from '../model/user';

interface AuthAppProps extends AppProps {
  currentUser?: User;
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
  let MyComponent: AuthComponentType = Component as AuthComponentType;
  if (MyComponent.getInitialProps) {
    let props: AuthComponentProps = {
      context,
      client,
      currentUser: data.currentUser
    }
    pageProps = await MyComponent.getInitialProps(props);
  }
  return { pageProps, ...data };
};
export default AppComponent;
