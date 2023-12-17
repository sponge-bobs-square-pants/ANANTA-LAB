// Dashboard.jsx

import React from 'react';
import styled from 'styled-components';
import SliderButton from '../Component/SliderBurron';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f4f4f4; /* Set your desired background color */
`;

const DashboardHeading = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333; /* Set your desired text color */
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <DashboardHeading>Google Auth</DashboardHeading>
      <SliderButton />
    </DashboardContainer>
  );
};

export default Dashboard;
