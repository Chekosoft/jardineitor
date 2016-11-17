import React, {PropTypes} from 'react';
import moment from 'moment';
import axios from 'axios';

import Jardineitor from './Jardineitor.jsx';

export default class Calendar extends React.Component {
  static get propTypes() {
    return {
      parent: PropTypes.instanceOf(Jardineitor).isRequired
    }
  }

  constructor() {
    super();
    this.state = {
      entries: [],
      loaded: false
    }

    this.dowNames = ['Lunes', 'Martes', 'Miércoles',
      'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    this.getTodaysProgramme = this.getTodaysProgramme.bind(this);
  }

  componentWillMount() {
    this.getTodaysProgramme();
    this.props.parent.ws.on('update_calendar', () => {
      this.getTodaysProgramme();
    });
  }

  getTodaysProgramme() {
    axios.get('http://localhost:3389/api/calendar')
    .then((res) => {
      this.setState({
        entries: res.data,
        loaded: true
      });
    }).catch((err) => {
      this.setState({
        entries: null,
        loaded: true
      })
    });
  }


  render() {
    let tableEntries = null
    if(!this.state.loaded) {
      tableEntries = <tr>
      <td colspan="2" className="has-text-centered is-info"> Cargando calendario </td>
      </tr>
    } else if(!this.state.entries) {
      tableEntries = <tr>
      <td colspan="2"  className="has-text-centered is-danger"> Hubo un problema al cargar el calendario de riego.</td>
      </tr>
    } else if(!this.state.entries.length) {
      tableEntries = <tr>
      <td colspan="2" className="has-text-centered is-warning"> No hay mas riegos programados para hoy. </td>
      </tr>
    }
    else {
      tableEntries = this.state.entries.map((entry) => {
        return <tr key={entry.id}>
        <td> {this.dowNames[entry.dow - 1]} </td>
        <td> {moment(entry.time, "HHmm").format("HH:mm")} </td>
        </tr>
      });
    }

    return (
    <div className="content">
      <table className="table is-striped">
      <thead>
        <tr>
          <th>Día de la semana</th>
          <th>Hora de riego</th>
        </tr>
      </thead>
      <tbody>
        {tableEntries}
      </tbody>
      </table>
    </div>
    );
  }
}
