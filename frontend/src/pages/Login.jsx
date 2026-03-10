import React, { useState, useEffect } from "react";
import { loginService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const navigate = useNavigate();

  // ⭐ Clear stale/expired tokens so backend doesn't throw ExpiredJwtException
  useEffect(() => {
    // localStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("deptId");

  }, []);

  // Simple validations
  const validateForm = () => {
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setApiError("");

      const data = await loginService(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("id", data.id);
      localStorage.setItem("name", data.name);


      navigate("/dashboard");

    } catch (error) {
      setApiError(error?.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Welcome</h2>
        <p className="login-subtitle">Please login to continue</p>

        {apiError && <p className="error-text">{apiError}</p>}

        {/* ⭐ noValidate disables browser popup */}
        <form onSubmit={handleLogin} noValidate>
          <div className="input-group-custom">
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <small className="error-text">{errors.email}</small>}
          </div>

          <div className="input-group-custom">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <small className="error-text">{errors.password}</small>
            )}
          </div>


          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <style>{`
        .login-wrapper {
          height: 100vh;
          background-color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .login-card {
          width: 380px;
          background-color: white;
          padding: 35px;
          border-radius: 14px;
          box-shadow: 0px 6px 20px rgba(0,0,0,0.25);
          text-align: center;
        }

        .login-title {
          color: #0C120C;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .login-subtitle {
          color: #6D7275;
          font-size: 14px;
          margin-bottom: 25px;
        }

        .error-text {
          color: red;
          font-size: 13px;
          margin-top: 4px;
          display: block;
          font-weight: bold;
        }

       .input-group-custom {
          text-align: left;
          margin-bottom: 18px;
        }

        .input-group-custom input:focus {
          border-color: #F15E2E;
          box-shadow: 0px 0px 6px rgba(241, 94, 46, 0.4);
        }

        .input-group-custom label {
          display: block;
          margin-bottom: 6px;
          color: #0C120C;
          font-weight: 600;
        }


        .input-group-custom input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
        
          border: 1px solid #6D7275;
          outline: none;
          transition: 0.2s;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background-color: #F15E2E;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          color: white;
          cursor: pointer;
        }

        .login-btn:hover {
          background-color: #cf4e24;
        }

        .login-btn:disabled {
          background-color: #c9c9c9;
          cursor: not-allowed;
        }
        .password-wrapper {
          position: relative;
        }
        
        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #F15E2E;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .toggle-password:hover {
          
          font-size: 14px;
        }
        
      `}</style>
    </div>
  );
};

export default Login;
