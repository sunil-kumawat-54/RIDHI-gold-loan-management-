import logo from 'assets/images/vinsup-logo.png';

const Logo = () => {

  return (

    <>

      <img
        src={logo}
        alt="Riddhi"
        style={{ width: 'clamp(56px, 8vw, 90px)', height: 'auto', display: 'block', margin: '0 auto' }}
      /><br></br>

    </>

  );

};

export default Logo;