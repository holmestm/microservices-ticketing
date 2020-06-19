const Component = () => {
  return <div>Component</div>;
};

Component.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query;
};
export default Component;
