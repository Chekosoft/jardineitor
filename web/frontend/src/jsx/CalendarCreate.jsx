import React, {PropTypes} from 'react';
import axios from 'axios';
import classnames from 'classnames';

export default class CalendarCreate extends React.Component {
  constructor() {
    super();
    this.closeModal = this.closeModal.bind(this);
    this.sendNewCalendar = this.sendNewCalendar.bind(this);
    this.changeDay = this.changeDay.bind(this);
    this.changeTime = this.changeTime.bind(this);

    this.dayTranslations = ["Lun", "Mar", "Mié", "Jue", "Vie"
      , "Sab", "Dom"];

    this.state = {
      days: [false, false, false, false, false, false, false],
      time: null
    }
  }

  closeModal() {
    this.props.parent.setState({
      showCreateForm: false
    });
  }

  changeDay(e) {
    e.preventDefault();
    let days = this.state.days;
    days[e.target.name] = !days[e.target.name];
    this.setState({
      days
    });
  }

  changeTime(e) {
    e.preventDefault();
    this.setState({
      time: e.target.value
    })
  }

  sendNewCalendar(e) {
    e.preventDefault();
    axios.post('http://localhost:3389/api/calendar', {
      data: this.state
    }).then((res) => {
      let createdFields = res.data;
      let expectedFields = this.state.days.filter((x) => {return x}).length;
      if(createdFields < expectedFields) {
        this.props.parent.setNotification(
          `Se crearon ${createdFields} de las ${expectedFields} horas de regado.`,
          'warning'
        );
      } else if(!createdFields.length){
        this.props.parent.setNotification(
          'Los dias y horas indicados ya se encontraban programados.'
        );
      } else {
        this.props.parent.setNotification(
          'Se crearon todas las entradas del calendario'
        );
      }
      this.closeModal();
    }).catch((err) => {
      this.closeModal();
      this.props.parent.setNotification(
        'No se pudo agregar el programa requerido dado un problema del servidor.',
        'danger'
      )
    });
  }

  render() {
    let days = this.state.days;

    let dayButtons = this.state.days.map((day, index) => {
      let buttonClass = classnames('button', {'is-primary is-active ': day});
      return <button className={buttonClass} key={index}
        name={index} onClick={this.changeDay}>{this.dayTranslations[index]}</button>
    });

    return <div className="modal is-active">
      <div className="modal-background" onClick={this.closeModal} />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Agregar regado al calendario</p>
          <button className="delete" onClick={this.closeModal}></button>
        </header>
        <form onSubmit={this.sendNewCalendar}>
          <section className="modal-card-body">
            <div className="columns">
              <div className="column">
                <p>Dia de la Semana</p>
                <p className="control has-addons">
                  {dayButtons}
                </p>
              </div>
              <div className="column">
                <p>Hora del día</p>
                <p className="control">
                  <input className="input" type="time" onChange={this.changeTime}/>
                </p>
              </div>
            </div>
          </section>
          <div className="modal-card-foot">
            <button type="submit" className="button is-primary">
              Crear entrada
            </button>
            <a className="button is-danger is-pulled-right" onClick={this.closeModal}>
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  }
}
