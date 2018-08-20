import Chart from 'chart.js';
import { GreenData } from './fileReader';
import { groupBy, transform } from 'lodash';

interface ChartDataset {
    t: string;
    y: number;
    unit: string;
}

interface ChartData {
    labels: string[];
    data: ChartDataset[];
    yLabel: string;
}

export function createChart(data: GreenData[]) {
    const chartData = format(data);
    const el = document.getElementById('destination') as HTMLCanvasElement;
    const ctx = el.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = 300;

    const config = {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                type: 'line',
                pointRadius: 1,
                fill: true,
                borderWidth: 2,
                backgroundColor: "rgba(65, 168, 95, 0.5)",
                borderColor: "rgba(65, 168, 95, .75)",
                pointBorderColor: "rgba(65, 168, 95, 1)"
            }]
        },
        options: {
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'series',
                    ticks: {
                        source: 'labels',
                        callback: (value, index, values) => {
                            const skip = Math.round(values.length / (window.innerWidth / 50));
                            if (index % skip === 0) {
                                return value;
                            }
                        }
                    },
                    time: {
                        unit: 'day',
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: chartData.yLabel
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltip, data) {
                        let label = tooltip.yLabel.toFixed(2);
                        let unit = data.datasets[tooltip.datasetIndex].data[tooltip.index].unit;
                        return `${label} ${unit}`;
                    }
                }
            }
        },
    };

    return new Chart(ctx, config);
}

export function updateChart(chart: any, data: GreenData[]) {
    const chartData = format(data);
    chart.data.labels = chartData.labels;
    chart.data.datasets[0].data = chartData.data;
    chart.options.scales.yAxes[0].scaleLabel.labelString = chartData.yLabel;
    chart.update();
}

function format(data: GreenData[]) {
    const labels: string[] = [];
    const grouped = groupBy(data, 'date');
    const chartDataset = transform(grouped, (acc: ChartDataset[], value, key) => {
        const usage = value.reduce((acc, v) => {
            return acc + v.usage;
        }, 0);

        labels.push(key);

        acc.push({
            t: key,
            y: usage,
            unit: value[0].units,
        });

        return acc;
    }, []);

    const chartData: ChartData = {
        labels,
        data: chartDataset,
        yLabel: `${data[0].units} used`
    };

    return chartData;
}