import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  ACCOUNT_DELETED,
  SEND_EMAIL,
  EMAIL_SENT,
  MAIL_SEND_ERROR,
  VERIFY_EMAIL,
  EMAIL_VERIFIED,
  VERIFY_EMAIL_ERROR,
} from "../actions/types";
import Cookies from "js-cookie";

const initialState = {
  token: Cookies.get("DC_ST"),
  isAuthenticated: null,
  loading: true,
  user: null,
  emailLoading: false,
  emailSent: false,
  emailVerifying: false,
  emailVerified: false,
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      //localStorage.setItem("token", payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ERROR:
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case LOGOUT:
    case ACCOUNT_DELETED:
      //localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case SEND_EMAIL:
      return {
        ...state,
        emailLoading: true,
      };

    case EMAIL_SENT:
      return { ...state, emailLoading: false, emailSent: true };
    case MAIL_SEND_ERROR:
      return { ...state, emailLoading: false, emailSent: false };

    case VERIFY_EMAIL:
      return { ...state, emailVerifying: true };
    case EMAIL_VERIFIED:
      return { ...state, emailVerifying: false, emailVerified: true };
    case VERIFY_EMAIL_ERROR:
      return { ...state, emailVerifying: false, emailVerified: false };

    default:
      return state;
  }
}
