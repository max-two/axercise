import React from 'react';
import ReactDOM from 'react-dom';

import uuid from 'uuid/v1';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Button from '@material-ui/core/Button';
import { Add, LockOutlined } from '@material-ui/icons';

import WorkoutProgress from './WorkoutProgress';
import WorkoutTable from './WorkoutTable';

import secrets from '../secrets.json';
import logo from './logo.png';

const UNSAVED = "unsaved";
const SAVED = "saved";
const UPDATED = "updated";

class App extends React.Component {
    monthlyPoints = 12;
    yearlyPoints = 160;

    state = {
        selectedDate: new Date(),
        workouts: [],
        selected: [],
        auth: {},
        email: ''
    }

    componentDidMount() {
        gapi.load('client:auth2:signin2', this.initClient);
    }

    initClient = () => {
        gapi.client.init(secrets.gapi).then(() => {
            gapi.signin2.render('sign-in-button', {
                scope: secrets.gapi.scope
            });

            const auth = gapi.auth2.getAuthInstance();
            auth.isSignedIn.listen(this.updateSigninStatus);
            this.setState({ auth }, this.updateSigninStatus.bind(null, auth.isSignedIn.get()));
            this.loadWorkouts();
        }, error => {
            toast.error(JSON.stringify(error, null, 2));
        });
    }

    beforeUnload = e => {
        e = e || window.event;
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
    }

