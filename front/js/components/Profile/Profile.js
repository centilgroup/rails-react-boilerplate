/**
 * @file Profile component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Figure from 'react-bootstrap/Figure';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.photoUpload = React.createRef();
    this.state = {
      first_name: '',
      last_name: '',
      username: '',
      company_name: '',
      jira_url: '',
      api_version: '',
      jira_username: '',
      jira_password: '',
      avatar: '',
      avatar_link: '',
    };
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('user'));
    this.setState(user);
    if (user.avatar) {
      this.setState({ avatar_link: user.avatar });
    }
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handlePhotoClick = () => {
    this.photoUpload.current.click();
  };

  handlePhotoChange = (e) => {
    this.setState({ avatar_link: URL.createObjectURL(e.target.files[0]) });
    this.setState({ avatar: e.target.files[0] });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      first_name,
      last_name,
      username,
      company_name,
      jira_url,
      api_version,
      jira_username,
      jira_password,
      avatar,
    } = this.state;
    const data = new FormData();
    if (typeof avatar !== 'string') {
      data.append('user[avatar]', avatar);
    }
    data.append('user[first_name]', first_name);
    data.append('user[last_name]', last_name);
    data.append('user[username]', username);
    data.append('user[company_name]', company_name);
    data.append('user[jira_url]', jira_url);
    data.append('user[api_version]', api_version);
    data.append('user[jira_username]', jira_username);
    data.append('user[jira_password]', jira_password);

    axios.put('/users/profile.json', data).then((response) => {
      const profile_data = response.data;
      localStorage.setItem('user', JSON.stringify(profile_data));
      if (profile_data.avatar) {
        this.setState({ avatar_link: profile_data.avatar });
      }
    });
  };

  render() {
    const {
      first_name,
      last_name,
      username,
      company_name,
      jira_url,
      api_version,
      jira_username,
      jira_password,
      avatar_link,
    } = this.state;

    return (
      <>
        <Container>
          <Form>
            <h4>Profile Section</h4>
            <Row>
              <Col xs={3}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={first_name}
                    name="first_name"
                    type="text"
                    placeholder="First Name"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={last_name}
                    name="last_name"
                    type="text"
                    placeholder="Last Name"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={username}
                    name="username"
                    type="text"
                    placeholder="Username"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={company_name}
                    name="company_name"
                    type="text"
                    placeholder="Company Name"
                  />
                </Form.Group>
              </Col>
              <Col xs={{ span: 3, offset: 2 }}>
                <Form.Group>
                  <Form.File
                    className="d-none"
                    name="profile_photo"
                    ref={this.photoUpload}
                    onChange={this.handlePhotoChange}
                  />
                  <Figure onClick={this.handlePhotoClick}>
                    <Figure.Image
                      src={avatar_link || '/avatar.jpg'}
                      roundedCircle
                      width={160}
                      height={160}
                      alt="avatar"
                    />
                    <Figure.Caption className="text-center font-weight-bold">
                      Add Photo
                    </Figure.Caption>
                  </Figure>
                </Form.Group>
              </Col>
            </Row>
            <hr />
            <h4>Jira Link</h4>
            <Row>
              <Col xs={3}>
                <Form.Group>
                  <Form.Label>Jira URL</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={jira_url}
                    name="jira_url"
                    type="text"
                    placeholder="Jira URL"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>API Version</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={api_version}
                    name="api_version"
                    type="text"
                    placeholder="API Version"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Jira Username</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={jira_username}
                    name="jira_username"
                    type="text"
                    placeholder="Jira Username"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Jira Password</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={jira_password}
                    name="jira_password"
                    type="password"
                    placeholder="Jira Password"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="outline-primary"
              type="submit"
              onClick={this.handleSubmit}
            >
              Update
            </Button>
          </Form>
        </Container>

        <hr />

        <div className="m-3">Centil, LLC 2021.</div>
      </>
    );
  }
}
