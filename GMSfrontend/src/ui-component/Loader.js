import { styled } from '@mui/material/styles';
import genericLoader from '../assets/images/riddhi-loader.gif';
import loginLoader from '../assets/images/riddhi-login-loader.mp4';

// styles
const LoaderWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'inline'
})(({ inline }) => ({
  position: inline ? 'relative' : 'fixed',
  top: 0,
  left: 0,
  zIndex: 1301,
  width: '100%',
  minHeight: inline ? '48px' : '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '24px',
  boxSizing: 'border-box',
  background: inline ? 'transparent' : 'rgba(255, 255, 255, 0.92)',
}));

// ==============================|| LOADER ||============================== //
const Loader = ({ variant = 'generic', inline = false }) => {
  const isLoginLoader = variant === 'login';

  return (
    <LoaderWrapper inline={inline} role="status" aria-live="polite">
      {isLoginLoader ? (
        <video
          src={loginLoader}
          autoPlay
          muted
          loop
          playsInline
          aria-label="Signing in"
          style={{ width: 'min(360px, 70vw)', height: 'min(360px, 70vw)', objectFit: 'contain' }}
        />
      ) : (
        <img
          src={genericLoader}
          alt="Loading"
          width="150"
          height="150"
          style={{ width: inline ? '48px' : 'min(150px, 35vw)', height: 'auto', objectFit: 'contain' }}
        />
      )}
    </LoaderWrapper>
  );
};


export default Loader;
