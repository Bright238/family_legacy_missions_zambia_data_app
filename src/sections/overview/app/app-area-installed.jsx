import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { fetcher, endpoints } from 'src/lib/axios';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// Custom hook to create chart options
function useCreateChartOptions(categories, chartColors) {
  return useChart({
    chart: { type: 'bar' },
    colors: chartColors,
    xaxis: { categories, labels: { rotate: -45, style: { fontSize: '12px' } } },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex }) =>
          seriesIndex === 2 ? `${fNumber(value)}%` : fNumber(value),
      },
    },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    yaxis: [
      { title: { text: 'Average' }, labels: { formatter: (val) => fNumber(val) } },
      {
        opposite: true,
        title: { text: '% Advanced' },
        labels: { formatter: (val) => `${fNumber(val)}%` },
      },
    ],
  });
}

export function AppAreaInstalled({ subheader, sx, ...other }) {
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [chartData, setChartData] = useState({
    assessment_score: { categories: [], series: [] },
    child_gender: { categories: [], series: [] },
    class: { categories: [], series: [] },
    grade: { categories: [], series: [] },
    school: { categories: [], series: [] },
  });

  useEffect(() => {
    const fetchLiteracyData = async () => {
      try {
        const response = await fetcher(endpoints.literacy.list);
        console.log('Literacy Assessments Response:', response);

        const years = new Set();
        const dataByYear = {};

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((assessment) => {
            const date = new Date(assessment.assessment_date || new Date());
            const year = date.getFullYear();
            years.add(year);

            if (!dataByYear[year]) dataByYear[year] = [];
            dataByYear[year].push(assessment);
          });

          const aggregatedData = {};
          years.forEach((year) => {
            const assessments = dataByYear[year] || [];
            const dimensions = ['assessment_score', 'child_gender', 'class', 'grade', 'school'];
            const dataByDimension = {};
            dimensions.forEach((dim) => {
              dataByDimension[dim] = {
                ticks: {},
                sightWords: {},
                advanced: {},
                counts: {},
              };
            });

            assessments.forEach((assessment) => {
              const ticks = parseInt(assessment.total_ticks) || 0;
              const sightWords = parseInt(assessment.total_sight_words) || 0;
              const isAdvanced = ticks >= 22;

              dimensions.forEach((dim) => {
                const key = assessment[dim] || 'Unknown';
                if (!dataByDimension[dim].ticks[key]) {
                  dataByDimension[dim].ticks[key] = 0;
                  dataByDimension[dim].sightWords[key] = 0;
                  dataByDimension[dim].advanced[key] = 0;
                  dataByDimension[dim].counts[key] = 0;
                }
                dataByDimension[dim].ticks[key] += ticks;
                dataByDimension[dim].sightWords[key] += sightWords;
                dataByDimension[dim].advanced[key] += isAdvanced ? 1 : 0;
                dataByDimension[dim].counts[key] += 1;
              });
            });

            aggregatedData[year] = {};
            dimensions.forEach((dim) => {
              const categories = Object.keys(dataByDimension[dim].ticks).sort();
              const series = [
                {
                  name: 'Avg Ticks',
                  data: categories.map((key) =>
                    Number(
                      (
                        dataByDimension[dim].ticks[key] / (dataByDimension[dim].counts[key] || 1)
                      ).toFixed(1)
                    )
                  ),
                },
                {
                  name: 'Avg Sight Words',
                  data: categories.map((key) =>
                    Number(
                      (
                        dataByDimension[dim].sightWords[key] /
                        (dataByDimension[dim].counts[key] || 1)
                      ).toFixed(1)
                    )
                  ),
                },
                {
                  name: '% Advanced',
                  data: categories.map((key) =>
                    Number(
                      (
                        (dataByDimension[dim].advanced[key] /
                          (dataByDimension[dim].counts[key] || 1)) *
                        100
                      ).toFixed(1)
                    )
                  ),
                },
              ];

              aggregatedData[year][dim] = { categories, series };
            });
          });

          const mostRecentYear = Math.max(...Array.from(years));
          setChartData(aggregatedData[mostRecentYear] || {});
          setSelectedYear(mostRecentYear.toString());
        } else {
          console.warn('No valid data array in response:', response);
        }
      } catch (error) {
        console.error('Failed to fetch literacy assessments:', error);
      }
    };

    fetchLiteracyData();
  }, []);

  const chartColors = [
    theme.palette.primary.dark,
    theme.palette.primary.light,
    theme.palette.warning.main,
  ];

  const handleChangeYear = useCallback((newValue) => {
    setSelectedYear(newValue);
  }, []);

  // Move chartOptions creation to the component level
  const chartOptions = {
    assessment_score: useCreateChartOptions(chartData.assessment_score?.categories || [], chartColors),
    child_gender: useCreateChartOptions(chartData.child_gender?.categories || [], chartColors),
    class: useCreateChartOptions(chartData.class?.categories || [], chartColors),
    grade: useCreateChartOptions(chartData.grade?.categories || [], chartColors),
    school: useCreateChartOptions(chartData.school?.categories || [], chartColors),
  };

  const renderChart = (dimension, chartTitle) => (
    <Card sx={{ mb: 3, ...sx }} {...other}>
      <CardHeader
        title={`${chartTitle} Statistics`}
        subheader={subheader}
        action={
          <ChartSelect
            options={['2025']}
            value={selectedYear}
            onChange={handleChangeYear}
          />
        }
        sx={{ mb: 3 }}
      />
  
      <ChartLegends
        colors={chartColors}
        labels={chartData[dimension]?.series.map((series) => series.name) || []}
        values={
          chartData[dimension]?.series.map((series) =>
            series.name.includes('% Advanced')
              ? `${fShortenNumber(series.data.reduce((a, b) => a + b, 0))}%`
              : fShortenNumber(series.data.reduce((a, b) => a + b, 0))
          ) || []
        }
        sx={{ px: 3, gap: 3 }}
      />
  
      <Chart
        key={dimension}
        type="bar"
        series={chartData[dimension]?.series || []}
        options={chartOptions[dimension]}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          pl: 1,
          py: 2.5,
          pr: 2.5,
          height: 320,
        }}
      />
    </Card>
  );

  return (
    <>
      {renderChart('assessment_score', 'Assessment Score')}
      {renderChart('child_gender', 'Child Gender')}
      {renderChart('class', 'Class')}
      {renderChart('grade', 'Grade')}
      {renderChart('school', 'School')}
    </>
  );
}