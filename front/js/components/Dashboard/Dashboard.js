import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
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
    this.state = {
      projects: [],
      projectId: '',
      showAlert: false,
      alertMessage: '',
      sortableItems: sortableItems === null ? defaultItems : sortableItems,
      initialConfig: initialConfig === true,
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

        this.setState({
          projects: data.projects,
          sortableItems:
            data.sortable_items === null ? sortableItems : data.sortable_items,
        });
      })
      .catch(() => {});
  };

  handleProjectChange = (event) => {
    const { value } = event.target;
    this.setState({ projectId: value });
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
    } = this.state;

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
        vpi: <VPI projectId={projectId} />,
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

    if (!initialConfig) {
      return <Redirect to="/initial-config-step-1" />;
    }

    if (projects.length <= 0) {
      return 'Loading...';
    }

    return (
      <section className="pb-4">
        {alert}
        <Navbar projects={projects} />
        <Container className="pt-5 mb-5">
          <Row className="pt-4">
            <Col xs={12}>
              <Form>
                <div className="mb-1">Projects Filter</div>
                <Form.Control
                  as="select"
                  size="lg"
                  onChange={this.handleProjectChange}
                >
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Control>
              </Form>
            </Col>
          </Row>
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
