import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Update state variables to dynamic values from the API
  const [amps, setAmps] = useState('0 A');
  const [kW, setKW] = useState('0 kW');
  const [volts, setVolts] = useState('0 V');
  const [totalForwardEnergy, setTotalForwardEnergy] = useState('0 kWh');


  function decodePhaseAData(encodedData) {
    // Decode base64 to byte array
    const rawData = atob(encodedData);
    const data = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      data[i] = rawData.charCodeAt(i);
    }
  
    // Extract and convert data
    const voltage = ((data[0] << 8) | data[1]) / 10; // Voltage in volts
    const current = ((data[2] << 16) | (data[3] << 8) | data[4]) / 1000; // Current in amps
    const power = ((data[5] << 16) | (data[6] << 8) | data[7]) / 1000; // Power in kW
    
    return { voltage, current, power };
  }
  
  
  const fetchDeviceStatus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.110:3001/device-status/eb4c7af2945b77cce4xdb9`);
      const results = response.data.result;

        // Find the total forward energy object
        const totalForwardEnergyObj = results.find(d => d.code === "total_forward_energy");
        if (totalForwardEnergyObj) {
          const energy = totalForwardEnergyObj.value;
          const formattedEnergy = `${(energy / 100).toFixed(2)} kWh`;
          setTotalForwardEnergy(formattedEnergy);
        }
        
      const phaseAObj = results.find(d => d.code === "phase_a");
      if (phaseAObj) {
        const phaseAData = decodePhaseAData(phaseAObj.value);
        // Assuming phaseAData is now an object with amps, volts, kW keys
        setAmps(`${phaseAData.current} A`);
        setKW(`${phaseAData.power} kW`);
        setVolts(`${phaseAData.voltage} V`);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch device status:', error);
      setIsLoading(false);
    }
  };
  const toggleDeviceSwitch = async () => {
    setIsLoading(true);
    try {
      // Assuming deviceStatus has a 'switch' property to indicate current state
      const currentSwitchState = deviceStatus?.switch;
      await axios.post(`http://192.168.1.110:3001/device-action/${'eb4c7af2945b77cce4xdb9'}`, {
        newState: !currentSwitchState,
      });
      // Toggle the switch state in the local state to reflect the change
      setDeviceStatus({ ...deviceStatus, switch: !currentSwitchState });
      setIsLoading(false);
    } catch (error) {
      console.error('Error toggling switch:', error);
      setIsLoading(false);
    }
  };
  

  return (
    <div>
      <h2>Energy Measurements</h2>
      <ul>
        <li>Amps: {amps}</li>
        <li>kWh: {totalForwardEnergy}</li>
        <li>kW: {kW}</li>
        <li>Volts: {volts}</li>
      </ul>
      <button onClick={fetchDeviceStatus} disabled={isLoading}>
        {isLoading ? 'Fetching...' : 'Fetch Status'}
      </button>
      <button onClick={toggleDeviceSwitch} disabled={isLoading}>
        {deviceStatus?.switch ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  );
}

export default Dashboard;
