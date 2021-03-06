import React, { Component } from 'react';
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import { SketchPicker } from 'react-color';
import firebase from '../config/firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions';

class ColorPanel extends Component {
    state = {
        modal: false,
        primary: '',
        secondary: '',
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        userColors: []
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
    }

    addListener = (userId) => {
        let userColors = [];
        this.state.usersRef
            .child(`${userId}/colors`)
            .on('child_added', snap => {
                userColors.unshift(snap.val())
                console.log(userColors);
                this.setState({ userColors })
            })

    }

    openModal = () => this.setState({modal: true});

    closeModal = () => this.setState({modal: false});

    handlePrimaryColor = (color) => {
        this.setState({primary: color.hex});
    }

    handleSecondaryColor = (color) => {
        this.setState({secondary: color.hex});
    }

    handleSaveColors = () => {
        if (this.state.primary && this.state.secondary) {
            this.saveColors(this.state.primary, this.state.secondary);
        }
    };

    saveColors = (primary, secondary) => {
        this.state.usersRef
          .child(`${this.state.user.uid}/colors`)
          .push()
          .update({
            primary,
            secondary
          })
          .then(() => {
            console.log("Colors added");
            this.closeModal();
          })
          .catch(err => console.error(err));
      };

      displayUserColors = (colors) => (
          colors.length > 0 && colors.map((color, i) => (
              <React.Fragment key={i}>
                <Divider />
                <div className="color_container" onClick={() => this.props.setColors(color.primary, color.secondary)}>
                  <div className="color_square" style={{background: color.primary}}>
                    <div className="color_overlay" style={{background: color.secondary}}/>
                  </div>
                </div>
              </React.Fragment>
          ))
      )


    render() {
        const { modal, primary, secondary,userColors } = this.state;
        return (
           <Sidebar
           as={Menu}
           icon="labeled"
           inverted
           vertical
           visible
           width='very thin'
           >
            <Divider/>
            <Button icon='add' size='small' color='blue' onClick={this.openModal}/>
            {this.displayUserColors(userColors)}

            {/* Color picker modal */}
            <Modal basic open={modal} onClose={this.closeModal}>
                <Modal.Header>Choose App Colors</Modal.Header>
                  <Modal.Content>
                    <Segment inverted>
                        <Label content="Primary Color" />
                        <SketchPicker color={primary} onChange={this.handlePrimaryColor}/>
                    </Segment>

                    <Segment inverted>
                        <Label content="Secondar Color" />
                        <SketchPicker color={secondary} onChange={this.handleSecondaryColor} />
                    </Segment>
                  </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={this.handleSaveColors}>
                        <Icon name="checkmark"/> Save Colors
                    </Button>
                    <Button color="red" inverted onClick={this.closeModal}>
                        <Icon name="remove"/> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
           </Sidebar>
        )
    }
}

export default connect(null, { setColors })(ColorPanel);