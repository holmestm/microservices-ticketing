import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>Not Signed In</h1>;
};

LandingPage.getInitialProps = async (context) => {
  console.debug('Landing Page');
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
