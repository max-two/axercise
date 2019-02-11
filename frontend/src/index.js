import React from 'react';
import ReactDOM from 'react-dom';

import uuid from 'uuid/v1';

import Button from '@material-ui/core/Button';
import { Add, LockOutlined } from '@material-ui/icons';

import WorkoutProgress from './WorkoutProgress';
import WorkoutTable from './WorkoutTable';

import secrets from '../secrets.json';

const UNSAVED = "unsaved";
const SAVED = "saved";
const UPDATED = "updated";

class App extends React.Component {
    monthlyPoints = 12;
    yearlyPoints = 160;

    months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

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

    getWorkouts = cb => {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: secrets.spreadsheetId,
            range: `${this.getMonth()}!A2:F`,
        }).then(response => {
            cb(response.result.values);
        }, response => {
            console.error('Error: ' + response.result.error.message);
        });
    }

    // TODO: validation/required fields
    saveWorkouts = () => {
        // Check for this month's sheet
        gapi.client.sheets.spreadsheets.get({ spreadsheetId: secrets.spreadsheetId }).then(response => {
            const sheets = response.result.sheets;
            const month = this.getMonth();

            const sheetExists = sheets.map(sheet => sheet.properties.title).includes(month);

            // TODO: this block of logic could be way cleaner with async/await
            if (sheetExists) {
                this.writeWorkouts();
            } else {
                gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: secrets.spreadsheetId
                }, {
                        requests: [
                            {
                                addSheet: {
                                    properties: { title: month }    // TODO: create the headers
                                }
                            }
                        ]
                    }
                ).then(response => {
                    this.writeWorkouts();
                });
            }
        });
    }

    writeWorkouts = () => {
        const email = this.state.email;
        const month = this.getMonth();

        const updatedWorkouts = this.state.workouts
            .filter(workout => workout.status === UPDATED)
            .map(workout => [email, workout.id, workout.date, workout.description, workout.teamEvent, workout.organized]);

        const unsavedWorkouts = this.state.workouts
            .filter(workout => workout.status === UNSAVED)
            .map(workout => [email, workout.id, workout.date, workout.description, workout.teamEvent, workout.organized]);

        // Update modified workouts
        // TODO: turn this and the following into a batch update that allows you to do multiple ranges at once
        this.getWorkouts(workouts => {
            updatedWorkouts.forEach(updatedWorkout => {
                const index = workouts.findIndex(workout => workout[1] === updatedWorkout[1]);

                gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: secrets.spreadsheetId,
                    range: `${month}!A${index + 2}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: [updatedWorkout] }
                }).then(response => {
                    // TODO: toastify
                    this.updateWorkout(updatedWorkout[1], { status: SAVED });
                });
            });
        });

        // Save unsaved workouts
        unsavedWorkouts.length > 0 && gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: secrets.spreadsheetId,
            range: `${month}!A2`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: unsavedWorkouts }
        }).then(response => {
            // TODO: toastify
            unsavedWorkouts.forEach(workout => this.updateWorkout(workout[1], { status: SAVED }));
        });
    }

    loadWorkouts = () => {
        this.getWorkouts(workouts => {
            workouts = workouts && workouts
                .filter(workout => workout[0] === this.state.email)
                .map(workout => ({
                    id: workout[1],
                    date: new Date(workout[2]),
                    description: workout[3],
                    teamEvent: workout[4] === 'TRUE' ? true : false,
                    organized: workout[5] === 'TRUE' ? true : false,
                    status: SAVED
                }))
                .sort((first, second) => first.date > second.date ? 1 : -1);

            this.setState({ workouts: workouts || [] });
        });
    }

    addWorkout = () => {
        this.setState({
            workouts: [...this.state.workouts, {
                id: uuid(),
                date: new Date(),
                description: "",
                teamEvent: false,
                organized: false,
                status: UNSAVED
            }]
        });
    }

    updateWorkout = (id, update) => {
        let workouts = this.state.workouts.slice();
        let index = workouts.findIndex(workout => workout.id === id);

        workouts[index] = {
            ...workouts[index],
            ...update,
            status: workouts[index].status === UNSAVED ? UNSAVED : UPDATED
        };

        this.setState({ workouts });
    }

    getMonth = () => {
        const date = new Date();
        return this.months[date.getMonth()];
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