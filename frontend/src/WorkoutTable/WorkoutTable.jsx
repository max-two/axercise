import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';

import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';


class WorkoutTable extends React.Component {

    handleSelect = (id, event, checked) => {
        this.props.updateSelected(id, checked);
    }

    handleDateChange = (id, selectedDate) => {
        this.props.updateWorkout(id, { date: selectedDate });
    }

    handleDescriptionChange = (id, event) => {
        this.props.updateWorkout(id, { description: event.target.value });
    }

    handleTeamEventChange = (id, event, checked) => {
        let update = { teamEvent: checked };
        if (!checked) update.organized = checked;

        this.props.updateWorkout(id, update);
    }

    handleOrganizedChange = (id, event, checked) => {
        let update = { organized: checked };
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
                        <Checkbox
                            checked={this.props.selected.includes(id)}
                            onChange={this.handleSelect.bind(null, id)}
                        />
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
        const numSelected = this.props.selected.length;

        return (
            <React.Fragment>
                <Toolbar>
                    <div className="table-title">
                        {numSelected > 0 ? (
                            <Typography variant="subtitle1">
                                {numSelected} selected
                            </Typography>
                        ) : (
                                <Typography variant="h5" className="table-title">
                                    Workouts
                            </Typography>
                            )}
                    </div>
                    <div className="spacer"></div>
                    <div>
                        {numSelected > 0 ? (
                            <Tooltip title="Delete">
                                <IconButton aria-label="Delete">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        ) : (
                                <Tooltip title="Filter list">
                                    <IconButton aria-label="Filter list">
                                        <FilterListIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                    </div>
                </Toolbar>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox onChange={this.props.handleSelectAll} />
                            </TableCell>
                            <TableCell> Date </TableCell>
                            <TableCell> Description </TableCell>
                            <TableCell> Team Event </TableCell>
                            <TableCell> Organized </TableCell>
                            <TableCell> Points </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className='table-body'>
                        {this.generateRows()}
                    </TableBody>
                </Table>
            </React.Fragment>
        )
    }
}

export default WorkoutTable;