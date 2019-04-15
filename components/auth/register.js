import React, { Component } from "react";
import { View, Text, AsyncStorage } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };
    this.signUp = this.signUp.bind(this);
  }
  static navigationOptions = {
    title: "Register"
  };

  signUp() {
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (emailRegex.test(this.state.email) && this.state.password) {
      console.log(
        "User clicked sign Up",
        this.state.email,
        this.state.password
      );
      // Check server if user exists
      fetch(
        `http://ec2-18-185-12-227.eu-central-1.compute.amazonaws.com:3000/user/email/${
          this.state.email
        }`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      )
        
        .then(res => {
           const resBody = JSON.parse(res._bodyText)

          if (resBody.length > 0) {
            alert("User already exists");
          } else {
            //   Create new user in Mongo user collection

            const body = {
              email: this.state.email,
              password: this.state.password
            };

            const postBody = JSON.stringify(body);

            fetch(
              `http://ec2-18-185-12-227.eu-central-1.compute.amazonaws.com:3000/user/`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                body: postBody
              }
            )
            .then(res => {
                // // set returned user _id in local storage
                console.log("User created: ", res)
                alert("Account created")
                AsyncStorage.setItem("gym-tracker-userId", res._bodyText)
                .then(() => {
                    // Call func inside auth/ index passed as props, which checks for local storage again and forwards to workouts screen
                    AsyncStorage.getItem("gym-tracker-userId")
                    .then(doc => {
                      console.log("gym-tracker-userId in local storage: ", JSON.parse(doc))
                      const { navigation } = this.props;
                      const userRegistered = navigation.getParam("userRegistered");
                      userRegistered(JSON.parse(doc))
                    })
                    .catch(err => console.log("Error: ", err))
                    
                })
                .catch(err => console.log("Error: ", err
                ))
                
                
            })
            .catch(error => console.log("Error in fetch:", error));
          }
        })
        .catch(err => console.log("error in fetch get useremail: ", err));

      
    } else {
      alert("Please enter an email and password");
    }
  }

  render() {
    return (
      <View>
        <Text> Register for Gym Tracker: </Text>
        <View>
          <TextInput
            mode="outlined"
            label="Email"
            placeholder="Email"
            onChangeText={e => this.setState({ email: e.toLowerCase() })}
            value={this.state.email}
          />
          <TextInput
            mode="outlined"
            label="Password"
            placeholder="Password"
            onChangeText={e => this.setState({ password: e })}
            value={this.state.password}
            secureTextEntry={true}
          />
          <Button mode="contained" onPress={() => this.signUp()}>
            Sign Up
          </Button>
        </View>
      </View>
    );
  }
}