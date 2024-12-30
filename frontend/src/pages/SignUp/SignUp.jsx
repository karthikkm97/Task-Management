import { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      // Clear the error message after 1 second
      setTimeout(() => setError(null), 1000);
      return;
    }
  
    if (!password) {
      setError("Please enter the password");
      // Clear the error message after 1 second
      setTimeout(() => setError(null), 1000);
      return;
    }

    setError("");
    setSuccessMessage(""); // Reset success message

    // SignUp API
    try {
      const response = await axiosInstance.post("/create-account", {
        email: email,
        password: password,
      });

      // Handle successful registration response
      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        setSuccessMessage("Account created successfully");
        alert("Account created successfully");
        navigate("/login");
      }
    } catch (error) {
      // Handle registration error
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">Sign Up</h4>
            
            {/* Error and Success Alert Box */}
            {error && (
              <div className="bg-red-500 text-white p-3 mb-4 rounded">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500 text-white p-3 mb-4 rounded">
                {successMessage}
              </div>
            )}

            <input
              type="email"
              placeholder="Enter Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <button type="submit" className="btn-primary">
              Create Account
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
