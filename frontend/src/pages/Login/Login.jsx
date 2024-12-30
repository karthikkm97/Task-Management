import { Link, useNavigate } from "react-router-dom"
import PasswordInput from "../../components/Input/PasswordInput"
import { useState } from "react";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message

  const handleLogin = async (e) => {
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
    
    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });
  
      console.log("Response received:", response);
  
      // Handle response after login attempt
      if (response.data && !response.data.error && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        setSuccessMessage("Login successful! Redirecting to dashboard...");
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate("/dashboard"); // Redirect after success
        }, 2000); // Delay for 2 seconds
      } else {
        setError(response.data.message || "An unexpected error occurred");
        // Clear the error message after 1 second
        setTimeout(() => setError(null), 1000);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login First to access the Dashboard");
      // Clear the error message after 1 second
      setTimeout(() => setError(null), 1000);
      navigate("/login");
    }
  };
  

  return (
    <>
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
            <form onSubmit={handleLogin}>
                <h4 className="text-2xl mb-7">Login</h4>
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
                <input type="email" placeholder="Enter Email" className="input-box" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
 
                <button type="submit" className="btn-primary">Login</button>

                <p className="text-sm text-center mt-4">
                    Not Registered yet? <Link to="/signup" className="">Create an Account</Link>
                </p>
            </form>
        </div>
      </div>
    </>
  )
}

export default Login;
