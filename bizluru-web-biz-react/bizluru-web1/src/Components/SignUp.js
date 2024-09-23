import React, { useState } from "react";
import "./styles.scss";
// import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [response, setResponse] = useState("");
  // const navigate = useNavigate();

  const handleSignup = async (loginMethod) => {
    const requestData = {
      login_method: loginMethod,
    };

    try {

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

    console.log(response)
      if (response.ok) {
        const data = await response.json();
        window.location.replace(data["data"])
        setResponse(data);
        console.log("data", data); 
      } else {
        setResponse("An error else occurred.");
      }
    } catch (error) {
      console.error(error);
      setResponse("An error catch occurred.");
    }
  };

  return (
    <div className="height-100vh">
      <div className="logged_in_nav"></div>
      <div className="flex flex_column height-80vh">
        <div className="flex height-40vh">
          <div className="card height-315 width-335">
            <div className="flex_column">
              <div>
                <span>Log in with SSO</span>
              </div>
              <hr
                style={{
                  width: "100%",
                  marginTop: "15px",
                  marginBottom: "20px",
                }}
              />
              <button
                onClick={() => handleSignup("GoogleOAuth")}
                className="card login_button google_button"
              >
                <span>Continue With Google</span>
              </button>
              <button
                onClick={() => handleSignup("phone")}
                className="card login_button phone_button"
              >
                <span>Sign Up With Mobile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

  
    </div>
  );
}

export default SignUp;
