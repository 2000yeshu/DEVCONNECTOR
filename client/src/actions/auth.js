import axios from "axios";
import { setAlert } from "./alert";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE,
  SEND_EMAIL,
  EMAIL_SENT,
  MAIL_SEND_ERROR,
  VERIFY_EMAIL,
  EMAIL_VERIFIED,
  VERIFY_EMAIL_ERROR,
} from "./types";
import setAuthToken from "../utils/setAuthToken";
import Cookies from "js-cookie";

import Config from "../config.js";

//Load User
export const loadUser = () => async (dispatch) => {
  console.log(Cookies.get("DC_ST"), "session cookie");

  try {
    const res = await axios.get("/api/auth");
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//Register User
export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await axios.post("/api/users", body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => {
        dispatch(setAlert(error.msg, "danger"));
      });
    }

    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

//Login User
export const login = ({ email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ email, password });
  try {
    //HERE IS THE ERROR

    const res = await axios.post("/api/auth", body, config);
    console.log("yes");
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => {
        dispatch(setAlert(error.msg, "danger"));
      });
    }

    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//send email
export const sendEmail = ({ email }) => async (dispatch) => {
  try {
    dispatch({
      type: SEND_EMAIL,
    });
    const body = JSON.stringify({ email });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const res = await axios.post("/api/verify/sendEmail", body, config);
    localStorage.setItem(Config.EmailLocalStorageKey, res.data);
    dispatch({
      type: EMAIL_SENT,
    });
    dispatch(setAlert(Config.MailSendSuccess, "success"));
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => {
        dispatch(setAlert(error.msg, "danger"));
      });
    }
    dispatch({
      type: MAIL_SEND_ERROR,
    });
  }
};

//verifyEmail
export const verifyEmail = () => async (dispatch) => {
  try {
    dispatch({
      type: VERIFY_EMAIL,
    });
    console.log("verify email action");
    const body = JSON.stringify({
      email: localStorage.getItem(Config.EmailLocalStorageKey),
    });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    console.log("verify email action");
    const res = await axios.post("/api/verify", body, config);
    console.log(res.data);
    dispatch({
      type: EMAIL_VERIFIED,
    });
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => {
        dispatch(setAlert(error.msg, "danger"));
      });
    }
    dispatch({
      type: VERIFY_EMAIL_ERROR,
    });
  }
};

//Logout
export const logout = () => async (dispatch) => {
  try {
    await axios.post("/api/auth/logout");
    dispatch({ type: CLEAR_PROFILE });
    dispatch({ type: LOGOUT });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};
