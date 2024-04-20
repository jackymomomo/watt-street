// KwhGraph.js
import React, { useEffect, useRef } from 'react';
import { totalForwardEnergy } from './dashboard';
import * as echarts from 'echarts';

const KwhGraph = ({ totalForwardEnergy }) => {
    const chartRef = useRef(null);
    let myChart = null;
  
    useEffect(() => {
      if (chartRef.current) {
        myChart = echarts.init(chartRef.current);
  
        const days = Object.keys(totalForwardEnergy);
        const data = days.map(day => ({ name: day, value: totalForwardEnergy[day] }));
  
        const option = {
          xAxis: {
            type: 'category',
            data: days,
          },
          yAxis: {
            type: 'value',
          },
          series: [{
            data: data,
            type: 'bar',
            label: {
              show: true,
              position: 'top'
            }
          }]
        };
  
        myChart.setOption(option);
      }
  
   

      return () => myChart && myChart.dispose();
    }, [totalForwardEnergy]);
  
    return <div ref={chartRef} style={{ width: '100%', height: '200px', justifyContent: "center" }} />;
  };
  
export default KwhGraph;