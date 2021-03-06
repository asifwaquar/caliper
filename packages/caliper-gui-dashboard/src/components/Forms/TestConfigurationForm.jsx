/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/*!

=========================================================
* Hyperledger Caliper GUI
=========================================================

* Author: Jason You
* GitHub: 
* Licensed under the Apache 2.0 - https://www.apache.org/licenses/LICENSE-2.0

Copyright (c) 2019 Jason You

*/


import React from "react";
import {
  Alert,
  Card,
  CustomInput, 
  Form, 
  FormGroup,
  Label, 
  CardBody, 
  Button, 
  CardHeader, 
  CardTitle
} from "reactstrap";
// for API file POST
import axios from "axios";
let api = "http://localhost:3001/v1/test-config";
const mime = require("mime-types");

export default class TestConfigurationForm extends React.Component {
  state = {
    file: null,
    uploaded: false,
    wrongMimeType: false,
  }

  handleFile = (event) => {
    if (this.state.uploaded) {
      // no need to add file if already uploaded
      return;
    }
    let file = event.target.files[0];
    let mimeType = mime.lookup(file.name);
    console.log("[DEBUG FILE]", file);
    console.log("[DEBUG mimeType]", mimeType);
    if (!["text/vnd.yaml", "text/yaml", "text/x-yaml", "application/x-yaml"].includes(mimeType)) {
      this.removeFile();  // clean the file state
      this.setState({ wrongMimeType: true });
      // make the alert disappear in 3 seconds
      setInterval(() => this.setState({ wrongMimeType: false}), 3000);
    } else {
      this.setState({ file: file });
    }
    event.target.value = "";  // so same file selection can still trigger onChange
  }

  handleUpload = () => {
    if (!this.state.file) {
      // no action for empty file input
      return;
    }

    let file = this.state.file;
    let formData = new FormData();
    formData.append("test-config-file", file);
    let contentType = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
    
    // Sending the config file with axios API POST
    axios.post(api, formData, contentType)
    // axios.post(api, formData)    // debug
    .then((res) => {
      console.log("[axios RES]", res);
      if (res.status === 200) {
        // update the parent state of test config file upload
        this.setState({ uploaded: true });
        this.props.action(true);    // let the parent component know the upload success
      }
    })
    .catch((err) => {
      console.log("[axios ERR]", err);
    });
  }

  setUploaded = (bool) => {
    this.setState({
      uploaded: bool,
    })
  }

  removeFile = () => {
    this.setState({
      file: null,
      uploaded: false,
    });
    this.props.action(false);   // let the parent componenet know the file is removed
  }

  onDismiss = () => {
    this.setState({ wrongMimeType: false });
  }

  render() {
    return (
      <>
        <Card>
          <CardHeader className="text-center">
            <CardTitle tag="h4">Test Configuration (<i>Only .yaml File</i>)</CardTitle>
            <p className="card-category">Upload Your Own Hyperledger Network Configuration File.</p>
            <p className="card-category text-primary">You can easily <b>generate new test config file with the form below</b> too!</p>
            <hr />
            <p className="card-category">Or Click The <b>Using Sample Config File</b> Button Above.</p>
          </CardHeader>
          <CardBody>
            <Form>
              <FormGroup>
                <Label for="testConfigFileBrowser">Add your own test config file here</Label>
                {/*
                  Remember to disable the file browser when test is running!
                  Just add a "disabled" attribute in <CustomInput disabled />
                */}
                <CustomInput type="file" id="testConfigFileBrowser" name="test-config-file" label="Pick your own test benchmark file..." onChange={(event) => this.handleFile(event) } />
              </FormGroup>
            </Form>
            <div className="text-center">
              {
                this.state.file !== null && this.state.file !== undefined && !this.state.uploaded
                ?
                <>
                  <p className="card-category">The file <b>{this.state.file.name}</b> is added</p>
                </>
                :
                null
              }

              {/* Display the upload button when the file is added */}
              {
                !this.state.uploaded
                ?
                <Button color="primary" style={{width:"300px"}} onClick={this.handleUpload}>
                  Upload
                </Button>
                :
                <Alert color="primary">
                  Test Config File Uploaded! Click on <b>Start Test</b> Above To Start Test!
                  <hr />
                  Press <b>RESET</b> to replace with different config files.
                </Alert>
              }
              <Alert color="danger" isOpen={this.state.wrongMimeType} toggle={this.onDismiss}>
                Only YAML Config File Is Allowed
              </Alert>
            </div>
          </CardBody>
        </Card>
      </>
    );
  }
}