    updateBeforeUnload = workouts => {
        workouts.reduce((acc, workout) => acc || workout.status !== SAVED, false) ?
            window.onbeforeunload = this.beforeUnload :
            window.onbeforeunload = undefined;
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

    checkSheet = cb => {
        gapi.client.sheets.spreadsheets.get({ spreadsheetId: secrets.spreadsheetId }).then(response => {
            const sheets = response.result.sheets;
            const year = this.getYear();

            const sheetExists = sheets.map(sheet => sheet.properties.title).includes(year);

            // TODO: this block of logic could be way cleaner with async/await
            if (sheetExists) {
                cb();
            } else {
                gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: secrets.spreadsheetId
                }, {
                        requests: [
                            {
                                addSheet: {
                                    properties: { title: year }    // TODO: create the headers
                                }
                            }
                        ]
                    }
                ).then(response => {
                    cb();
                });
            }
        });
    }

    getWorkouts = cb => {
        this.checkSheet(() => {
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: secrets.spreadsheetId,
                range: `${this.getYear()}!A2:G`,
            }).then(response => {
                cb(response.result.values);
            }, response => {
                toast.error('Error: ' + response.result.error.message);
            });
        });
    }

    // TODO: validation/required fields
    saveWorkouts = () => {
        this.checkSheet(() => {
            const email = this.state.email;
            const year = this.getYear();

            const updatedWorkouts = this.state.workouts
                .filter(workout => workout.status === UPDATED)
                .map(workout => [email, workout.id, workout.date, workout.description, workout.teamEvent, workout.organized, false]);

            const unsavedWorkouts = this.state.workouts
                .filter(workout => workout.status === UNSAVED)
                .map(workout => [email, workout.id, workout.date, workout.description, workout.teamEvent, workout.organized, false]);

            // Update modified workouts
            // TODO: turn this and the following into a batch update that allows you to do multiple ranges at once
            this.getWorkouts(workouts => {
                updatedWorkouts.forEach(updatedWorkout => {
                    const index = workouts.findIndex(workout => workout[1] === updatedWorkout[1]);

                    gapi.client.sheets.spreadsheets.values.update({
                        spreadsheetId: secrets.spreadsheetId,
                        range: `${year}!A${index + 2}`,
                        valueInputOption: 'USER_ENTERED',
                        resource: { values: [updatedWorkout] }
                    }).then(response => {
                        toast.success("Workout updates saved");
                        this.updateWorkout(updatedWorkout[1], { status: SAVED });
                    });
                });
            });

            // Save unsaved workouts
            unsavedWorkouts.length > 0 && gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: secrets.spreadsheetId,
                range: `${year}!A2`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: unsavedWorkouts }
            }).then(response => {
                toast.success("New workouts saved");
                unsavedWorkouts.forEach(workout => this.updateWorkout(workout[1], { status: SAVED }));
            })
        });
    }

    loadWorkouts = () => {
        this.state.email && this.getWorkouts(workouts => {
            workouts = workouts && workouts
                .filter(workout => workout[6] === 'FALSE')              // Filter out any deleted workouts
                .filter(workout => workout[0] === this.state.email)     // Filter for this users workouts
                .map(workout => ({                                      // Generate workout objects
                    id: workout[1],
                    date: new Date(workout[2]),
                    description: workout[3],
                    teamEvent: workout[4] === 'TRUE' ? true : false,
                    organized: workout[5] === 'TRUE' ? true : false,
                    status: SAVED
                }))
                .sort((first, second) => first.date > second.date ? 1 : -1);    // Sort in descending order

            this.setState({ workouts: workouts || [] });
        });
    }

    addWorkout = () => {
        window.onbeforeunload = this.beforeUnload;

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

        const today = new Date();
        const date = workouts[index].date;
        if (today.getMonth() !== date.getMonth() || today.getYear() !== date.getYear()) {
            toast.error('Can only edit workouts from this month');
            return;
        }

        workouts[index] = {
            ...workouts[index],
            status: workouts[index].status === UNSAVED ? UNSAVED : UPDATED,
            ...update
        };

        this.updateBeforeUnload(workouts);

        this.setState({ workouts });
    }

    deleteWorkout = () => {
        const today = new Date();
        const hasInvalidMonth = this.state.selected.reduce((acc, id) => {
            const workout = this.state.workouts.find(workout => workout.id === id);
            return acc || today.getMonth() !== workout.date.getMonth() || today.getYear() !== workout.date.getYear();
        }, false);

        if (hasInvalidMonth) {
            toast.error('Can only edit workouts from this month');
            return;
        }

        const savedIds = this.state.selected.filter(id => {
            const workout = this.state.workouts.find(workout => workout.id === id);
            return workout && workout.status !== UNSAVED;
        });

        const workouts = this.state.workouts.filter(workout => !this.state.selected.includes(workout.id));
        this.updateBeforeUnload(workouts);

        this.setState({
            workouts,
            selected: this.state.selected.filter(id => !this.state.selected.includes(id))
        });

        savedIds.length && this.getWorkouts(workouts => {
            const year = this.getYear();

            savedIds.forEach(id => {
                const index = workouts.findIndex(workout => workout[1] === id);
                const values = [[...workouts[index].slice(0, 6), true]];

                gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: secrets.spreadsheetId,
                    range: `${year}!A${index + 2}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values }
                }).then(response => {
                    toast.success("Workout deleted");
                })
            });
        });
    }

    updateSelected = (id, checked) => {
        if (checked) {
            this.setState({ selected: [...this.state.selected, id] });
        } else {
            this.setState({ selected: this.state.selected.filter(selectedId => selectedId !== id) })
        }
    }

    handleSelectAll = (event, checked) => {
        const selected = checked ? this.state.workouts.map(workout => workout.id) : [];
        this.setState({ selected });
    }

    getYear = () => {
        const date = new Date();
        return (date.getYear() + 1900).toString();
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
                <ToastContainer
                    position={toast.POSITION.TOP_LEFT}
                    toastClassName='toast'
                />
                <div className='grid-container'>
                    <div className='title'>
                        <div style={{ verticalAlign: 'center' }}>
                            <img className='logo' src={logo} />
                            <span className='title-text'>Axercise</span>
                        </div>
                    </div>
                    <div className='progress-bars'>
                        <div id='sign-in-button' className='sign-in'></div>
                        <WorkoutProgress className='progress-bar-left' label='Monthly Progress' progress={monthProgress} />
                        <WorkoutProgress className='progress-bar-right' label='Yearly Progress' progress={yearProgress} />
                    </div>
                    <div className='workout-table'>
                        <WorkoutTable
                            workouts={this.state.workouts}
                            selected={this.state.selected}
                            deleteWorkout={this.deleteWorkout}
                            updateWorkout={this.updateWorkout}
                            updateSelected={this.updateSelected}
                            handleSelectAll={this.handleSelectAll}
                            calcPoints={this.calcPoints}
                        />
                    </div>
                    <div className='buttons'>
                        <Button className='button' color='primary' variant='contained' onClick={this.addWorkout}>
                            Add Workout<Add className='icon' />
                        </Button>
                        <Button className='button' color='secondary' variant='contained' onClick={this.saveWorkouts}>
                            Save Workouts<LockOutlined className='icon' />
                        </Button>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));