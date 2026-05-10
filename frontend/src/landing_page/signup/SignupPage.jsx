import React, { useState } from "react";
import Signup from "./Signup";
import Login from "./Login";

function SignupPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div>
      {showLogin ? (
        <Login onSwitch={() => setShowLogin(false)} />
      ) : (
        <Signup onSwitch={() => setShowLogin(true)} />
      )}
    </div>
  );
}

export default SignupPage;
