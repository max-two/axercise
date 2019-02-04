import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import { Add, LockOutlined } from '@material-ui/icons';

import WorkoutProgress from './WorkoutProgress';
import WorkoutTable from './WorkoutTable';

import secrets from '../secrets.json';


class App extends React.Component {
    monthlyPoints = 12;
    yearlyPoints = 160;

    state = {
        selectedDate: new Date(),
        workouts: [],
        auth: {},
        email: ''
    }

    componentDidMount() {
        gapi.load('client:auth2', this.initClient);
    }

    initClient = () => {
        gapi.client.init(secrets.gapi).then(() => {
            const auth = gapi.auth2.getAuthInstance();
            auth.isSignedIn.listen(this.updateSigninStatus);
            this.setState({ auth }, this.updateSigninStatus.bind(null, auth.isSignedIn.get()));
            this.loadWorkouts();
        }, error => {
            console.error(JSON.stringify(error, null, 2));
        });
    }

    updateSigninStatus = isSignedIn => {
        if (isSignedIn) {
            this.setState({ email: this.state.auth.currentUser.get().getBasicProfile().getEmail() });
        } else {
            this.setState({ email: '' });
        }
    }

    signIn = () => {
        this.state.auth.signIn();
    }

    signOut = () => {
        this.state.auth.signOut();
    }

    // TODO: validation/required fields
    saveWorkouts = () => {
        const email = this.state.email;
        const values = this.state.workouts
            .filter(workout => !workout.saved)
            .map(workout => [email, workout.date, workout.description, workout.teamEvent, workout.organized]);

        gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: secrets.spreadsheetId,
            range: 'A2',
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        }).then(response => {
            console.log(response);
        });
    }

    loadWorkouts = () => {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: secrets.spreadsheetId,
            range: 'A2:E',
        }).then(response => {
            const workouts = response.result.values
                .filter(workout => workout[0] === this.state.email)
                .map(workout => ({
                    date: new Date(workout[1]),
                    description: workout[2],    // TODO: Hook up this value
                    teamEvent: workout[3] === 'TRUE' ? true : false,
                    organized: workout[4] === 'TRUE' ? true : false,
                    saved: true
                })
                );

            this.setState({ workouts })
        }, response => {
            console.error('Error: ' + response.result.error.message);
        });
    }

    addWorkout = () => {
        this.setState({
            workouts: [...this.state.workouts, {
                date: new Date(),
                description: "",
                teamEvent: false,
                organized: false,
                saved: false
            }]
        });
    }

    updateWorkout = (index, field, event, checked) => {
        const value = checked ? checked : event.target.value;   // The checkboxes handle onChange callbacks by passing in a specific checked parameter

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
                    <Button className='button' color='secondary' variant='contained' onClick={this.saveWorkouts}>
                        Save Workouts<LockOutlined className='icon' />
                    </Button>
                </span>
            </React.Fragment>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));