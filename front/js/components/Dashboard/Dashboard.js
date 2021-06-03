import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import moment from 'moment';
import 'moment/min/locales';
import { DatePickerInput } from 'rc-datepicker';
import Footer from '../Shared/Footer';
import Activities from './Activities';
import VSM from './VSM';
import VPI from './VPI';
import Focus from './Focus';
import Gauge from './Gauge';
import WIP from './WIP';
import Navbar from './Navbar';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    const defaultItems = ['vpi', 'wip', 'gauge', 'focus', 'activities', 'vsm'];
    const user = JSON.parse(localStorage.getItem('user'));
    const sortableItems = user.sortable_items;
    const initialConfig = user.initial_config;
    const initialConfigStep = user.initial_config_step;
    const validStep = [1, 2, 3, 4, 5].includes(initialConfigStep);
    this.state = {
      projects: [],
      projectId: '',
      showAlert: false,
      alertMessage: '',
      sortableItems: sortableItems === null ? defaultItems : sortableItems,
      initialConfig: initialConfig === true,
      initialConfigStep: validStep ? initialConfigStep : 1,
      loading: true,
      projectEndDate: null,
    };
  }

  componentDidMount = () => {
    this.fetchInitData();
  };

  fetchInitData = () => {
    axios
      .get(`/dashboard/projects.json`)
      .then((response) => {
        const { data } = response;
        const { sortableItems } = this.state;
        const { projects } = data;
        let projectId = '';
        let projectEndDate = null;
        if (projects.length > 0) {
          projectId = projects[0].project_id;
          projectEndDate = projects[0].end_date;
        }

        this.setState({
          projects,
          projectId,
          projectEndDate,
          sortableItems:
            data.sortable_items === null ? sortableItems : data.sortable_items,
        });
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleProjectChange = (event) => {
    const { value } = event.target;
    const { projects } = this.state;
    const projectEndDate = projects.filter(
      (project) => project.project_id === value,
    )[0].end_date;

    this.setState({ projectId: value, projectEndDate });
  };

  handleDateChange = (jsDate, dateString) => {
    const projectEndDate = moment(dateString).format('DD/MM/YYYY');
    this.updateProjectEndDate(projectEndDate);
  };

  handleDateClear = () => {
    this.updateProjectEndDate(null);
  };

  updateProjectEndDate = (projectEndDate) => {
    const { projectId } = this.state;
    const reqData = { end_date: projectEndDate };

    axios
      .patch(`/dashboard/${projectId}.json`, reqData)
      .then((response) => {
        const { data } = response;

        this.setState({
          projects: data.projects,
          projectEndDate,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  handleDateKeyDown = (event) => {
    event.preventDefault();
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return;
    }

    let { sortableItems } = this.state;
    sortableItems = arrayMove(sortableItems, oldIndex, newIndex);
    this.setState({ sortableItems });

    const data = { user: { sortable_items: sortableItems } };
    axios.put('/users/update.json', data);
  };

  render() {
    const {
      projects,
      showAlert,
      alertMessage,
      sortableItems,
      projectId,
      initialConfig,
      initialConfigStep,
      loading,
    } = this.state;

    let { projectEndDate } = this.state;
    let alert;

    if (showAlert) {
      const alertStyle = {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 2,
        width: '25%',
      };

      alert = (
        <Alert variant="danger" style={alertStyle}>
          <span>{alertMessage}</span>
        </Alert>
      );
    }

    const SortableItem = SortableElement(({ value }) => {
      const sections = {
        wip: <WIP projectId={projectId} />,
        gauge: <Gauge projectId={projectId} />,
        focus: <Focus projectId={projectId} />,
        vpi: <VPI projectId={projectId} projectEndDate={projectEndDate} />,
        activities: <Activities projectId={projectId} />,
        vsm: <VSM projectId={projectId} />,
      };

      return sections[value];
    });

    const SortableList = SortableContainer(({ items }) => {
      return (
        <div>
          {items.map((value, index) => (
            <SortableItem key={`item-${value}`} index={index} value={value} />
          ))}
        </div>
      );
    });

    if ([null, undefined, '', NaN].includes(projectEndDate)) {
      projectEndDate = '';
    } else {
      projectEndDate = moment(projectEndDate, 'DD/MM/YYYY');
    }

    if (!initialConfig) {
      return <Redirect to={`/initial-config-step-${initialConfigStep}`} />;
    }

    if (loading) {
      return 'Loading...';
    }

    if (projects.length <= 0) {
      return (
        <section className="pb-4">
          <Navbar projects={[]} />
          <Container className="pt-5 mb-5">
            <div style={{ marginTop: '200px', textAlign: 'center' }}>
              No projects found! Sync projects to view the dashboard sections.
            </div>
          </Container>
          <Footer />
        </section>
      );
    }

    return (
      <section className="pb-4">
        {alert}
        <Navbar projects={projects} />
        <Container className="pt-5 mb-5">
          <Form>
            <Row className="pt-4">
              <Col xs={8}>
                <div className="mb-1">Projects Filter</div>
                <Form.Control
                  as="select"
                  size="md"
                  onChange={this.handleProjectChange}
                >
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col xs={4}>
                <div className="mb-1">Project End Date</div>
                <DatePickerInput
                  defaultValue={projectEndDate}
                  value={projectEndDate}
                  onChange={this.handleDateChange}
                  className="datepicker-component"
                  locale="en"
                  onClear={this.handleDateClear}
                  onKeyDown={this.handleDateKeyDown}
                  showOnInputClick
                />
              </Col>
            </Row>
          </Form>
          <SortableList
            items={sortableItems}
            onSortEnd={this.onSortEnd}
            useDragHandle
          />
        </Container>
        <Footer />
      </section>
    );
  }
}
