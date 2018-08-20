import { includes } from 'lodash';
import { Observable } from 'rxjs';
import { parse as csvParser } from 'papaparse';
import { split } from 'eol';

export interface GreenData {
    type: string;
    date: string;
    time: string;
    usage: number;
    units: string;
    cost: number;
}

export function readFile(event: Event): Observable<GreenData[]> {
    const target = event.target as HTMLInputElement;
    const blob = target.files[0];

    const label = document.querySelector('#file-upload + label');
    var fileName = target.value.split( '\\' ).pop();

    label.querySelector('span').innerHTML = fileName;

    return Observable.create((obs) => {
        const reader = new FileReader();

        reader.onerror = (err) => obs.error(err);
        reader.onabort = (err) => obs.error(err);
        reader.onload = () => obs.next(parse(reader.result.toString()));
        reader.onloadend = () => obs.complete();

        return reader.readAsText(blob);
    })
}

function parse(file: string) {
    const lines = split(file);
    while (!includes(lines[0], 'TYPE')) {
        lines.shift();
    }

    const csv = csvParser(lines.join('\n'), {
        header: true,
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
    }).data as any[]; 

    return csv.map((data) => {
        const parsedData: GreenData = {
            type: data.TYPE as string,
            date: data.DATE as string,
            time: data['START TIME'] as string,
            usage: data.USAGE as number,
            units: data.UNITS as string,
            cost: parseFloat(data.COST.substring(1)),
        };

        return parsedData;
    });
}