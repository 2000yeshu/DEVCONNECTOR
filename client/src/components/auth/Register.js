import React, { Fragment, useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import { register, sendEmail } from "../../actions/auth";
import PropTypes from "prop-types";
import store from "../../store.js";
import { EMAIL_VERIFIED } from "../../actions/types.js";

const Register = ({
  setAlert,
  register,
  isAuthenticated,
  sendEmail,
  emailLoading,
  emailSent,
  emailVerified,
}) => {
  useEffect(() => {
    var es = new EventSource("http://localhost:7000/api/verify/stream");
    es.addEventListener("email verified", function (event) {
      console.log(event, "event");
      store.dispatch({
        type: EMAIL_VERIFIED,
      });
    });
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { name, email, password, password2 } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("Passwords do not match", "danger", 2000);
    } else {
      register({ name, email, password });
    }
  };

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={(e) => onChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => onChange(e)}
          />
          <small className="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <button
          type="button"
          class="btn btn-light"
          onClick={() => {
            console.log("button clicked", email);
            sendEmail({ email: email });
          }}
        >
          Verify E-mail
        </button>
        <div>
          {emailLoading && <h1>Loading gif...</h1>}
          {emailVerified && <h1>Email verified.</h1>}
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => onChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={(e) => onChange(e)}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  sendEmail: PropTypes.func.isRequired,
  emailLoading: PropTypes.bool.isRequired,
  emailSent: PropTypes.bool.isRequired,
  emailVerified: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  emailLoading: state.auth.emailLoading,
  emailSent: state.auth.emailSent,
  emailVerified: state.auth.emailVerified,
});

export default connect(mapStateToProps, {
  setAlert,
  register,
  sendEmail,
})(Register);
