import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import {
  get2FA,
  setotp,
  verify2FA,
  deactive2FA,
} from '../Features/User/UserAuthentication';
import { useNavigate } from 'react-router-dom';
import { set2FAEnabled } from '../Features/User/UserSlice';

const SliderInput = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  outline: none;
  background: ${({ checked }) => (checked ? '#4CAF50' : '#ccc')};
  transition: background 0.3s ease;

  &::before {
    content: '';
    position: relative;
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transform: ${({ checked }) =>
      checked ? 'translateX(20px)' : 'translateX(0)'};
    transition: transform 0.3s ease;
  }
`;

const ModalContent = styled.div`
  text-align: center;
  padding: 20px;
`;

const ModalImage = styled.img`
  max-width: 100%;
  height: auto;
  margin-top: 10px;
`;

const SliderButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { is2FA, secret, imgurl, otp, otpVerificationStatus } = useSelector(
    (state) => state.uauth
  );
  const [displayIt, setdisplayIt] = useState(false);
  const { is2FAEnabled } = useSelector((state) => state.user);
  const handleSliderChange = () => {
    if (is2FAEnabled) {
      setdisplayIt(true);
    } else {
      setdisplayIt(true);
      dispatch(get2FA());
    }
  };
  const handleotp = (e) => {
    dispatch(setotp({ otp: e.target.value }));
  };
  const complete2fa = () => {
    if (is2FAEnabled) {
      dispatch(deactive2FA());
    } else {
      dispatch(verify2FA());
    }
  };
  useEffect(() => {
    if (otpVerificationStatus === 'success') {
      dispatch(set2FAEnabled());
      navigate('/dashboard');
    }
  }, [otpVerificationStatus, navigate]);

  return (
    <>
      <SliderInput
        type='checkbox'
        checked={is2FA || is2FAEnabled}
        onChange={handleSliderChange}
      />
      {is2FA && !is2FAEnabled && (
        <Modal
          isOpen
          contentLabel='Example Modal'
          onRequestClose={handleSliderChange}
          ariaHideApp={false}
        >
          <ModalContent>
            <h2>Google Auth Credentials</h2>
            <p>Secret: {secret}</p>
            <ModalImage src={imgurl} alt='QR code for Google Auth' />
            <label>
              OTP:
              <input
                type='number'
                value={otp}
                onChange={(e) => handleotp(e)}
              ></input>
            </label>
            <button type='button' onClick={complete2fa}>
              Submit
            </button>
            <button onClick={handleSliderChange}>Close Modal</button>
          </ModalContent>
        </Modal>
      )}
      {is2FAEnabled && displayIt && (
        <Modal
          isOpen
          contentLabel='Example Modal'
          onRequestClose={handleSliderChange}
          ariaHideApp={false}
        >
          <ModalContent>
            <h2>STOP GOOGLE AUTH</h2>
            <button type='button' onClick={complete2fa}>
              Submit
            </button>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default SliderButton;
