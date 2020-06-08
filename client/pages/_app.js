import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

// this can be called both within a server context and a client context i.e. within a browser

AppComponent.getInitialProps = async ({ Component, ctx: context }) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(context);
    console.log(pageProps);
  }
  return { pageProps, ...data };
};
export default AppComponent;
