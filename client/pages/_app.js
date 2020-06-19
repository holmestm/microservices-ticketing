// this is the default top level component. Next.js opens the relevant physical page then renders from here first passing
// in the component defined in that page to the AppComponent as a parameter.

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
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

AppComponent.getInitialProps = async ({ Component, ctx: context }) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  let pageProps = {};
  if (Component.getInitialProps) {
    // call the component's getInitialProps provided by the physical page visited e.g. index.js, auth/signup.js
    pageProps = await Component.getInitialProps(
      context,
      client, // for API calls
      data.currentUser // pass in the current user
    );
    console.log(pageProps);
  }
  return { pageProps, ...data };
};
export default AppComponent;
