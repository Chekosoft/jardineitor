import React, {PropTypes} from 'react';
import classnames from 'classnames';
import axios from 'axios';
import moment from 'moment';

import Jardineitor from './Jardineitor.jsx';

export default class EventTable extends React.Component {
  static get propTypes() {
    return {
      parent: PropTypes.instanceOf(Jardineitor).isRequired
    }
  }

  constructor() {
    super()
    this.state = {
      entries: [],
      loading: true
    };
  }

  componentWillMount() {
    axios.get('http://localhost:3389/api/events')
    .then((res) => {
      this.setState({
        entries: res.data,
        loading: false
      });
    });
  }

  componentDidMount() {
    this.props.parent.ws.on('new_event', (message) => {
      let entries = [message.event, ...this.state.entries];
      this.setState({
        entries
      });
    })
  }

  render() {
    let entries;
    if(this.state.loading) {
      entries = (
        <tr>
          <td colSpan="2" className="has-text-centered">
            <strong>Cargando lista de eventos</strong>
          </td>
        </tr>
      );
    } else if(this.state.entries.length == 0) {
      entries = (
        <tr>
          <td colSpan="2" className="has-text-centered">
            <strong>No hay eventos</strong>
          </td>
        </tr>
      )
    } else {
      entries = this.state.entries.map((entry) => {
        let type;
        switch(entry.event) {
          case "forced":
            type = "Riego por demanda.";
            break;
          case "scheduled":
            type = "Riego calendarizado.";
            break;
          case "emergency":
            type = "Riego de emergencia.";
            break;
        }
        return (
          <tr key={entry.id}>
            <td>{moment(entry.created_at).format("DD/MM/YYYY HH:mm:ss")}</td>
            <td>{type}</td>
          </tr>
        )
      });
    }

    return (
      <table className="table is-striped">
        <thead>
          <tr>
            <th>Fecha de Evento</th>
            <th>Tipo de Evento</th>
          </tr>
        </thead>
        <tbody>
          {entries}
        </tbody>
      </table>
    )
  }
}
