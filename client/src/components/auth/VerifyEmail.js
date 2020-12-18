import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { verifyEmail } from "../../actions/auth";
import { connect } from "react-redux";

const VerifyEmail = ({ verifyEmail, emailVerifying, emailVerified }) => {
  useEffect(() => {
    verifyEmail();
  }, []);
  return (
    <React.Fragment>
      {emailVerifying && <div>Verifying your email.</div>}
      {!emailVerifying && emailVerified && <div>Email verified.</div>}
      {!emailVerifying && !emailVerified && <div>Error Occoured.</div>}
    </React.Fragment>
  );
};

VerifyEmail.propTypes = {
  verifyEmail: PropTypes.func.isRequired,
  emailVerifying: PropTypes.bool.isRequired,
  emailVerified: PropTypes.bool.isRequired,
};

const MSTP = (state) => ({
  emailVerifying: state.auth.emailVerifying,
  emailVerified: state.auth.emailVerified,
});

export default connect(MSTP, { verifyEmail })(VerifyEmail);
