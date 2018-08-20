import { createChart, updateChart } from './lib/chart';
import { flatMap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { readFile } from './lib/fileReader';

function init() {
    let chart;
    const fileElement = document.getElementById('file-upload');
    fromEvent(fileElement, 'change')
        .pipe(
            flatMap(readFile)
        )
        .subscribe((data) => {
            if (chart === undefined) {
                chart = createChart(data;
            } else {
                updateChart(chart, data);
            }
        });
}

init();