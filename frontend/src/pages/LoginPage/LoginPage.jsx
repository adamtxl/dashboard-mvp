import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api/auth";
import { useAuth } from "../../AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await loginUser(username, password);
    login(data.access_token); 
    navigate("/dashboard");
  } catch (err) {
    setError("Login failed. Please check your credentials.");
  }
};

  return (
    <div className="p-4">
      <h2>Login</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          className="form-control my-2"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="form-control my-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-info mt-2" type="submit">
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
