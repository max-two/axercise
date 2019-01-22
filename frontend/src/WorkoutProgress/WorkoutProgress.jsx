import React from 'react';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

class WorkoutProgress extends React.Component {

    calcColor = (pct, type) => {
        const colorOptions = {
            main: [
                { pct: 0, color: { r: 0xff, g: 0x00, b: 0 } },
                { pct: 50, color: { r: 0xff, g: 0xcc, b: 0 } },
                { pct: 100, color: { r: 0x00, g: 0xff, b: 0 } }
            ],
            trail: [
                { pct: 0, color: { r: 0xff, g: 0xaa, b: 0xaa } },
                { pct: 50, color: { r: 0xff, g: 0xff, b: 0xaa } },
                { pct: 100, color: { r: 0xaa, g: 0xff, b: 0xaa } }
            ]
        };

        const colors = colorOptions[type];

        let i;
        for (i = 0; i < colors.length - 1; i++) {
            if (pct <= colors[i + 1].pct) {
                break;
            }
        }

        const lower = colors[i];
        const upper = colors[i + 1];
        const range = upper.pct - lower.pct;
        const rangePct = (pct - lower.pct) / range;
        const pctLower = 1 - rangePct;
        const pctUpper = rangePct;
        const color = [
            Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        ];

        return `rgb(${color.join(',')})`;
    }

    render() {
        const theme = {
            active: {
                trailColor: this.calcColor(this.props.progress, 'trail'),
                color: this.calcColor(this.props.progress, 'main')
            }
        }

        return (
            <div className={this.props.className}>
                <Progress
                    type="circle"
                    width={225}
                    strokeWidth={3}
                    theme={theme}
                    percent={this.props.progress}
                />
                <h2 className='progressLabel'>{this.props.label}</h2>
            </div>
        )
    }
}

export default WorkoutProgress;