import React from 'react';
import ReactDOM from 'react-dom';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import WorkoutTable from './WorkoutTable';


class App extends React.Component {
    monthlyPoints = 12;
    yearlyPoints = 160;

    state = {
        selectedDate: new Date(),
        workouts: [],
    }

    addWorkout = () => {
        this.setState({
            workouts: [...this.state.workouts, {
                date: new Date(),
                description: "",
                teamEvent: false,
                organized: false,
            }]
        });
    }

    updateWorkout = (index, field, object, value) => {
        let workouts = this.state.workouts.slice();
        workouts[index] = { ...workouts[index], [field]: value };

        this.setState({ workouts });
    }

    calcPoints = workout => {
        const teamEventPoints = workout.teamEvent ? 1 : 0;
        const organizedPoints = workout.organized ? 1 : 0;

        return 1 + teamEventPoints + organizedPoints;
    }

    calcMonthProgress = () => {
        const points = this.state.workouts.reduce((points, workout) => {
            const today = new Date();
            const thisMonth = workout.date.getMonth() === today.getMonth() && workout.date.getYear() === today.getYear();

            return thisMonth ? points + this.calcPoints(workout) : points;
        }, 0);

        const progress = Math.floor((points / this.monthlyPoints) * 100);

        return progress > 100 ? 100 : progress;
    }

    calcYearProgress = () => {
        const points = this.state.workouts.reduce((points, workout) => {
            const today = new Date();
            const thisYear = workout.date.getYear() === today.getYear();

            return thisYear ? points + this.calcPoints(workout) : points;
        }, 0);

        const progress = Math.floor((points / this.yearlyPoints) * 100);

        return progress > 100 ? 100 : progress;
    }

    calcStatus = progress => progress === 100 ? 'success' : 'active'

    render() {
        const monthProgress = this.calcMonthProgress();
        const yearProgress = this.calcYearProgress();

        const monthStatus = this.calcStatus(monthProgress);
        const yearStatus = this.calcStatus(monthStatus);

        return (
            <React.Fragment>
                <h1> Axercise </h1>
                <span>
                    <Progress type="circle" percent={monthProgress} status={monthStatus} />
                    <Progress type="circle" percent={yearProgress} status={yearStatus} />
                </span>
                <WorkoutTable workouts={this.state.workouts} updateWorkout={this.updateWorkout} calcPoints={this.calcPoints} />
                <Fab color="primary" onClick={this.addWorkout}>
                    <AddIcon />
                </Fab>
            </React.Fragment>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));