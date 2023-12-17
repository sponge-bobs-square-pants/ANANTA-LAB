import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CreateUser, LoginUser } from '../Features/User/UserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setotp, verify2FA } from '../Features/User/UserAuthentication';
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [otpValue, setOTPValue] = useState('');
  const { is2FAEnabled } = useSelector((state) => state.user);
  const [response, setResponse] = useState(null);
  const { otpVerificationStatus } = useSelector((state) => state.uauth);
  const [formData, setformData] = useState({
    userId: '',
    password: '',
  });
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleRegister = async () => {
    try {
      const response = await dispatch(CreateUser(formData));
      if (response.payload) {
        // navigate('/dashboard');
      }
    } catch (error) {
      console.log('There was an error', error);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(LoginUser(formData));
      setResponse(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const handleLoginSuccess = () => {
      if (is2FAEnabled) {
        setShowModal(true);
      } else {
        navigate('/dashboard');
      }
    };
    const handleLoginFailure = (error) => {
      console.log('Login failed:', error);
    };
    if (response?.payload) {
      handleLoginSuccess();
    } else {
      handleLoginFailure(response?.error);
    }
  }, [is2FAEnabled, navigate, response]);
  useEffect(() => {
    if (otpVerificationStatus === 'success') {
      navigate('/dashboard');
    }
  }, [otpVerificationStatus, navigate]);

  const handle2FAAuth = async () => {
    try {
      dispatch(setotp({ otp: otpValue }));
      await dispatch(verify2FA());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Form onSubmit={(e) => handleLogin(e)}>
        <Label>
          User Id:
          <input
            type='text'
            placeholder='Enter UserId'
            name='userId'
            value={formData.userId}
            onChange={handleChange}
          />
        </Label>
        <Label>
          Password:
          <input
            type='password'
            placeholder='Enter Password'
            name='password'
            value={formData.password}
            onChange={handleChange}
          />
        </Label>
        <Button type='submit'>Log In</Button>
        <Button
          type='button'
          onClick={handleRegister}
          style={{ position: 'relative', left: '10rem', top: '-28.5px' }}
        >
          Register
        </Button>
      </Form>
      {is2FAEnabled && showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalInput
              type='text'
              placeholder='Enter OTP'
              value={otpValue}
              onChange={(e) => setOTPValue(e.target.value)}
            />
            <ModalButton type='button' onClick={handle2FAAuth}>
              Submit
            </ModalButton>
            <ModalCancelButton type='button'>Cancel</ModalCancelButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};
const Label = styled.div`
  display: block;
  padding: 0.2rem;
  /* margin-bottom: 100px; */
`;
const Button = styled.button`
  display: block;
  padding: 0.3rem;
  background-color: black;
  color: white;
  width: 10vw;
  /* margin-bottom: 100px; */
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* Ensure it appears on top of other elements */
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalInput = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ModalButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ModalCancelButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #ccc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
export default LoginPage;
