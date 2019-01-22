import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import { Add, LockOutlined } from '@material-ui/icons';

import WorkoutProgress from './WorkoutProgress';
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

    render() {
        const monthProgress = this.calcMonthProgress();
        const yearProgress = this.calcYearProgress();

        return (
            <React.Fragment>
                <div className='grid-container'>
                    <h1 className='title'> Axercise </h1>
                    <WorkoutProgress className='progress-bar-left' label='Monthly Progress' progress={monthProgress} />
                    <WorkoutProgress className='progress-bar-right' label='Yearly Progress' progress={yearProgress} />
                    <div className='workout-table'>
                        <WorkoutTable workouts={this.state.workouts} updateWorkout={this.updateWorkout} calcPoints={this.calcPoints} />
                    </div>
                </div>
                <span className='buttons'>
                    <Button className='button' color='primary' variant='contained' onClick={this.addWorkout}>
                        Add Workout<Add className='icon' />
                    </Button>
                    <Button className='button' color='secondary' variant='contained' onClick={this.addWorkout}>
                        Save Workouts<LockOutlined className='icon' />
                    </Button>
                </span>
            </React.Fragment>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));