import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';

import TextField from '@material-ui/core/TextField';

import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';


class WorkoutTable extends React.Component {

    handleDateChange = (id, selectedDate) => {
        this.props.updateWorkout(id, { date: selectedDate });
    }

    handleDescriptionChange = (id, event) => {
        this.props.updateWorkout(id, { description: event.target.value });
    }

    handleTeamEventChange = (id, event, checked) => {
        this.props.updateWorkout(id, { teamEvent: checked });
    }

    handleOrganizedChange = (id, event, checked) => {
        let update = { organized: checked }
        if (checked) update.teamEvent = checked;

        this.props.updateWorkout(id, update);
    }

    componentDidUpdate(prevProps) {
        if (this.props.workouts.length > prevProps.workouts.length) {
            document.getElementById(`description-${this.props.workouts.length - 1}`).focus();
        }
    }

    generateRows = () => {
        return this.props.workouts.map((workout, index) => {
            const id = workout.id;

            return (
                <TableRow key={`tableRow-${id}`} hover>
                    <TableCell padding="checkbox">
                        <Checkbox />
                    </TableCell>
                    <TableCell>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker
                                value={workout.date}
                                onChange={this.handleDateChange.bind(null, id)}
                            />
                        </MuiPickersUtilsProvider>
                    </TableCell>
                    <TableCell>
                        <TextField
                            id={`description-${index}`}
                            value={workout.description}
                            onChange={this.handleDescriptionChange.bind(null, id)}
                        />
                    </TableCell>
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={workout.teamEvent}
                            onChange={this.handleTeamEventChange.bind(null, id)}
                        />
                    </TableCell>
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={workout.organized}
                            onChange={this.handleOrganizedChange.bind(null, id)}
                        />
                    </TableCell>
                    <TableCell>
                        {this.props.calcPoints(workout)}
                    </TableCell>
                </TableRow>
            );
        })
    }

    render() {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox />
                        </TableCell>
                        <TableCell> Date </TableCell>
                        <TableCell> Description </TableCell>
                        <TableCell> Team Event </TableCell>
                        <TableCell> Organized </TableCell>
                        <TableCell> Points </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.generateRows()}
                </TableBody>
            </Table>
        )
    }
}

export default WorkoutTable;